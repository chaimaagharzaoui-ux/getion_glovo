from django.apps import AppConfig


class DriverConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "driver"
    verbose_name = "Conducteurs"

    def ready(self):
        from . import signals  # noqa: F401
