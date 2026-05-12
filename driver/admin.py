from django.contrib import admin

from .models import (
    Driver,
    DriverAssignment,
    DriverClientOrderRejection,
    DriverOrder,
    DriverRejection,
)


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ("email", "first_name", "last_name", "vehicle", "created_at")
    search_fields = ("email", "first_name", "last_name")


@admin.register(DriverOrder)
class DriverOrderAdmin(admin.ModelAdmin):
    list_display = ("id", "driver", "order", "status", "created_at")
    list_filter = ("status",)


admin.site.register(DriverAssignment)
admin.site.register(DriverRejection)
admin.site.register(DriverClientOrderRejection)
