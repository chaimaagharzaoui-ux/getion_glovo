"""Authentification Django (username ou email utilisateur) pour les portails métier."""

from django.contrib.auth import authenticate, get_user_model


def django_user_from_identifiant(request, identifiant, password):
    identifiant = (identifiant or "").strip()
    if not identifiant or not password:
        return None
    user = authenticate(request, username=identifiant, password=password)
    if user is not None:
        return user
    if "@" in identifiant:
        u = get_user_model().objects.filter(email__iexact=identifiant).first()
        if u is not None:
            return authenticate(request, username=u.username, password=password)
    return None
