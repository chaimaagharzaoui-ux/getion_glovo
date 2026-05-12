from .models import Entreprise


def entreprise_ctx(request):
    eid = request.session.get("entreprise_id")

    if not eid:
        return {}

    try:
        ent = Entreprise.objects.get(pk=eid)
        return {
            "entreprise_ctx": ent
        }
    except Entreprise.DoesNotExist:
        return {}