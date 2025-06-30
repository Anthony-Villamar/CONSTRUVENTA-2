import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    connection = pymysql.connect(
        host=os.getenv("DB_HOST") or "localhost",
        user=os.getenv("DB_USER") or "root",
        password=os.getenv("DB_PASSWORD") or "",
        database=os.getenv("DB_NAME") or "plataforma_construventa",
        port=int(os.getenv("DB_PORT") or 3306),
    )
    return connection
