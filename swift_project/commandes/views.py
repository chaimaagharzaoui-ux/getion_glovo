from django.http import HttpResponse
from django.urls import reverse


def index_stub(request):
    """Point d’entrée namespace /commandes/ (routing réservé, UI côté entreprise)."""
    url = reverse("entreprise:commandes")
    return HttpResponse(
        '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">'
        '<title>Commandes Swift</title>'
        "<style>body{font-family:Segoe UI,sans-serif;padding:40px;background:#f5f4f0;}"
        "a{color:#FF6B00;font-weight:800;}</style></head><body>"
        f"<p>Gestion des commandes : utilisez "
        f'<a href="{url}">l’espace entreprise</a>.</p>'
        "</body></html>"
    )
