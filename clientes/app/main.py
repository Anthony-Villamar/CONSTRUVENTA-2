from fastapi import FastAPI, HTTPException,Body
from fastapi.middleware.cors import CORSMiddleware
import pymysql
from app.database import get_connection
from app.models import Usuario

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"mensaje": " Usuarios funcionando"}

# 🟢 Registro de usuario
@app.post("/usuarios")
def registrar_usuario(usuario: Usuario):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO usuario (id_cliente, nombre, apellido, telefono, direccion, zona, email, password, rol)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            usuario.cedula, usuario.nombre, usuario.apellido,
            usuario.telefono, usuario.direccion, usuario.zona,
            usuario.email, usuario.password, usuario.rol
        ))

        conn.commit()
        return {"mensaje": "Usuario registrado correctamente"}

    except pymysql.err.IntegrityError:
        raise HTTPException(status_code=400, detail="La cédula o el correo ya existen")

    finally:
        cursor.close()
        conn.close()

# 🟢 Login de usuario
@app.post("/login")
def login(email: str, password: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id_cliente, nombre, apellido, rol FROM usuario
        WHERE email = %s AND password = %s
    """, (email, password))

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if user:
        return {
            "cedula": user[0],
            "nombre": user[1],
            "apellido": user[2],
            "rol": user[3],
            "mensaje": "Inicio de sesión exitoso"
        }
    else:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

# 🟢 Consultar usuario
@app.get("/usuarios/{cedula}")
def consultar_usuario(cedula: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id_cliente, nombre, apellido, telefono, direccion, zona, email
        FROM usuario WHERE id_cliente = %s
    """, (cedula,))
    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if row:
        return {
            "cedula": row[0],
            "nombre": row[1],
            "apellido": row[2],
            "telefono": row[3],
            "direccion": row[4],
            "zona": row[5],
            "email": row[6]
        }
    else:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

# 🟢 Actualizar usuario (patch)
@app.patch("/usuarios/{cedula}")
def actualizar_usuario(cedula: str, usuario: dict = Body(...)):
    conn = get_connection()
    cursor = conn.cursor()

    # Construir consulta dinámica SOLO con campos no vacíos
    campos = []
    valores = []
    for k, v in usuario.items():
        if k != "cedula" and v != "":
            campos.append(f"{k}=%s")
            valores.append(v)

    if not campos:
        raise HTTPException(status_code=400, detail="No se enviaron campos para actualizar")

    query = f"UPDATE usuario SET {', '.join(campos)} WHERE id_cliente=%s"
    valores.append(cedula)

    cursor.execute(query, valores)
    conn.commit()
    cursor.close()
    conn.close()

    return {"mensaje": "Usuario actualizado correctamente"}
