"""Injecte l'objet Entreprise dans les templates si session active."""

from .models import Entreprise


def entreprise_session(request):
    eid = request.session.get("entreprise_id")
    if not eid:
        return {"entreprise_ctx": None}
    try:
        return {"entreprise_ctx": Entreprise.objects.get(pk=eid)}
    except Entreprise.DoesNotExist:
        return {"entreprise_ctx": None}


def entreprise_ctx(request):
    """Alias attendu par settings.py."""
    return entreprise_session(request)
