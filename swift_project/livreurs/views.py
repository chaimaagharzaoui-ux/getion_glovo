import json
from decimal import Decimal

from django.contrib.auth.hashers import check_password
from django.db.models import Sum
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.http import require_POST

from commandes.models import Commande

from .models import Livreur


def livreur_requis(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.session.get("livreur_id"):
            return redirect("livreurs:login")
        return view_func(request, *args, **kwargs)

    wrapper.__name__ = view_func.__name__
    return wrapper


def _debut_jour_local():
    return timezone.localtime().replace(hour=0, minute=0, second=0, microsecond=0)


def _texte_adresse_commande(cmd):
    d = cmd.adresse_livraison or {}
    if isinstance(d, dict) and d:
        for k in ("rue", "ligne1", "adresse", "address"):
            v = d.get(k)
            if v:
                extra = d.get("ville") or d.get("quartier")
                return f"{v}, {extra}" if extra else str(v)
        vals = [str(v) for v in d.values() if v]
        if vals:
            return ", ".join(vals)
    if cmd.client_id:
        if cmd.client.adresse:
            return cmd.client.adresse.strip()
    return "—"


def _client_nom_court(cmd):
    if not cmd.client_id:
        return "—"
    c = cmd.client
    initial = (c.nom[:1] + ".").upper() if c.nom else ""
    return f"{c.prenom} {initial}".strip()


def _commande_attente_dict(c):
    client_nom = f"{c.client.prenom} {c.client.nom}" if c.client_id else "—"
    return {
        "id": c.id,
        "numero_sw": c.numero_sw or f"SW-{c.id:04d}",
        "entreprise": c.entreprise.nom if c.entreprise_id else "—",
        "client_nom": client_nom,
        "adresse": _texte_adresse_commande(c),
        "montant": str(c.montant_total),
        "frais": str(c.frais_livraison),
        "created_at": c.created_at.isoformat(),
    }


def _requete_veut_json(request):
    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return True
    accept = request.headers.get("Accept", "")
    return "application/json" in accept


def login_view(request):
    if request.session.get("livreur_id"):
        return redirect("livreurs:dashboard")

    erreur = None
    if request.method == "POST":
        email = request.POST.get("email", "").strip().lower()
        mdp = request.POST.get("mot_de_passe", "")
        try:
            livreur = Livreur.objects.get(email=email)
            if not livreur.valide:
                erreur = "Compte en attente de validation"
            elif not check_password(mdp, livreur.mot_de_passe):
                erreur = "Email ou mot de passe incorrect"
            else:
                request.session["livreur_id"] = livreur.id
                request.session["livreur_nom"] = f"{livreur.prenom} {livreur.nom}"
                Livreur.objects.filter(pk=livreur.pk).update(
                    en_ligne=True,
                    statut="disponible",
                )
                return redirect("livreurs:dashboard")
        except Livreur.DoesNotExist:
            erreur = "Email ou mot de passe incorrect"

    return render(request, "livreurs/login.html", {"erreur": erreur})


def logout_view(request):
    lid = request.session.get("livreur_id")
    if lid:
        Livreur.objects.filter(pk=lid).update(en_ligne=False, statut="hors_ligne")
    request.session.flush()
    return redirect("livreurs:login")


@livreur_requis
def dashboard_view(request):
    l = Livreur.objects.get(id=request.session["livreur_id"])
    debut = _debut_jour_local()
    commandes_attente = (
        Commande.objects.filter(statut="en_attente")
        .select_related("client", "entreprise")
        .order_by("-created_at")
    )
    commandes_livrees = (
        Commande.objects.filter(
            livreur=l,
            statut="livree",
            livree_at__gte=debut,
        )
        .select_related("client", "entreprise")
        .order_by("-livree_at")
    )
    total_livraisons = Commande.objects.filter(livreur=l, statut="livree").count()
    gains_agg = Commande.objects.filter(livreur=l, statut="livree").aggregate(
        s=Sum("frais_livraison")
    )
    gains_total = gains_agg["s"] if gains_agg["s"] is not None else Decimal("0")
    note_moyenne = float(l.note_moyenne) if l.note_moyenne else 0.0

    commandes_attente_data = [_commande_attente_dict(c) for c in commandes_attente]
    note_moyenne_fr = (
        f"{note_moyenne:.1f}".replace(".", ",") if note_moyenne > 0 else "—"
    )
    try:
        gains_int = int(gains_total)
    except (TypeError, ValueError):
        gains_int = 0

    return render(
        request,
        "livreurs/dashboard.html",
        {
            "livreur": l,
            "commandes_attente": commandes_attente,
            "commandes_livrees": commandes_livrees,
            "total_livraisons": total_livraisons,
            "gains_total": gains_total,
            "gains_int": gains_int,
            "note_moyenne": note_moyenne,
            "note_moyenne_fr": note_moyenne_fr,
            "commandes_attente_data": commandes_attente_data,
        },
    )


@require_POST
@livreur_requis
def toggle_enligne(request):
    l = Livreur.objects.get(id=request.session["livreur_id"])
    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        data = {}
    en_ligne = bool(data.get("en_ligne", l.en_ligne))
    statut = "disponible" if en_ligne else "hors_ligne"
    Livreur.objects.filter(pk=l.pk).update(en_ligne=en_ligne, statut=statut)
    return JsonResponse({"success": True, "en_ligne": en_ligne})


@require_POST
@livreur_requis
def accepter_commande(request, commande_id):
    cmd = get_object_or_404(Commande, pk=commande_id)
    if cmd.statut != "en_attente":
        return JsonResponse({"error": "déjà prise"}, status=409)

    livreur = Livreur.objects.get(id=request.session["livreur_id"])
    cmd.livreur = livreur
    cmd.statut = "en_livraison"
    cmd.acceptee_at = timezone.now()
    cmd.save(update_fields=["livreur", "statut", "acceptee_at", "updated_at"])

    Livreur.objects.filter(pk=livreur.pk).update(statut="en_livraison")

    if _requete_veut_json(request):
        return JsonResponse(
            {
                "success": True,
                "redirect": reverse("livreurs:commande_acceptee", args=[cmd.id]),
            }
        )
    return redirect("livreurs:commande_acceptee", commande_id=cmd.id)


@require_POST
@livreur_requis
def refuser_commande(request, commande_id):
    get_object_or_404(Commande, pk=commande_id)
    return JsonResponse({"success": True})


@livreur_requis
def commande_acceptee_view(request, commande_id):
    livreur = Livreur.objects.get(id=request.session["livreur_id"])
    cmd = get_object_or_404(
        Commande.objects.select_related("client", "entreprise"),
        pk=commande_id,
        livreur=livreur,
    )
    tel = ""
    if cmd.client_id and cmd.client.telephone:
        tel = "".join(ch for ch in cmd.client.telephone if ch.isdigit() or ch == "+")

    return render(
        request,
        "livreurs/commande_acceptee.html",
        {
            "commande": cmd,
            "livreur": livreur,
            "adresse_txt": _texte_adresse_commande(cmd),
            "client_court": _client_nom_court(cmd),
            "tel_client": tel,
        },
    )


@livreur_requis
def api_commandes_attente(request):
    qs = (
        Commande.objects.filter(statut="en_attente")
        .select_related("client", "entreprise")
        .order_by("-created_at")
    )
    out = [_commande_attente_dict(c) for c in qs]
    return JsonResponse({"commandes": out})


@require_POST
@livreur_requis
def marquer_livre(request, commande_id):
    livreur = Livreur.objects.get(id=request.session["livreur_id"])
    cmd = get_object_or_404(Commande, pk=commande_id, livreur=livreur)
    cmd.statut = "livree"
    cmd.livree_at = timezone.now()
    cmd.save(update_fields=["statut", "livree_at", "updated_at"])
    Livreur.objects.filter(pk=livreur.pk).update(statut="disponible")
    return redirect("livreurs:dashboard")
