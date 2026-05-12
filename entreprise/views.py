"""
Vues de l'espace entreprise Swift — sessions Django, JSON pour AJAX.
"""
from __future__ import annotations

import csv
import json
from datetime import timedelta
from decimal import Decimal
from functools import wraps

from django.contrib import messages
from django.contrib.auth.hashers import check_password, make_password
from django.core.paginator import Paginator
from django.db.models import Avg, Count, Q, Sum
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from .forms import (
    ChangerMotDePasseForm,
    EntrepriseParametresForm,
    LoginEntrepriseForm,
    ProduitCatalogueForm,
    TicketSupportForm,
)
from .models import Commande, Entreprise, Evaluation, ProduitCatalogue, TicketSupport


def login_required_entreprise(view_func):
    """Redirige vers la page de login si aucune entreprise en session."""

    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        if not request.session.get("entreprise_id"):
            return redirect("login_entreprise")
        return view_func(request, *args, **kwargs)

    return _wrapped


def _eid(request) -> int:
    return int(request.session["entreprise_id"])


def login_entreprise(request):
    """Connexion par email + mot de passe (hash Django)."""
    if request.session.get("entreprise_id"):
        return redirect("dashboard")

    if request.method == "POST":
        form = LoginEntrepriseForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data["email"]
            pwd = form.cleaned_data["mot_de_passe"]
            try:
                ent = Entreprise.objects.get(email__iexact=email)
            except Entreprise.DoesNotExist:
                messages.error(request, "Identifiants invalides.")
            else:
                if check_password(pwd, ent.mot_de_passe):
                    request.session["entreprise_id"] = ent.id
                    messages.success(request, f"Bienvenue, {ent.nom} !")
                    return redirect("dashboard")
                messages.error(request, "Identifiants invalides.")
    else:
        form = LoginEntrepriseForm()

    return render(request, "entreprise/login.html", {"form": form})


@login_required_entreprise
@require_POST
def logout_entreprise(request):
    request.session.flush()
    messages.info(request, "Vous êtes déconnecté.")
    return redirect("login_entreprise")


@login_required_entreprise
def dashboard(request):
    """Tableau de bord : agrégats réels + dernières commandes."""
    eid = _eid(request)
    ent = get_object_or_404(Entreprise, pk=eid)
    aujourd_hui = timezone.localdate()

    commandes_jour = Commande.objects.filter(
        entreprise_id=eid, created_at__date=aujourd_hui
    )

    ca_jour = (
        commandes_jour.filter(statut="livree").aggregate(t=Sum("montant"))["t"]
        or Decimal("0")
    )

    hier = aujourd_hui - timedelta(days=1)
    ca_hier = (
        Commande.objects.filter(
            entreprise_id=eid,
            created_at__date=hier,
            statut="livree",
        ).aggregate(t=Sum("montant"))["t"]
        or Decimal("0")
    )

    if ca_hier and ca_hier > 0:
        variation_ca = round(float((ca_jour - ca_hier) / ca_hier * 100), 1)
    elif ca_jour > 0:
        variation_ca = 100.0
    else:
        variation_ca = 0.0

    nb_commandes = commandes_jour.count()
    en_cours = commandes_jour.filter(
        statut__in=["en_preparation", "en_livraison"]
    ).count()

    note_moyenne = (
        Evaluation.objects.filter(commande__entreprise_id=eid).aggregate(
            m=Avg("note")
        )["m"]
        or 0
    )

    # Temps de livraison moyen (minutes) sur commandes livrées avec horodatage
    livrees = Commande.objects.filter(
        entreprise_id=eid, statut="livree", livree_le__isnull=False
    )
    durees = []
    for c in livrees[:500]:
        delta = c.livree_le - c.created_at
        durees.append(delta.total_seconds() / 60.0)
    temps_livraison_moyen = int(sum(durees) / len(durees)) if durees else 18

    dernieres_commandes = Commande.objects.filter(entreprise_id=eid).order_by(
        "-created_at"
    )[:4]

    context = {
        "ca_jour": ca_jour,
        "variation_ca": variation_ca,
        "nb_commandes": nb_commandes,
        "en_cours": en_cours,
        "note_moyenne": round(float(note_moyenne), 1),
        "temps_livraison_moyen": temps_livraison_moyen,
        "dernieres_commandes": dernieres_commandes,
        "entreprise": ent,
        "page_id": "dashboard",
    }
    return render(request, "entreprise/dashboard.html", context)


