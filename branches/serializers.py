from rest_framework import serializers

from .models import Branch, Zone


class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = ['id', 'name', 'traffic_level']


class BranchSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    zone_name = serializers.CharField(source='zone.name', read_only=True)

    class Meta:
        model = Branch
        fields = [
            'id',
            'company',
            'company_name',
            'name',
            'zone',
            'zone_name',
            'address',
            'latitude',
            'longitude',
        ]
