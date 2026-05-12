from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def swift_order_api_dict(order, *, status_badge=None, rejected=False):
    """Carte commande pour le dashboard (modèle `orders.Order`)."""
    client = order.client
    client_nom = (client.get_full_name() or "").strip() or client.username
    items = list(order.items.all())
    product = ", ".join(i.product.name for i in items) if items else "—"
    address = (order.branch.address if order.branch_id else "") or "—"
    if order.client_lat is not None and order.client_lng is not None:
        address = f"{address} (coords {order.client_lat:.5f}, {order.client_lng:.5f})"
    badge = status_badge
    if badge is None:
        if order.status == "in_delivery":
            badge = "En cours"
        elif order.status == "completed":
            badge = "Livrée"
        elif rejected:
            badge = "Rejeté"
        else:
            badge = order.get_status_display()
    return {
        "id": order.pk,
        "numero": str(order.pk),
        "client_nom": client_nom,
        "product": product,
        "address": address,
        "price": str(order.total_price),
        "time": order.created_at.isoformat() if order.created_at else None,
        "status": order.status,
        "statusBadge": badge,
        "entreprise_nom": order.branch.name if order.branch_id else "",
    }


def order_payload_for_ws(cmd):
    return {
        "id": cmd.pk,
        "numero": cmd.numero,
        "client_nom": cmd.client_nom,
        "montant": str(cmd.montant),
        "statut": cmd.statut,
        "entreprise_nom": cmd.entreprise.nom if cmd.entreprise_id else "",
    }


def order_payload_api(cmd, *, status_badge=None, rejected=False):
    ent = cmd.entreprise.nom if cmd.entreprise_id else ""
    badge = status_badge
    if badge is None:
        if cmd.statut == "en_livraison":
            badge = "En cours"
        elif cmd.statut == "livree":
            badge = "Livrée"
        elif rejected:
            badge = "Rejeté"
        else:
            badge = cmd.get_statut_display()
    return {
        "id": cmd.pk,
        "numero": cmd.numero,
        "client_nom": cmd.client_nom,
        "product": "—",
        "address": "—",
        "price": str(cmd.montant),
        "time": cmd.created_at.isoformat() if cmd.created_at else None,
        "status": cmd.statut,
        "statusBadge": badge,
        "entreprise_nom": ent,
    }


def notify_order_channel(commande_id, payload):
    channel_layer = get_channel_layer()
    if not channel_layer:
        return
    async_to_sync(channel_layer.group_send)(
        f"order_{commande_id}",
        {"type": "order.notify", "data": payload},
    )
