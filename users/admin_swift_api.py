"""API panneau admin Swift — données réelles (MySQL), réservé à l’admin principal."""
from datetime import timedelta

from django.core.paginator import Paginator
from django.db.models import Count, Exists, FloatField, Max, OuterRef, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from companies.models import Company
from driver.models import Driver, DriverOrder
from orders.models import Order
from users.models import User

from .admin_swift_utils import is_swift_principal_admin, principal_admin_forbidden


def _guard(request):
    if not request.user.is_authenticated:
        return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
    if not is_swift_principal_admin(request.user):
        return principal_admin_forbidden()
    return None


class SwiftAdminDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        err = _guard(request)
        if err:
            return err

        now = timezone.now()
        start_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = now - timedelta(days=7)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        total_clients = User.objects.filter(role='client').count()
        total_entreprises = Company.objects.count()
        total_livreurs = Driver.objects.count()
        livreurs_en_ligne = Driver.objects.filter(
            Exists(DriverOrder.objects.filter(driver=OuterRef('pk'), status='current'))
        ).count()
        livreurs_valides = Driver.objects.filter(compte_statut='valide').count()
        livreurs_en_attente = Driver.objects.filter(compte_statut='en_attente').count()

        total_commandes = Order.objects.count()
        commandes_aujourdhui = Order.objects.filter(created_at__gte=start_today).count()
        commandes_en_cours = Order.objects.filter(status__in=('pending', 'assigned', 'in_delivery')).count()
        commandes_livrees = Order.objects.filter(status='completed').count()
        commandes_annulees = Order.objects.filter(status='cancelled').count()

        def _sum_completed(since):
            v = Order.objects.filter(status='completed', created_at__gte=since).aggregate(
                t=Coalesce(Sum('total_price'), Value(0.0), output_field=FloatField())
            )['t']
            return float(v or 0)

        revenu_aujourdhui = _sum_completed(start_today)
        revenu_semaine = float(_sum_completed(week_ago))
        revenu_mois = float(_sum_completed(month_start))

        taux = round((commandes_livrees / total_commandes) * 100, 1) if total_commandes else 0

        graphique = []
        for offset in range(6, -1, -1):
            d = (timezone.now().date() - timedelta(days=offset))
            agg = Order.objects.filter(created_at__date=d).aggregate(
                total=Count('id'),
                revenus=Coalesce(Sum('total_price'), Value(0.0), output_field=FloatField()),
            )
            graphique.append(
                {
                    'date': d.isoformat(),
                    'total': agg['total'],
                    'revenus': float(agg['revenus'] or 0),
                }
            )

        return Response(
            {
                'clients': {'total': total_clients},
                'entreprises': {'total': total_entreprises, 'actives': Company.objects.filter(is_active=True).count()},
                'livreurs': {
                    'total': total_livreurs,
                    'enLigne': livreurs_en_ligne,
                    'valides': livreurs_valides,
                    'enAttente': livreurs_en_attente,
                },
                'commandes': {
                    'total': total_commandes,
                    'aujourdhui': commandes_aujourdhui,
                    'enCours': commandes_en_cours,
                    'livrees': commandes_livrees,
                    'annulees': commandes_annulees,
                    'tauxReussite': taux,
                },
                'revenus': {
                    'aujourdhui': revenu_aujourdhui,
                    'semaine': revenu_semaine,
                    'mois': revenu_mois,
                },
                'graphique': graphique,
            }
        )


class SwiftAdminClientsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        err = _guard(request)
        if err:
            return err
        page = max(1, int(request.query_params.get('page', 1)))
        limit = min(100, max(1, int(request.query_params.get('limit', 20))))
        search = (request.query_params.get('search') or '').strip()

        qs = User.objects.filter(role='client').order_by('-date_joined')
        if search:
            qs = qs.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )

        paginator = Paginator(qs, limit)
        p = paginator.get_page(page)
        clients = []
        for u in p.object_list:
            agg = Order.objects.filter(client=u).aggregate(
                total_commandes=Count('id'),
                total_depense=Coalesce(Sum('total_price'), Value(0.0), output_field=FloatField()),
                derniere_commande=Max('created_at'),
            )
            clients.append(
                {
                    'id': u.id,
                    'nom': (u.get_full_name() or u.username or '').strip() or u.username,
                    'prenom': '',
                    'email': u.email or '',
                    'telephone': u.phone or '',
                    'createdAt': u.date_joined.isoformat() if u.date_joined else None,
                    'totalCommandes': agg['total_commandes'] or 0,
                    'totalDepense': float(agg['total_depense'] or 0),
                    'derniereCommande': agg['derniere_commande'].isoformat() if agg['derniere_commande'] else None,
                }
            )
        return Response({'clients': clients, 'total': paginator.count, 'pages': paginator.num_pages})


class SwiftAdminClientHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        err = _guard(request)
        if err:
            return err
        if not User.objects.filter(pk=pk, role='client').exists():
            return Response({'detail': 'Client introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        rows = []
        for o in (
            Order.objects.filter(client_id=pk)
            .select_related('branch__company', 'swift_driver')
            .order_by('-created_at')[:200]
        ):
            rows.append(_order_history_dict(o))
        return Response(rows)


class SwiftAdminClientDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        err = _guard(request)
        if err:
            return err
        u = User.objects.filter(pk=pk, role='client').first()
        if not u:
            return Response({'detail': 'Client introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        u.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def _order_history_dict(o: Order):
    ent = None
    if o.branch_id:
        try:
            ent = o.branch.company.name
        except Exception:
            ent = o.branch.name
    liv = None
    if o.swift_driver_id:
        d = o.swift_driver
        liv = f'{d.first_name} {d.last_name}'.strip()
    return {
        'id': o.id,
        'createdAt': o.created_at.isoformat() if o.created_at else None,
        'statut': o.status,
        'total': float(o.total_price or 0),
        'entreprise': {'nom': ent or '—'},
        'livreur': {'nom': liv} if liv else {'nom': None},
        'branch_name': o.branch.name if o.branch_id else '—',
    }


class SwiftAdminEntreprisesListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        err = _guard(request)
        if err:
            return err
        search = (request.query_params.get('search') or '').strip()
        qs = Company.objects.all().order_by('-created_at')
        if search:
            qs = qs.filter(name__icontains=search)
        out = []
        for c in qs:
            agg = Order.objects.filter(branch__company=c, status='completed').aggregate(
                n=Count('id'),
                rev=Coalesce(Sum('total_price'), Value(0.0), output_field=FloatField()),
            )
            out.append(
                {
                    'id': c.id,
                    'nom': c.name,
                    'categorie': c.get_type_display(),
                    'ville': '',
                    'statut': 'valide' if c.is_active else 'suspendu',
                    'is_active': c.is_active,
                    'totalCommandes': agg['n'] or 0,
                    'revenus': float(agg['rev'] or 0),
                    'createdAt': c.created_at.isoformat() if c.created_at else None,
                }
            )
        return Response(out)


class SwiftAdminEntrepriseHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        err = _guard(request)
        if err:
            return err
        if not Company.objects.filter(pk=pk).exists():
            return Response({'detail': 'Entreprise introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        rows = []
        for o in (
            Order.objects.filter(branch__company_id=pk)
            .select_related('client', 'branch', 'swift_driver')
            .order_by('-created_at')[:200]
        ):
            cli = o.client
            rows.append(
                {
                    'id': o.id,
                    'createdAt': o.created_at.isoformat() if o.created_at else None,
                    'statut': o.status,
                    'total': float(o.total_price or 0),
                    'client': {'nom': (cli.get_full_name() or cli.username) if cli else '—', 'email': cli.email or ''},
                    'livreur': {'nom': f'{o.swift_driver.first_name} {o.swift_driver.last_name}'.strip()}
                    if o.swift_driver_id
                    else {'nom': None},
                }
            )
        return Response(rows)


class SwiftAdminEntrepriseActivateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        err = _guard(request)
        if err:
            return err
        c = Company.objects.filter(pk=pk).first()
        if not c:
            return Response({'detail': 'Entreprise introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        c.is_active = True
        c.save(update_fields=['is_active'])
        return Response({'ok': True})


class SwiftAdminEntrepriseSuspendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        err = _guard(request)
        if err:
            return err
        c = Company.objects.filter(pk=pk).first()
        if not c:
            return Response({'detail': 'Entreprise introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        c.is_active = False
        c.save(update_fields=['is_active'])
        return Response({'ok': True})


class SwiftAdminLivreursListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        err = _guard(request)
        if err:
            return err
        statut = (request.query_params.get('statut') or 'tous').strip()
        qs = Driver.objects.annotate(
            en_ligne=Exists(DriverOrder.objects.filter(driver=OuterRef('pk'), status='current'))
        ).order_by('-created_at')
        if statut and statut != 'tous':
            qs = qs.filter(compte_statut=statut)
        out = []
        for d in qs:
            agg = Order.objects.filter(swift_driver=d, status='completed').aggregate(
                n=Count('id'),
                gains=Coalesce(Sum('total_price'), Value(0.0), output_field=FloatField()),
            )
            out.append(
                {
                    'id': d.id,
                    'nom': d.last_name,
                    'prenom': d.first_name,
                    'email': d.email,
                    'vehicule': d.get_vehicle_display(),
                    'statut': d.compte_statut,
                    'enLigne': bool(d.en_ligne),
                    'note': None,
                    'totalLivraisons': agg['n'] or 0,
                    'gainsTotal': float(agg['gains'] or 0),
                    'createdAt': d.created_at.isoformat() if d.created_at else None,
                }
            )
        return Response(out)


class SwiftAdminLivreurHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        err = _guard(request)
        if err:
            return err
        if not Driver.objects.filter(pk=pk).exists():
            return Response({'detail': 'Livreur introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        rows = []
        for o in Order.objects.filter(swift_driver_id=pk).select_related('client', 'branch__company').order_by('-created_at')[:200]:
            cli = o.client
            ent = o.branch.company.name if o.branch_id else '—'
            rows.append(
                {
                    'id': o.id,
                    'createdAt': o.created_at.isoformat() if o.created_at else None,
                    'statut': o.status,
                    'total': float(o.total_price or 0),
                    'client': {'nom': (cli.get_full_name() or cli.username) if cli else '—'},
                    'entreprise': {'nom': ent},
                }
            )
        return Response(rows)


class SwiftAdminLivreurValiderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        err = _guard(request)
        if err:
            return err
        d = Driver.objects.filter(pk=pk).first()
        if not d:
            return Response({'detail': 'Livreur introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        d.compte_statut = 'valide'
        d.save(update_fields=['compte_statut'])
        return Response({'ok': True})


class SwiftAdminLivreurSuspendreView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        err = _guard(request)
        if err:
            return err
        d = Driver.objects.filter(pk=pk).first()
        if not d:
            return Response({'detail': 'Livreur introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        d.compte_statut = 'suspendu'
        d.save(update_fields=['compte_statut'])
        return Response({'ok': True})