@login_required_entreprise
def api_stats(request):
    """JSON pour rafraîchissement AJAX (mêmes indicateurs clés que le dashboard)."""
    eid = _eid(request)
    aujourd_hui = timezone.localdate()
    commandes_jour = Commande.objects.filter(
        entreprise_id=eid, created_at__date=aujourd_hui
    )
    ca = commandes_jour.filter(statut="livree").aggregate(t=Sum("montant"))["t"] or 0
    en_cours = commandes_jour.filter(
        statut__in=["en_preparation", "en_livraison"]
    ).count()

    return JsonResponse(
        {
            "ca": str(ca),
            "commandes": commandes_jour.count(),
            "en_cours": en_cours,
            "est_ouvert": Entreprise.objects.filter(pk=eid).values_list(
                "est_ouvert", flat=True
            ).first(),
        }
    )


@login_required_entreprise
@require_POST
def toggle_ouverture(request):
    """Bascule est_ouvert (JSON POST)."""
    eid = _eid(request)
    try:
        data = json.loads(request.body.decode())
        ouvert = bool(data.get("ouvert"))
    except (json.JSONDecodeError, TypeError, ValueError):
        return JsonResponse({"success": False, "error": "JSON invalide."}, status=400)

    Entreprise.objects.filter(pk=eid).update(est_ouvert=ouvert)
    return JsonResponse({"success": True, "est_ouvert": ouvert})


@login_required_entreprise
@require_POST
def changer_statut(request, id):
    """Met à jour le statut d'une commande (JSON)."""
    eid = _eid(request)
    commande = get_object_or_404(Commande, pk=id, entreprise_id=eid)

    try:
        data = json.loads(request.body.decode())
        nouveau = data.get("statut")
    except (json.JSONDecodeError, TypeError):
        return JsonResponse({"success": False}, status=400)

    codes = {c[0] for c in Commande.STATUTS}
    if nouveau not in codes:
        return JsonResponse({"success": False, "error": "Statut inconnu."}, status=400)

    commande.statut = nouveau
    if nouveau == "livree":
        commande.livree_le = timezone.now()
    elif commande.livree_le is not None:
        commande.livree_le = None
    commande.save(update_fields=["statut", "livree_le", "updated_at"])

    return JsonResponse({"success": True, "statut": commande.statut})


@login_required_entreprise
def commandes(request):
    """Liste paginée avec filtre par statut."""
    eid = _eid(request)
    statut = request.GET.get("statut", "tous")
    qs = Commande.objects.filter(entreprise_id=eid).order_by("-created_at")
    if statut != "tous":
        qs = qs.filter(statut=statut)

    paginator = Paginator(qs, 10)
    page_obj = paginator.get_page(request.GET.get("page"))

    context = {
        "page_obj": page_obj,
        "statut_actif": statut,
        "statuts_filtres": [
            ("tous", "Tous"),
            ("en_attente", "En attente"),
            ("en_preparation", "En préparation"),
            ("en_livraison", "En livraison"),
            ("livree", "Livré"),
            ("annulee", "Annulé"),
        ],
        "statuts_choices": Commande.STATUTS,
        "page_id": "commandes",
    }
    return render(request, "entreprise/commandes.html", context)


@login_required_entreprise
def catalogue(request):
    eid = _eid(request)
    produits = ProduitCatalogue.objects.filter(entreprise_id=eid).order_by("nom")
    form = ProduitCatalogueForm()
    return render(
        request,
        "entreprise/catalogue.html",
        {"produits": produits, "form": form, "page_id": "catalogue"},
    )


