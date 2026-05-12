"""Crée la base MySQL swift_db (sans Django). Usage : python scripts/create_swift_db.py"""
import os

import MySQLdb

host = os.environ.get("MYSQL_HOST", "127.0.0.1")
user = os.environ.get("MYSQL_USER", "root")
password = os.environ.get("MYSQL_PASSWORD", "")
name = os.environ.get("MYSQL_DATABASE", "swift_db")

conn = MySQLdb.connect(host=host, user=user, passwd=password)
cur = conn.cursor()
cur.execute(
    f"CREATE DATABASE IF NOT EXISTS `{name}` "
    "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
)
conn.commit()
cur.close()
conn.close()
print(f"Base « {name} » prête.")
