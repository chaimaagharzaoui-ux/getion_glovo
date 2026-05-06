from rest_framework import serializers

from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    branches = serializers.SerializerMethodField()

    def get_branches(self, obj):
        return [
            {
                'id': b.id,
                'name': b.name,
                'zone_id': b.zone_id,
            }
            for b in obj.branches.all().order_by('id')
        ]

    class Meta:
        model = Company
        fields = ['id', 'name', 'type', 'created_at', 'branches']
        read_only_fields = ['id', 'created_at']
