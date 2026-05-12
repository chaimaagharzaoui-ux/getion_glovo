import json
from datetime import timedelta

from django.contrib import messages
from django.db.models import Avg, Sum
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from commandes.models import Commande

from .models import Entreprise


STATUTS_FILTRES = [
    ("", "Toutes"),
    ("en_attente", "En attente"),
    ("en_preparation", "En préparation"),
    ("en_livraison", "En livraison"),
    ("livree", "Livrées"),
    ("annulee", "Annulées"),
]

FAQ_SUPPORT = [
    (
        "Comment modifier mes horaires ?",
        "Allez dans Paramètres pour modifier vos informations.",
    ),
    ("Comment voir mes gains ?", "Rendez-vous dans l'onglet Finances."),
    ("Comment ajouter un produit ?", "Dans Catalogue, cliquez sur Ajouter un produit."),
    ("Comment contacter un livreur ?", "Depuis la page Commandes, ouvrez le détail de la commande."),
    ("Comment fermer temporairement ?", "Utilisez le bouton Ouvert/Fermé sur le tableau de bord."),
]


def entreprise_requise(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.session.get("entreprise_id"):
            return redirect("entreprise:login")
        return view_func(request, *args, **kwargs)

    wrapper.__name__ = view_func.__name__
    return wrapper


def get_entreprise(request):
    eid = request.session.get("entreprise_id")
    if not eid:
        return None
    try:
        return Entreprise.objects.get(id=eid)
    except Entreprise.DoesNotExist:
        request.session.flush()
        return None


def login_view(request):
    if request.session.get("entreprise_id"):
        return redirect("entreprise:dashboard")

    erreur = None
    if request.method == "POST":
        from portail_auth import django_user_from_identifiant

        ident = request.POST.get("email", "").strip()
        mdp = request.POST.get("mot_de_passe", "")
        try:
            e = Entreprise.objects.get(email__iexact=ident)
            if not e.valide:
                erreur = "Compte en attente de validation"
            elif not e.check_password_raw(mdp):
                erreur = "Mot de passe incorrect"
            else:
                request.session["entreprise_id"] = e.id
                request.session["entreprise_nom"] = e.nom
                request.session["entreprise_avatar"] = e.avatar_emoji
                return redirect("entreprise:dashboard")
        except Entreprise.DoesNotExist:
            user = django_user_from_identifiant(request, ident, mdp)
            if user is not None and user.is_active:
                e = Entreprise.objects.filter(user=user).first()
                em = (user.email or "").strip().lower()
                if e is None and em:
                    e = Entreprise.objects.filter(email__iexact=em).first()
                    if e is not None and e.user_id is None:
                        e.user = user
                        e.save(update_fields=["user"])
                if e is None and user.is_superuser:
                    boot = em or f"{user.username}@swift-entreprise.local"
                    e = Entreprise.objects.filter(email__iexact=boot).first()
                    if e is not None:
                        if e.user_id is None:
                            e.user = user
                            e.save(update_fields=["user"])
                    else:
                        e = Entreprise(
                            nom=f"Entreprise {user.username}",
                            email=boot,
                            valide=True,
                            user=user,
                        )
                        e.set_password(mdp)
                        e.save()
                if e is None:
                    erreur = (
                        "Compte reconnu, mais aucune fiche entreprise n’est liée à cet utilisateur. "
                        "Associez-le à une entreprise dans l’administration, ou connectez-vous avec l’email de l’entreprise."
                    )
                elif not e.valide:
                    erreur = "Compte en attente de validation"
                else:
                    request.session["entreprise_id"] = e.id
                    request.session["entreprise_nom"] = e.nom
                    request.session["entreprise_avatar"] = e.avatar_emoji
                    return redirect("entreprise:dashboard")
            else:
                erreur = "Email ou mot de passe incorrect"

    return render(request, "entreprise/login.html", {"erreur": erreur})


def logout_view(request):
    request.session.flush()
    return redirect("entreprise:login")


@entreprise_requise
def dashboard_view(request):
    e = get_entreprise(request)
    if e is None:
        return redirect("entreprise:login")

    auj = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    hier = auj - timedelta(days=1)

    ca_auj = (
        Commande.objects.filter(entreprise=e, created_at__gte=auj)
        .exclude(statut="annulee")
        .aggregate(t=Sum("montant_total"))["t"]
        or 0
    )

    ca_hier = (
        Commande.objects.filter(
            entreprise=e,
            created_at__gte=hier,
            created_at__lt=auj,
        )
        .exclude(statut="annulee")
        .aggregate(t=Sum("montant_total"))["t"]
        or 0
    )

    variation = round(((ca_auj - ca_hier) / ca_hier) * 100) if ca_hier > 0 else 0

    en_cours = Commande.objects.filter(
        entreprise=e,
        statut__in=["en_attente", "en_preparation", "en_livraison"],
    ).count()

    total = Commande.objects.filter(entreprise=e).count()

    note = Commande.objects.filter(
        entreprise=e,
        evaluation_note__isnull=False,
    ).aggregate(m=Avg("evaluation_note"))["m"]
    note_moy = round(note, 1) if note else None

    livrees = Commande.objects.filter(
        entreprise=e,
        statut="livree",
        livree_at__gte=auj,
        acceptee_at__isnull=False,
    )
    temps_moy = None
    if livrees.exists():
        durees = [
            (c.livree_at - c.acceptee_at).seconds / 60
            for c in livrees
            if c.livree_at and c.acceptee_at
        ]
        if durees:
            temps_moy = round(sum(durees) / len(durees))

    total_r = Commande.objects.filter(entreprise=e).count()
    non_ann = Commande.objects.filter(entreprise=e).exclude(statut="annulee").count()
    acceptation = round((non_ann / total_r) * 100) if total_r > 0 else 100

    commandes_recentes = Commande.objects.filter(entreprise=e).select_related("client").order_by(
        "-created_at"
    )[:10]

    ctx = {
        "entreprise": e,
        "ca_aujourdhui": ca_auj,
        "variation": variation,
        "total_commandes": total,
        "commandes_en_cours": en_cours,
        "note_moyenne": note_moy,
        "temps_livraison": temps_moy,
        "acceptation": acceptation,
        "commandes_recentes": commandes_recentes,
    }
    return render(request, "entreprise/dashboard.html", ctx)


@require_POST
@entreprise_requise
def toggle_statut(request):
    e = get_entreprise(request)
    if e is None:
        return JsonResponse({"success": False}, status=403)
    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        data = {}
    ouvert = bool(data.get("ouvert", not e.ouvert))
    Entreprise.objects.filter(id=e.id).update(ouvert=ouvert)
    return JsonResponse({"success": True, "ouvert": ouvert})


@entreprise_requise
def commandes_view(request):
    e = get_entreprise(request)
    if e is None:
        return redirect("entreprise:login")

    statut = request.GET.get("statut", "")
    qs = Commande.objects.filter(entreprise=e).select_related("client").order_by("-created_at")
    if statut:
        qs = qs.filter(statut=statut)
    return render(
        request,
        "entreprise/commandes.html",
        {
            "entreprise": e,
            "commandes": qs,
            "statut_filtre": statut,
            "statuts": STATUTS_FILTRES,
        },
    )


@entreprise_requise
def catalogue_view(request):
    e = get_entreprise(request)
    if e is None:
        return redirect("entreprise:login")
    return render(request, "entreprise/catalogue.html", {"entreprise": e})


@entreprise_requise
def statistiques_view(request):
    e = get_entreprise(request)
    if e is None:
        return redirect("entreprise:login")

    auj = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    stats_7j = []
    for i in range(6, -1, -1):
        jour = auj - timedelta(days=i)
        jour_fin = jour + timedelta(days=1)
        ca = (
            Commande.objects.filter(
                entreprise=e,
                created_at__gte=jour,
                created_at__lt=jour_fin,
            )
            .exclude(statut="annulee")
            .aggregate(t=Sum("montant_total"))["t"]
            or 0
        )
        stats_7j.append({"jour": jour.strftime("%d/%m"), "ca": float(ca)})

    return render(request, "entreprise/statistiques.html", {"entreprise": e, "stats_7j": stats_7j})


@entreprise_requise
def finances_view(request):
    e = get_entreprise(request)
    if e is None:
        return redirect("entreprise:login")

    ca_total = (
        Commande.objects.filter(entreprise=e, statut="livree").aggregate(t=Sum("montant_total"))["t"]
        or 0
    )
    frais = round(float(ca_total) * 0.05, 2)
    benefice = round(float(ca_total) - frais, 2)
    return render(
        request,
        "entreprise/finances.html",
        {
            "entreprise": e,
            "ca_total": ca_total,
            "frais": frais,
            "benefice": benefice,
        },
    )


@entreprise_requise
def parametres_view(request):
    e = get_entreprise(request)
    if e is None:
        return redirect("entreprise:login")

    if request.method == "POST":
        e.nom = request.POST.get("nom", e.nom)
        e.telephone = request.POST.get("telephone", e.telephone)
        e.adresse = request.POST.get("adresse", e.adresse)
        e.save(update_fields=["nom", "telephone", "adresse"])
        messages.success(request, "Paramètres sauvegardés ✅")
        e.refresh_from_db()

    return render(request, "entreprise/parametres.html", {"entreprise": e})


@entreprise_requise
def support_view(request):
    e = get_entreprise(request)
    if e is None:
        return redirect("entreprise:login")

    envoye = False
    if request.method == "POST":
        envoye = True
    return render(
        request,
        "entreprise/support.html",
        {
            "entreprise": e,
            "envoye": envoye,
            "faq": FAQ_SUPPORT,
        },
    )


@entreprise_requise
def api_commandes_json(request):
    e = get_entreprise(request)
    if e is None:
        return JsonResponse({"commandes": []}, status=401)

    qs = Commande.objects.filter(entreprise=e).select_related("client").order_by("-created_at")[:10]
    data = []
    for c in qs:
        data.append(
            {
                "id": c.id,
                "numero_sw": c.numero_sw,
                "client_nom": (
                    f"{c.client.prenom} {c.client.nom}" if c.client else "—"
                ),
                "montant": str(c.montant_total),
                "statut": c.get_statut_display(),
                "statut_key": c.statut,
                "created_at": c.created_at.strftime("%d/%m %H:%M"),
            }
        )
    return JsonResponse({"commandes": data})