@login_required_entreprise
@require_POST
def ajouter_produit(request):
    eid = _eid(request)
    form = ProduitCatalogueForm(request.POST, request.FILES)
    if form.is_valid():
        p = form.save(commit=False)
        p.entreprise_id = eid
        p.save()
        if request.POST.get("ajax") == "1":
            return JsonResponse({"success": True, "id": p.id})
        messages.success(request, "Produit ajouté.")
    else:
        if request.POST.get("ajax") == "1":
            return JsonResponse({"success": False, "errors": form.errors.as_json()}, status=400)
        messages.error(request, "Vérifiez les champs du formulaire.")

    return redirect("catalogue")


@login_required_entreprise
@require_POST
def modifier_produit(request, id):
    eid = _eid(request)
    p = get_object_or_404(ProduitCatalogue, pk=id, entreprise_id=eid)
    form = ProduitCatalogueForm(request.POST, request.FILES, instance=p)
    if form.is_valid():
        form.save()
        if request.POST.get("ajax") == "1":
            return JsonResponse({"success": True})
        messages.success(request, "Produit mis à jour.")
    else:
        if request.POST.get("ajax") == "1":
            return JsonResponse({"success": False, "errors": form.errors.as_json()}, status=400)
        messages.error(request, "Impossible d'enregistrer.")

    return redirect("catalogue")


@login_required_entreprise
def produit_json(request, id):
    """Données JSON pour préremplir le modal d'édition."""
    eid = _eid(request)
    p = get_object_or_404(ProduitCatalogue, pk=id, entreprise_id=eid)
    return JsonResponse(
        {
            "id": p.id,
            "nom": p.nom,
            "description": p.description,
            "prix": str(p.prix),
            "categorie": p.categorie,
            "disponible": p.disponible,
            "image_url": p.image.url if p.image else "",
        }
    )


@login_required_entreprise
@require_POST
def supprimer_produit(request, id):
    eid = _eid(request)
    p = get_object_or_404(ProduitCatalogue, pk=id, entreprise_id=eid)
    p.delete()
    if request.headers.get("X-Requested-With") == "Fetch":
        return JsonResponse({"success": True})
    messages.success(request, "Produit supprimé.")
    return redirect("catalogue")


@login_required_entreprise
def statistiques(request):
    return render(request, "entreprise/statistiques.html", {"page_id": "statistiques"})


@login_required_entreprise
def api_statistiques(request):
    """
    Données pour Chart.js :
    - CA 7 derniers jours (commandes livrées)
    - Répartition des statuts
    - Commandes par heure (toutes commandes récentes)
    - Note moyenne par jour sur 30 jours
    """
    eid = _eid(request)
    today = timezone.localdate()

    # 1) CA par jour (7 jours)
    labels_ca = []
    data_ca = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        labels_ca.append(d.strftime("%d/%m"))
        total = (
            Commande.objects.filter(
                entreprise_id=eid,
                statut="livree",
                created_at__date=d,
            ).aggregate(t=Sum("montant"))["t"]
            or 0
        )
        data_ca.append(float(total))

    # 2) Répartition statuts
    rep = (
        Commande.objects.filter(entreprise_id=eid)
        .values("statut")
        .annotate(n=Count("id"))
    )
    statut_labels = []
    statut_data = []
    for row in rep:
        statut_labels.append(dict(Commande.STATUTS).get(row["statut"], row["statut"]))
        statut_data.append(row["n"])

    # 3) Commandes par heure (0-23) sur les 30 derniers jours
    since = timezone.now() - timedelta(days=30)
    qs_h = Commande.objects.filter(entreprise_id=eid, created_at__gte=since)
    heures = {h: 0 for h in range(24)}
    for c in qs_h:
        heures[c.created_at.astimezone(timezone.get_current_timezone()).hour] += 1
    labels_heures = [f"{h}h" for h in range(24)]
    data_heures = [heures[h] for h in range(24)]

    # 4) Note moyenne par jour (30 jours)
    labels_notes = []
    data_notes = []
    for i in range(29, -1, -1):
        d = today - timedelta(days=i)
        labels_notes.append(d.strftime("%d/%m"))
        m = Evaluation.objects.filter(
            commande__entreprise_id=eid, created_at__date=d
        ).aggregate(m=Avg("note"))["m"]
        data_notes.append(round(float(m), 2) if m is not None else 0)

    return JsonResponse(
        {
            "ca_labels": labels_ca,
            "ca_data": data_ca,
            "statut_labels": statut_labels,
            "statut_data": statut_data,
            "heure_labels": labels_heures,
            "heure_data": data_heures,
            "note_labels": labels_notes,
            "note_data": data_notes,
        }
    )


