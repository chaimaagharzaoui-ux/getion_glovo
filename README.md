# Smart Multi-Service Delivery Platform

Plateforme de livraison multi-entreprises (pharmacie, supermarche, sport, etc.) basee sur Django + DRF.

## Structure des apps

- `users`: authentification, roles, interfaces role-based
- `companies`: gestion des entreprises
- `branches`: gestion des zones et des branches
- `products`: catalogue produits et stock
- `orders`: creation/suivi des commandes
- `delivery`: cycle livreur + geolocalisation
- `payments`: paiement de commande
- `notifications`: notifications metier
- `tracking`: WebSocket de suivi livraison

## Roles supportes

- `admin`
- `manager`
- `client`
- `delivery`

Interfaces web:

- `/app/login`: connexion / inscription
- `/app/dashboard`: dashboard adapte au role connecte

## Endpoints API principaux

### Authentification

- `POST /register`
- `POST /login`
- `POST /logout`
- `GET /dashboard` (admin)

### Backoffice (manager/admin)

- `CRUD /companies/`
- `CRUD /zones/`
- `CRUD /branches/`
- `CRUD /manage/products/`

### Client

- `GET /products?zone=<id>&branch=<id>`
- `POST /order/create`
- `GET /order/track/<id>`
- `POST /payment/pay`

### Livreur

- `GET /driver/orders`
- `POST /driver/accept`
- `POST /driver/reject`
- `POST /driver/update-location`
- `POST /driver/complete`

### Tracking temps reel

- `WS /ws/tracking/<delivery_id>/`

## Workflow commande/livraison

1. Le client cree une commande.
2. Le stock est debite de facon atomique.
3. Le systeme assigne automatiquement un livreur disponible de la meme zone.
4. Le livreur accepte ou rejette.
5. Les mises a jour de position sont diffusees en WebSocket.
6. Livraison terminee => commande `completed` + livreur redevient disponible.

## Demarrage local dans VS Code

```bash
python -m venv .venv
.venv\Scripts\activate
pip install django djangorestframework channels
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Test rapide (MVP)

1. Ouvrir `http://127.0.0.1:8000/app/login`
2. Creer des utilisateurs (manager, client, delivery)
3. Connecter manager -> creer zone, company, branch, products
4. Connecter client -> creer commande
5. Connecter livreur -> accepter la livraison et pousser la position
6. Verifier le suivi avec `WS /ws/tracking/<delivery_id>/`
