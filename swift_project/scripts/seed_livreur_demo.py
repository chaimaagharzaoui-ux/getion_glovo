import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "swift_project.settings")
django.setup()

from django.contrib.auth.hashers import make_password
from django.db import connection

h = make_password("swift2024")
with connection.cursor() as c:
    c.execute("SELECT 1 FROM livreurs_livreur WHERE email=%s", ["livreur@swift.ma"])
    if c.fetchone():
        print("Livreur demo deja present: livreur@swift.ma")
    else:
        c.execute(
            """
            INSERT INTO livreurs_livreur (
                nom, prenom, email, telephone, mot_de_passe, en_ligne, statut,
                note_moyenne, total_notes, somme_notes, valide, created_at, user_id
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW(),NULL)
            """,
            [
                "Demo",
                "Ahmed",
                "livreur@swift.ma",
                "+212600000000",
                h,
                False,
                "hors_ligne",
                0,
                0,
                0,
                True,
            ],
        )
        print("Cree: livreur@swift.ma / swift2024")
