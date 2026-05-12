from django.urls import path

from . import views

urlpatterns = [
    path("", views.index_stub, name="commandes_stub"),
]
