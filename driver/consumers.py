import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.db import IntegrityError, transaction

from delivery.models import Delivery
from orders.models import Order

from .models import Driver, DriverOrder


class DriverConsumer(WebsocketConsumer):
    """Livreur : session `driver_id`, groupe `drivers_room`."""

    def connect(self):
        session = self.scope.get("session")
        if hasattr(session, "load"):
            session.load()
        driver_id = session.get("driver_id")
        if not driver_id:
            self.close()
            return
        if not Driver.objects.filter(pk=driver_id).exists():
            self.close()
            return
        self.driver_id = driver_id
        self.group_name = "drivers_room"
        async_to_sync(self.channel_layer.group_add)(self.group_name, self.channel_name)
        self.accept()

    def disconnect(self, code):
        if getattr(self, "group_name", None):
            async_to_sync(self.channel_layer.group_discard)(
                self.group_name, self.channel_name
            )

    def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data or "{}")
        except json.JSONDecodeError:
            return
        msg_type = data.get("type")
        if msg_type == "order_accepted":
            self._handle_accept(int(data.get("order_id")))
        elif msg_type == "order_rejected":
            self._handle_reject(int(data.get("order_id")))
        elif msg_type == "mark_delivered":
            self._handle_mark_delivered(int(data.get("order_id")))

    def _handle_accept(self, order_id):
        try:
            with transaction.atomic():
                order = (
                    Order.objects.select_for_update()
                    .filter(pk=order_id)
                    .first()
                )
                if not order:
                    self.send(
                        text_data=json.dumps(
                            {"type": "error", "code": "missing", "action": "accept"}
                        )
                    )
                    return
                if order.status not in ("pending", "assigned") or order.swift_driver_id:
                    self.send(
                        text_data=json.dumps(
                            {"type": "error", "code": "taken", "action": "accept"}
                        )
                    )
                    return
                Delivery.objects.filter(order=order).delete()
                order.swift_driver_id = self.driver_id
                order.status = "in_delivery"
                order.save(update_fields=["swift_driver", "status"])
                DriverOrder.objects.create(
                    driver_id=self.driver_id, order=order, status="current"
                )
        except IntegrityError:
            self.send(
                text_data=json.dumps(
                    {"type": "error", "code": "taken", "action": "accept"}
                )
            )
            return
        except Exception:
            self.send(
                text_data=json.dumps(
                    {"type": "error", "code": "accept_failed", "action": "accept"}
                )
            )
            return

        order = (
            Order.objects.select_related("client", "branch")
            .prefetch_related("items__product")
            .get(pk=order_id)
        )
        from .utils import swift_order_api_dict

        self.send(
            text_data=json.dumps(
                {"type": "order_accepted_ok", "order": swift_order_api_dict(order)}
            )
        )
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                "type": "order.cancelled",
                "order_id": order_id,
                "accepted_by": self.channel_name,
            },
        )

    def _handle_reject(self, order_id):
        order = Order.objects.filter(pk=order_id).first()
        if not order or order.status != "pending":
            self.send(
                text_data=json.dumps(
                    {"type": "error", "code": "reject_invalid", "action": "reject"}
                )
            )
            return
        if DriverOrder.objects.filter(
            driver_id=self.driver_id, order_id=order_id
        ).exists():
            self.send(
                text_data=json.dumps(
                    {"type": "error", "code": "already_recorded", "action": "reject"}
                )
            )
            return
        try:
            DriverOrder.objects.create(
                driver_id=self.driver_id, order=order, status="rejected"
            )
        except Exception:
            self.send(
                text_data=json.dumps(
                    {"type": "error", "code": "reject_failed", "action": "reject"}
                )
            )
            return
        from .utils import swift_order_api_dict

        self.send(
            text_data=json.dumps(
                {
                    "type": "add_to_rejected",
                    "order": swift_order_api_dict(order, rejected=True),
                }
            )
        )

    def _handle_mark_delivered(self, order_id):
        try:
            with transaction.atomic():
                do = (
                    DriverOrder.objects.select_for_update()
                    .filter(
                        driver_id=self.driver_id,
                        order_id=order_id,
                        status="current",
                    )
                    .first()
                )
                if not do:
                    self.send(
                        text_data=json.dumps(
                            {
                                "type": "error",
                                "code": "not_found",
                                "action": "mark_delivered",
                            }
                        )
                    )
                    return
                order = Order.objects.select_for_update().get(pk=order_id)
                if order.status != "in_delivery":
                    self.send(
                        text_data=json.dumps(
                            {
                                "type": "error",
                                "code": "bad_status",
                                "action": "mark_delivered",
                            }
                        )
                    )
                    return
                cid = order.client_id
                do.status = "delivered"
                do.save(update_fields=["status"])
                order.status = "completed"
                order.save(update_fields=["status"])
        except Order.DoesNotExist:
            self.send(
                text_data=json.dumps(
                    {"type": "error", "code": "missing", "action": "mark_delivered"}
                )
            )
            return

        order = (
            Order.objects.select_related("client", "branch")
            .prefetch_related("items__product")
            .get(pk=order_id)
        )
        from .utils import swift_order_api_dict

        self.send(
            text_data=json.dumps(
                {
                    "type": "move_to_delivered",
                    "order": swift_order_api_dict(order),
                }
            )
        )
        async_to_sync(self.channel_layer.group_send)(
            f"client_{order.client_id}",
            {
                "type": "order.delivered",
                "message": "Votre livreur est arrivé ! Commande livrée.",
            },
        )

    def new_order(self, event):
        self.send(
            text_data=json.dumps(
                {
                    "type": "new_order",
                    "order_id": event["order_id"],
                    "client_name": event["client_name"],
                    "product": event["product"],
                    "address": event["address"],
                    "price": event["price"],
                    "time": event["time"],
                }
            )
        )

    def order_cancelled(self, event):
        if event.get("accepted_by") == self.channel_name:
            return
        self.send(
            text_data=json.dumps(
                {
                    "type": "order_cancelled",
                    "order_id": event["order_id"],
                }
            )
        )


class ClientConsumer(WebsocketConsumer):
    """Client connecté : groupe `client_<id>`."""

    def connect(self):
        try:
            self.client_id = int(self.scope["url_route"]["kwargs"]["client_id"])
        except (KeyError, ValueError, TypeError):
            self.close()
            return
        user = self.scope.get("user")
        if not user.is_authenticated or user.pk != self.client_id:
            self.close()
            return
        self.group_name = f"client_{self.client_id}"
        async_to_sync(self.channel_layer.group_add)(self.group_name, self.channel_name)
        self.accept()

    def disconnect(self, code):
        if getattr(self, "group_name", None):
            async_to_sync(self.channel_layer.group_discard)(
                self.group_name, self.channel_name
            )

    def order_delivered(self, event):
        self.send(
            text_data=json.dumps(
                {
                    "type": "order_delivered",
                    "message": event.get(
                        "message",
                        "Votre livreur est arrivé ! Commande livrée.",
                    ),
                }
            )
        )


class OrderClientConsumer(WebsocketConsumer):
    """Suivi par id commande (autres écrans)."""

    def connect(self):
        oid = self.scope["url_route"]["kwargs"]["order_id"]
        self.group_name = f"order_{oid}"
        async_to_sync(self.channel_layer.group_add)(self.group_name, self.channel_name)
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name, self.channel_name
        )

    def order_notify(self, event):
        self.send(text_data=json.dumps(event.get("data", {})))
