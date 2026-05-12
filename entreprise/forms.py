"""
Formulaires HTML pour l'espace entreprise.
"""
from django import forms
from django.contrib.auth.hashers import check_password

from .models import Entreprise, ProduitCatalogue, TicketSupport


class LoginEntrepriseForm(forms.Form):
    email = forms.EmailField(label="Email", widget=forms.EmailInput(attrs={"class": "inp"}))
    mot_de_passe = forms.CharField(
        label="Mot de passe",
        widget=forms.PasswordInput(attrs={"class": "inp"}),
    )


class ProduitCatalogueForm(forms.ModelForm):
    class Meta:
        model = ProduitCatalogue
        fields = ["nom", "description", "prix", "categorie", "image", "disponible"]
        widgets = {
            "nom": forms.TextInput(attrs={"class": "inp", "id": "modal-nom"}),
            "description": forms.Textarea(
                attrs={"class": "inp", "rows": 3, "id": "modal-description"}
            ),
            "prix": forms.NumberInput(attrs={"class": "inp", "step": "0.01", "id": "modal-prix"}),
            "categorie": forms.TextInput(attrs={"class": "inp", "id": "modal-categorie"}),
            "image": forms.FileInput(attrs={"class": "inp", "id": "modal-image", "accept": "image/*"}),
            "disponible": forms.CheckboxInput(attrs={"id": "modal-disponible"}),
        }


class EntrepriseParametresForm(forms.ModelForm):
    """Formulaire paramètres (sans mot de passe ; géré séparément)."""

    class Meta:
        model = Entreprise
        fields = [
            "nom",
            "email",
            "telephone",
            "adresse",
            "horaire_ouverture",
            "horaire_fermeture",
            "logo",
        ]
        widgets = {
            "nom": forms.TextInput(attrs={"class": "inp"}),
            "email": forms.EmailInput(attrs={"class": "inp"}),
            "telephone": forms.TextInput(attrs={"class": "inp"}),
            "adresse": forms.TextInput(attrs={"class": "inp"}),
            "horaire_ouverture": forms.TimeInput(attrs={"class": "inp", "type": "time"}),
            "horaire_fermeture": forms.TimeInput(attrs={"class": "inp", "type": "time"}),
            "logo": forms.FileInput(attrs={"class": "inp", "accept": "image/*"}),
        }


class ChangerMotDePasseForm(forms.Form):
    ancien = forms.CharField(label="Ancien mot de passe", widget=forms.PasswordInput(attrs={"class": "inp"}))
    nouveau = forms.CharField(label="Nouveau mot de passe", widget=forms.PasswordInput(attrs={"class": "inp"}))
    confirmation = forms.CharField(
        label="Confirmer le nouveau mot de passe",
        widget=forms.PasswordInput(attrs={"class": "inp"}),
    )

    def __init__(self, *args, entreprise=None, **kwargs):
        self.entreprise = entreprise
        super().__init__(*args, **kwargs)

    def clean(self):
        data = super().clean()
        if not self.entreprise:
            return data
        ancien = data.get("ancien")
        if ancien and not check_password(ancien, self.entreprise.mot_de_passe):
            self.add_error("ancien", "Mot de passe actuel incorrect.")
        if data.get("nouveau") != data.get("confirmation"):
            self.add_error("confirmation", "Les deux mots de passe ne correspondent pas.")
        return data


class TicketSupportForm(forms.ModelForm):
    class Meta:
        model = TicketSupport
        fields = ["sujet", "message"]
        widgets = {
            "sujet": forms.TextInput(attrs={"class": "inp"}),
            "message": forms.Textarea(attrs={"class": "inp", "rows": 5}),
        }
