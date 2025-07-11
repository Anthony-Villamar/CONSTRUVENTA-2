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
  const { id_pedido, id_cliente, direccion_entrega, zona_entrega, transporte_id } = req.body;

  // if (!id_pedido || !direccion_entrega || !transporte_id) {
  //   return res.status(400).json({ mensaje: "Faltan campos requeridos" });
  // }

    if (!id_pedido || !direccion_entrega) { // 🔥 elimina transporte_id de validación obligatoria
      return res.status(400).json({ mensaje: "Faltan campos requeridos" });
    }

  // 🔥 Aquí reemplaza
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 2);
  const fecha_estimada = fecha.toISOString().slice(0, 19).replace('T', ' '); // ⬅️ corregido

  try {
    await db.execute(`
    INSERT INTO envios (id_pedido, direccion_entrega, transporte_id, estado, fecha_estimada, zona_entrega, id_cliente)
    VALUES (?, ?, ?, 'pendiente', ?, ?, ?)
    `, [id_pedido, direccion_entrega, transporte_id, fecha_estimada, zona_entrega, id_cliente]);

    // await db.execute(`
    //   INSERT INTO envios (id_pedido, direccion_entrega, transporte_id, estado, fecha_estimada, zona_entrega,id_cliente)
    //   VALUES (?, ?, ?, 'pendiente', ?, ?, ?)
    // `, [id_pedido, direccion_entrega, transporte_id, fecha_estimada, zona_entrega, id_cliente]);

    res.json({ mensaje: "Envío registrado", id_pedido, fecha_estimada });
  } catch (error) {
    console.error("❌ Error al registrar el envío:", error.message);
    res.status(500).json({ mensaje: "Error al registrar envío", error: error.message });
  }
});



// Seguimiento de envios
router.get("/envios/usuario/:id_cliente", async (req, res) => {
  const { id_cliente } = req.params;

  try {
    const [filas] = await db.execute(`
      SELECT 
        e.*, 
        p.id_pedido_global, 
        GROUP_CONCAT(CONCAT(pr.nombre, ' x', p.cantidad) SEPARATOR ', ') AS productos,
        t.nombre AS transporte_nombre, 
        t.precio AS transporte_precio
      FROM envios e
      JOIN pedido p ON e.id_pedido = p.id_pedido_global
      JOIN producto pr ON p.producto = pr.codigo_producto
      JOIN transportes t ON e.transporte_id = t.id
      WHERE p.id_cliente = ?
      GROUP BY e.id_envio, p.id_pedido_global
      ORDER BY e.fecha_estimada DESC
    `, [id_cliente]);

    res.json(filas);
  } catch (error) {
    console.error("❌ Error al obtener envíos:", error.message);
    res.status(500).json({ mensaje: "Error al obtener envíos", error: error.message });
  }
});


// Asignar transporte a un envio
router.put("/envios/:id", async (req, res) => {
  const { id } = req.params;
  const { transporte_id } = req.body;

  if (!transporte_id) return res.status(400).json({ mensaje: "Falta transporte_id" });

  try {
    await db.execute(`UPDATE envios SET transporte_id = ? WHERE id_envio = ?`, [transporte_id, id]);
    res.json({ mensaje: "Transporte asignado correctamente" });
  } catch (error) {
    console.error("❌ Error al asignar transporte:", error.message);
    res.status(500).json({ mensaje: "Error al asignar transporte", error: error.message });
  }
});



export default router;
