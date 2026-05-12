from django.contrib.auth.hashers import check_password, make_password
from django.shortcuts import redirect, render
from django.views.decorators.http import require_http_methods

from .models import Driver, DriverOrder
from .utils import swift_order_api_dict

SESSION_DRIVER_ID = "driver_id"


def _driver_session(request):
    pk = request.session.get(SESSION_DRIVER_ID)
    if not pk:
        return None
    try:
        return Driver.objects.get(pk=pk)
    except Driver.DoesNotExist:
        request.session.pop(SESSION_DRIVER_ID, None)
        return None


@require_http_methods(["GET", "POST"])
def driver_login(request):
    if request.session.get(SESSION_DRIVER_ID):
        return redirect("driver:driver_dashboard")

    error = None
    if request.method == "POST":
        email = request.POST.get("email", "").strip().lower()
        password = request.POST.get("password", "")
        if not email or not password:
            error = "Email et mot de passe requis."
        else:
            try:
                d = Driver.objects.get(email=email)
            except Driver.DoesNotExist:
                error = "Identifiants invalides."
            else:
                if not check_password(password, d.password):
                    error = "Identifiants invalides."
                else:
                    request.session[SESSION_DRIVER_ID] = d.pk
                    return redirect("driver:driver_dashboard")

    return render(
        request,
        "driver/auth.html",
        {"error": error, "tab": "login", "form_action_login": True},
    )


@require_http_methods(["GET", "POST"])
def driver_register(request):
    if request.session.get(SESSION_DRIVER_ID):
        return redirect("driver:driver_dashboard")

    error = None
    if request.method == "POST":
        first_name = request.POST.get("first_name", "").strip()
        last_name = request.POST.get("last_name", "").strip()
        email = request.POST.get("email", "").strip().lower()
        password = request.POST.get("password", "")
        vehicle = request.POST.get("vehicle", "moto")
        if not all([first_name, last_name, email, password]):
            error = "Tous les champs sont requis."
        elif vehicle not in ("voiture", "moto"):
            error = "Véhicule invalide."
        elif Driver.objects.filter(email=email).exists():
            error = "Cet email est déjà utilisé."
        elif len(password) < 6:
            error = "Mot de passe : minimum 6 caractères."
        else:
            d = Driver.objects.create(
                first_name=first_name,
                last_name=last_name,
                email=email,
                password=make_password(password),
                vehicle=vehicle,
            )
            request.session[SESSION_DRIVER_ID] = d.pk
            return redirect("driver:driver_dashboard")

    return render(
        request,
        "driver/auth.html",
        {"error": error, "tab": "register", "form_action_login": False},
    )


def driver_dashboard(request):
    driver = _driver_session(request)
    if not driver:
        return redirect("driver:driver_login")

    base_qs = (
        DriverOrder.objects.filter(driver=driver)
        .select_related("order__client", "order__branch")
        .prefetch_related("order__items__product")
    )
    current_rows = base_qs.filter(status="current").order_by("-created_at")
    delivered_rows = base_qs.filter(status="delivered").order_by("-created_at")
    rejected_rows = base_qs.filter(status="rejected").order_by("-created_at")

    current_orders = [
        swift_order_api_dict(row.order) for row in current_rows
    ]
    delivered_orders = [
        swift_order_api_dict(row.order) for row in delivered_rows
    ]
    rejected_orders = [
        swift_order_api_dict(row.order, rejected=True) for row in rejected_rows
    ]

    return render(
        request,
        "driver/dashboard.html",
        {
            "driver": driver,
            "current_orders": current_orders,
            "delivered_orders": delivered_orders,
            "rejected_orders": rejected_orders,
            "user_role": "Livreur",
        },
    )


def driver_logout(request):
    request.session.pop(SESSION_DRIVER_ID, None)
    return redirect("driver:driver_login")

