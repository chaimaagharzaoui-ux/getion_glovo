from datetime import timedelta
from decimal import Decimal
from django.db.models import Sum, Avg, Count
from django.shortcuts import redirect, render
from django.utils import timezone
from django.views import View
from django.views.generic import TemplateView
from django.contrib import messages
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Entreprise, Produit, Transaction, TicketSupport
from .serializers import EntrepriseLoginSerializer, EntrepriseSerializer
from commandes.models import Commande


def _session_entreprise(request):
    eid = request.session.get("entreprise_id")
    if not eid:
        return None
    try:
        return Entreprise.objects.get(id=eid, valide=True)
    except Entreprise.DoesNotExist:
        return None


def _dashboard_stats(entreprise_id):
    auj = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    hier = auj - timedelta(days=1)
    cmd_auj = Commande.objects.filter(entreprise_id=entreprise_id, created_at__gte=auj).exclude(statut="annulee")
    ca_auj = cmd_auj.aggregate(t=Sum("montant_total"))["t"] or 0
    ca_hier = (
        Commande.objects.filter(entreprise_id=entreprise_id, created_at__gte=hier, created_at__lt=auj)
        .exclude(statut="annulee")
        .aggregate(t=Sum("montant_total"))["t"]
        or 0
    )
    variation = round(((ca_auj - ca_hier) / ca_hier) * 100) if ca_hier > 0 else 0
    en_cours = Commande.objects.filter(
        entreprise_id=entreprise_id,
        statut__in=["en_attente", "en_preparation", "en_livraison"],
    ).count()
    total = Commande.objects.filter(entreprise_id=entreprise_id).count()
    note = Commande.objects.filter(entreprise_id=entreprise_id, evaluation_note__isnull=False).aggregate(m=Avg("evaluation_note"))["m"]
    note_moy = round(note, 1) if note else None
    livrees = Commande.objects.filter(
        entreprise_id=entreprise_id,
        statut="livree",
        livree_at__gte=auj,
        acceptee_at__isnull=False,
    )
    if livrees.exists():
        durees = [
            (c.livree_at - c.acceptee_at).seconds / 60
            for c in livrees
            if c.livree_at and c.acceptee_at
        ]
        temps_moy = round(sum(durees) / len(durees)) if durees else None
    else:
        temps_moy = None
    total_r = Commande.objects.filter(entreprise_id=entreprise_id).count()
    non_ann = Commande.objects.filter(entreprise_id=entreprise_id).exclude(statut="annulee").count()
    acceptation = round((non_ann / total_r) * 100) if total_r > 0 else 100
    return {
        "ca_aujourdhui": float(ca_auj),
        "variation": variation,
        "total_commandes": total,
        "commandes_en_cours": en_cours,
        "note_moyenne": note_moy,
        "temps_livraison_moyen": temps_moy,
        "acceptation": acceptation,
    }


def _create_missing_transactions(entreprise_id):
    commission_rate = Decimal("0.15")
    deja_liees = Transaction.objects.filter(
        entreprise_id=entreprise_id, commande__isnull=False
    ).values_list("commande_id", flat=True)
    livrees = Commande.objects.filter(entreprise_id=entreprise_id, statut="livree").exclude(id__in=deja_liees)
    for c in livrees:
        brut = c.montant_total
        commission = (brut * commission_rate).quantize(Decimal("0.01"))
        net = (brut - commission).quantize(Decimal("0.01"))
        Transaction.objects.create(
            entreprise_id=entreprise_id,
            commande=c,
            montant_brut=brut,
            commission=commission,
            montant_net=net,
        )


class HomeView(TemplateView):
    template_name = "home.html"


class EntrepriseLoginPageView(View):
    template_name = "entreprise/login.html"

    def get(self, request):
        if _session_entreprise(request):
            return redirect("entreprise-dashboard")
        return render(request, self.template_name)

    def post(self, request):
        nom = request.POST.get("nom", "").strip()
        email = request.POST.get("email", "").strip().lower()
        mot_de_passe = request.POST.get("mot_de_passe", "")
        try:
            e = Entreprise.objects.get(email=email, nom__iexact=nom)
        except Entreprise.DoesNotExist:
            messages.error(request, "Nom de l'entreprise ou email incorrect")
            return render(request, self.template_name, status=401)
        if not e.check_password_raw(mot_de_passe):
            messages.error(request, "Mot de passe incorrect")
            return render(request, self.template_name, status=401)
        if not e.valide:
            messages.error(request, "Compte en attente de validation")
            return render(request, self.template_name, status=403)
        request.session["entreprise_id"] = e.id
        request.session["entreprise_nom"] = e.nom
        request.session["entreprise_avatar"] = e.avatar_emoji
        return redirect("entreprise-dashboard")


