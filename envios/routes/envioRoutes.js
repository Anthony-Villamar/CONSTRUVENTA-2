import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();

const db = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "plataforma_construventa",
  port: process.env.DB_PORT || 3306
});

// Obtener TODOS los transportes
router.get("/transportes", async (req, res) => {
  try {
    const [filas] = await db.execute(`SELECT * FROM transportes`);
    res.json(filas);
  } catch (error) {
    console.error("❌ Error al obtener transportes:", error.message);
    res.status(500).json({ mensaje: "Error al obtener transportes", error: error.message });
  }
});

// Obtener transportes por zona
router.get("/transportes/:zona", async (req, res) => {
  const zona = req.params.zona;
  const [filas] = await db.execute(`SELECT * FROM transportes WHERE zonas_disponibles LIKE ?`, [`%${zona}%`]);
  res.json(filas);
});

// Registrar envío
router.post("/envios", async (req, res) => {
  const { id_pedido, direccion_entrega, zona_entrega, transporte_id } = req.body;

  if (!id_pedido || !direccion_entrega || !transporte_id) {
    return res.status(400).json({ mensaje: "Faltan campos requeridos" });
  }

  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 2);
  const fecha_estimada = fecha.toISOString().split("T")[0];

  try {
    await db.execute(`
      INSERT INTO envios (id_pedido, direccion_entrega, transporte_id, estado, fecha_estimada, zona_entrega)
      VALUES (?, ?, ?, 'pendiente', ?, ?)
    `, [id_pedido, direccion_entrega, transporte_id, fecha_estimada, zona_entrega]);

    res.json({ mensaje: "Envío registrado", id_pedido, fecha_estimada });
  } catch (error) {
    console.error("❌ Error al registrar el envío:", error.message);
    res.status(500).json({ mensaje: "Error al registrar envío", error: error.message });
  }
});

// Obtener envíos por usuario
router.get("/envios/usuario/:id_cliente", async (req, res) => {
  const { id_cliente } = req.params;

  try {
    const [filas] = await db.execute(`
      SELECT e.*, t.nombre AS transporte_nombre, t.precio AS transporte_precio
      FROM envios e
      JOIN pedido p ON e.id_pedido = p.id_pedido
      JOIN transportes t ON e.transporte_id = t.id
      WHERE p.id_cliente = ?
    `, [id_cliente]);

    res.json(filas);
  } catch (error) {
    console.error("❌ Error al obtener envíos:", error.message);
    res.status(500).json({ mensaje: "Error al obtener envíos", error: error.message });
  }
});

// Simulación automática
const estados = ["pendiente", "en tránsito", "entregado"];
setInterval(async () => {
  try {
    const [envios] = await db.execute(`SELECT id_envio, estado FROM envios WHERE estado != 'entregado'`);
    for (const envio of envios) {
      const currentIndex = estados.indexOf(envio.estado);
      const nextEstado = estados[currentIndex + 1] || "entregado";
      await db.execute(`UPDATE envios SET estado = ? WHERE id_envio = ?`, [nextEstado, envio.id_envio]);
      console.log(`🔄 Estado de envío ${envio.id_envio} actualizado a '${nextEstado}'`);
    }
  } catch (error) {
    console.error("❌ Error en simulación automática:", error.message);
  }
}, 45000);

export default router;
