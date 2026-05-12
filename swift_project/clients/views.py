from django.contrib import messages
from django.shortcuts import redirect, render

from .models import Client


def login_view(request):
    if request.session.get("client_id"):
        return redirect("home")

    erreur = None
    if request.method == "POST":
        from portail_auth import django_user_from_identifiant

        raw = request.POST.get("email", "").strip()
        email = raw.lower()
        mdp = request.POST.get("mot_de_passe", "")
        try:
            c = Client.objects.get(email=email)
            if not c.check_password_raw(mdp):
                erreur = "Mot de passe incorrect"
            else:
                request.session["client_id"] = c.id
                request.session["client_nom"] = f"{c.prenom} {c.nom}"
                messages.success(
                    request,
                    f"Bienvenue {c.prenom} — session client active.",
                )
                return redirect("home")
        except Client.DoesNotExist:
            user = django_user_from_identifiant(request, raw, mdp)
            if user is not None and user.is_active:
                c = Client.objects.filter(user=user).first()
                em = (user.email or "").strip().lower()
                if c is None and em:
                    c = Client.objects.filter(email=em).first()
                    if c is not None and c.user_id is None:
                        c.user = user
                        c.save(update_fields=["user"])
                if c is None:
                    erreur = (
                        "Compte reconnu, mais aucune fiche client n’est liée. "
                        "Liez votre utilisateur Django au client dans l’administration, ou utilisez l’email client."
                    )
                else:
                    request.session["client_id"] = c.id
                    request.session["client_nom"] = f"{c.prenom} {c.nom}"
                    messages.success(
                        request,
                        f"Bienvenue {c.prenom} — session client active.",
                    )
                    return redirect("home")
            else:
                erreur = "Email ou mot de passe incorrect"

    return render(request, "clients/login.html", {"erreur": erreur})


def logout_view(request):
    request.session.pop("client_id", None)
    request.session.pop("client_nom", None)
    return redirect("home")