class EntrepriseLogoutPageView(View):
    def post(self, request):
        request.session.pop("entreprise_id", None)
        request.session.pop("entreprise_nom", None)
        request.session.pop("entreprise_avatar", None)
        return redirect("entreprise-login")


class DashboardEntreprisePageView(View):
    template_name = "entreprise/dashboard.html"

    def get(self, request):
        e = _session_entreprise(request)
        if not e:
            return redirect("entreprise-login")
        stats = _dashboard_stats(e.id)
        _create_missing_transactions(e.id)
        commandes = (
            Commande.objects.filter(entreprise_id=e.id)
            .select_related("client", "livreur")
            .order_by("-created_at")[:10]
        )
        return render(
            request,
            self.template_name,
            {
                "entreprise": e,
                "stats": stats,
                "commandes": commandes,
                "active_section": "dashboard",
            },
        )


class EntrepriseStatutPageView(View):
    def post(self, request):
        e = _session_entreprise(request)
        if not e:
            return redirect("entreprise-login")
        ouvert = request.POST.get("ouvert") == "true"
        e.ouvert = ouvert
        e.save(update_fields=["ouvert"])
        return redirect("entreprise-dashboard")


class CommandesPageView(View):
    template_name = "entreprise/commandes.html"

    def get(self, request):
        e = _session_entreprise(request)
        if not e:
            return redirect("entreprise-login")
        statut = request.GET.get("statut", "")
        recherche = request.GET.get("q", "").strip()
        qs = Commande.objects.filter(entreprise=e).select_related("client", "livreur").order_by("-created_at")
        if statut:
            qs = qs.filter(statut=statut)
        if recherche:
            qs = qs.filter(numero_sw__icontains=recherche)
        return render(
            request,
            self.template_name,
            {
                "entreprise": e,
                "commandes": qs[:100],
                "active_section": "commandes",
                "filtre_statut": statut,
                "q": recherche,
            },
        )


class CommandeStatutUpdatePageView(View):
    def post(self, request, commande_id):
        e = _session_entreprise(request)
        if not e:
            return redirect("entreprise-login")
        nouveau_statut = request.POST.get("statut")
        cmd = Commande.objects.filter(id=commande_id, entreprise=e).first()
        if not cmd:
            messages.error(request, "Commande introuvable.")
            return redirect("entreprise-commandes")
        cmd.statut = nouveau_statut
        if nouveau_statut == "livree" and not cmd.livree_at:
            cmd.livree_at = timezone.now()
        cmd.save(update_fields=["statut", "livree_at", "updated_at"])
        messages.success(request, "Statut commande mis a jour.")
        return redirect("entreprise-commandes")


class CataloguePageView(View):
    template_name = "entreprise/catalogue.html"

    def get(self, request):
        e = _session_entreprise(request)
        if not e:
            return redirect("entreprise-login")
        produits = Produit.objects.filter(entreprise=e).order_by("-created_at")
        return render(
            request,
            self.template_name,
            {"entreprise": e, "produits": produits, "active_section": "catalogue"},
        )

    def post(self, request):
        e = _session_entreprise(request)
        if not e:
            return redirect("entreprise-login")
        action = request.POST.get("action")
        if action == "create":
            Produit.objects.create(
                entreprise=e,
                nom=request.POST.get("nom", "").strip(),
                description=request.POST.get("description", "").strip(),
                prix=request.POST.get("prix") or 0,
                categorie=request.POST.get("categorie", "").strip(),
                disponible=request.POST.get("disponible") == "on",
            )
            messages.success(request, "Produit ajoute.")
        elif action == "toggle":
            p = Produit.objects.filter(id=request.POST.get("produit_id"), entreprise=e).first()
            if p:
                p.disponible = not p.disponible
                p.save(update_fields=["disponible", "updated_at"])
        elif action == "delete":
            Produit.objects.filter(id=request.POST.get("produit_id"), entreprise=e).delete()
            messages.success(request, "Produit supprime.")
        return redirect("entreprise-catalogue")