@login_required_entreprise
def finances(request):
    eid = _eid(request)
    now = timezone.now()
    debut_mois = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    livrees_mois = Commande.objects.filter(
        entreprise_id=eid,
        statut="livree",
        created_at__gte=debut_mois,
    ).order_by("-created_at")

    total_mois = livrees_mois.aggregate(t=Sum("montant"))["t"] or Decimal("0")

    context = {
        "livrees_mois": livrees_mois,
        "total_mois": total_mois,
        "page_id": "finances",
    }
    return render(request, "entreprise/finances.html", context)


@login_required_entreprise
def finances_export_csv(request):
    """Export CSV des commandes livrées du mois en cours."""
    eid = _eid(request)
    now = timezone.now()
    debut_mois = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    rows = Commande.objects.filter(
        entreprise_id=eid,
        statut="livree",
        created_at__gte=debut_mois,
    ).order_by("-created_at")

    response = HttpResponse(content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = (
        f'attachment; filename="swift_finances_{now.strftime("%Y%m")}.csv"'
    )
    w = csv.writer(response, delimiter=";")
    w.writerow(["Date", "N° commande", "Client", "Montant (MAD)", "Statut"])
    for c in rows:
        w.writerow(
            [
                timezone.localtime(c.created_at).strftime("%Y-%m-%d %H:%M"),
                c.numero,
                c.client_nom,
                str(c.montant),
                c.get_statut_display(),
            ]
        )
    return response


@login_required_entreprise
def parametres(request):
    eid = _eid(request)
    ent = get_object_or_404(Entreprise, pk=eid)

    if request.method == "POST":
        if "save_entreprise" in request.POST:
            form = EntrepriseParametresForm(request.POST, request.FILES, instance=ent)
            pwd_form = ChangerMotDePasseForm(entreprise=ent)
            if form.is_valid():
                # Ne pas écraser le hash si le champ mot_de_passe était dans le modèle — ici absent du form
                form.save()
                messages.success(request, "Informations mises à jour.")
                return redirect("parametres")
        elif "save_password" in request.POST:
            form = EntrepriseParametresForm(instance=ent)
            pwd_form = ChangerMotDePasseForm(request.POST, entreprise=ent)
            if pwd_form.is_valid():
                ent.mot_de_passe = make_password(pwd_form.cleaned_data["nouveau"])
                ent.save(update_fields=["mot_de_passe"])
                messages.success(request, "Mot de passe modifié.")
                return redirect("parametres")
        else:
            form = EntrepriseParametresForm(instance=ent)
            pwd_form = ChangerMotDePasseForm(entreprise=ent)
    else:
        form = EntrepriseParametresForm(instance=ent)
        pwd_form = ChangerMotDePasseForm(entreprise=ent)

    return render(
        request,
        "entreprise/parametres.html",
        {
            "form": form,
            "pwd_form": pwd_form,
            "entreprise": ent,
            "page_id": "parametres",
        },
    )


@login_required_entreprise
def support(request):
    eid = _eid(request)
    tickets = TicketSupport.objects.filter(entreprise_id=eid).order_by("-created_at")

    if request.method == "POST":
        form = TicketSupportForm(request.POST)
        if form.is_valid():
            t = form.save(commit=False)
            t.entreprise_id = eid
            t.save()
            messages.success(request, "Message envoyé.")
            return redirect("support")
    else:
        form = TicketSupportForm()

    return render(
        request,
        "entreprise/support.html",
        {"form": form, "tickets": tickets, "page_id": "support"},
    )
