import time

from django.conf import settings
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie


def _swift_demo_context():
    """En DEBUG, évite le cache navigateur sur swift_app.jsx (même rendu Cursor / VS Code)."""
    ctx = {
        "swift_principal_admin_email": getattr(settings, "SWIFT_PRINCIPAL_ADMIN_EMAIL", "swift@gmail.com"),
    }
    if settings.DEBUG:
        ctx["swift_app_cache_bust"] = int(time.time())
    return ctx


@ensure_csrf_cookie
def frontend_home(request):
    return render(request, "swift_demo.html", _swift_demo_context())


@ensure_csrf_cookie
def swift_demo(request):
    return render(request, "swift_demo.html", _swift_demo_context())


def _entreprise_business_context():
    ctx = {}
    if settings.DEBUG:
        ctx["cache_bust"] = int(time.time())
    return ctx


@ensure_csrf_cookie
def entreprise_business_demo(request):
    return render(request, "entreprise_business_demo.html", _entreprise_business_context())