class StatistiquesPageView(View):
    template_name = "entreprise/statistiques.html"

    def get(self, request):
        e = _session_entreprise(request)
        if not e:
            return redirect("entreprise-login")
        now = timezone.now()
        debut_mois = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        qs = Commande.objects.filter(entreprise=e, created_at__gte=debut_mois)
        total = qs.count()
        ca = qs.exclude(statut="annulee").aggregate(v=Sum("montant_total"))["v"] or 0
        panier_moyen = (ca / total) if total else 0
        repartition = qs.values("statut").annotate(total=Count("id")).order_by()
        top_clients = (
            qs.values("client__prenom", "client__nom")
            .annotate(total=Count("id"))
            .order_by("-total")[:5]
        )
        return render(
            request,
            self.template_name,
            {
                "entreprise": e,
                "active_section": "statistiques",
                "total": total,
                "ca": ca,
                "panier_moyen": panier_moyen,
                "repartition": repartition,
                "top_clients": top_clients,
            },
        )


class FinancePageView(View):
    template_name = "entreprise/finance.html"

    def get(self, request):
        e = _session_entreprise(request)
        if not e:
            return redirect("entreprise-login")
        _create_missing_transactions(e.id)
        txs = Transaction.objects.filter(entreprise=e)
        brut = txs.aggregate(v=Sum("montant_brut"))["v"] or 0
        com = txs.aggregate(v=Sum("commission"))["v"] or 0
        net = txs.aggregate(v=Sum("montant_net"))["v"] or 0
        return render(
            request,
            self.template_name,
            {
                "entreprise": e,
                "transactions": txs[:100],
                "brut": brut,
                "commission": com,
                "net": net,
                "active_section": "finance",
            },
        )


class ParametresPageView(View):
    template_name = "entreprise/parametres.html"

    def get(self, request):
        e = _session_entreprise(request)
        if not e:
            return redirect("entreprise-login")
        return render(request, self.template_name, {"entreprise": e, "active_section": "parametres"})

    def post(self, request):
        e = _session_entreprise(request)
        if not e:
            return redirect("entreprise-login")
        e.nom = request.POST.get("nom", e.nom)
        e.telephone = request.POST.get("telephone", e.telephone)
        e.email = request.POST.get("email", e.email)
        e.adresse = request.POST.get("adresse", e.adresse)
        e.save(update_fields=["nom", "telephone", "email", "adresse"])
        mdp = request.POST.get("nouveau_mot_de_passe", "").strip()
        if mdp:
            e.set_password(mdp)
            e.save(update_fields=["mot_de_passe"])
        messages.success(request, "Parametres mis a jour.")
        return redirect("entreprise-parametres")


class SupportPageView(View):
    template_name = "entreprise/support.html"

    def get(self, request):
        e = _session_entreprise(request)
        if not e:
            return redirect("entreprise-login")
        tickets = TicketSupport.objects.filter(entreprise=e)
        return render(
            request,
            self.template_name,
            {"entreprise": e, "tickets": tickets, "active_section": "support"},
        )

    def post(self, request):
        e = _session_entreprise(request)
        if not e:
            return redirect("entreprise-login")
        TicketSupport.objects.create(
            entreprise=e,
            sujet=request.POST.get("sujet", "autre"),
            message=request.POST.get("message", "").strip(),
        )
        messages.success(request, "Ticket support envoye.")
        return redirect("entreprise-support")


class LoginEntrepriseView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        s = EntrepriseLoginSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        try:
            e = Entreprise.objects.get(
                email=s.validated_data["email"],
                nom__iexact=s.validated_data["nom"].strip(),
            )
        except Entreprise.DoesNotExist:
            return Response({"message": "Nom entreprise ou email introuvable"}, status=status.HTTP_401_UNAUTHORIZED)
        if not e.check_password_raw(s.validated_data["mot_de_passe"]):
            return Response({"message": "Mot de passe incorrect"}, status=status.HTTP_401_UNAUTHORIZED)
        if not e.valide:
            return Response({"message": "Compte en attente de validation"}, status=status.HTTP_403_FORBIDDEN)
        refresh = RefreshToken()
        refresh["role"] = "entreprise"
        refresh["entreprise_id"] = e.id
        return Response(
            {
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "entreprise": EntrepriseSerializer(e).data,
            }
        )


class StatsEntrepriseView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        eid = request.auth.get("entreprise_id")
        return Response(_dashboard_stats(eid))


class StatutEntrepriseView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        eid = request.auth.get("entreprise_id")
        ouvert = request.data.get("ouvert")
        Entreprise.objects.filter(id=eid).update(ouvert=ouvert)
        return Response({"success": True, "ouvert": ouvert})
