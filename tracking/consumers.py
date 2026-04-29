import json

from channels.generic.websocket import AsyncWebsocketConsumer


class DeliveryTrackingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.delivery_id = self.scope['url_route']['kwargs']['delivery_id']
        self.group_name = f'delivery_{self.delivery_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        # Le serveur pousse les updates; le client ne pilote pas l'etat ici.
        return

    async def delivery_update(self, event):
        await self.send(text_data=json.dumps(event['data']))
