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
// router.post("/envios", async (req, res) => {
//   const { id_pedido, direccion_entrega, zona_entrega, transporte_id } = req.body;

//   if (!id_pedido || !direccion_entrega || !transporte_id) {
//     return res.status(400).json({ mensaje: "Faltan campos requeridos" });
//   }

//   // const fecha = new Date();
//   // fecha.setDate(fecha.getDate() + 2);
//   // const fecha_estimada = fecha.toISOString().split("T")[0];
// const fecha = new Date();
// fecha.setDate(fecha.getDate() + 2);
// const fecha_estimada = fecha.toISOString().slice(0, 19).replace('T', ' ');


//   try {
//     await db.execute(`
//       INSERT INTO envios (id_pedido, direccion_entrega, transporte_id, estado, fecha_estimada, zona_entrega)
//       VALUES (?, ?, ?, 'pendiente', ?, ?)
//     `, [id_pedido, direccion_entrega, transporte_id, fecha_estimada, zona_entrega]);

//     res.json({ mensaje: "Envío registrado", id_pedido, fecha_estimada });
//   } catch (error) {
//     console.error("❌ Error al registrar el envío:", error.message);
//     res.status(500).json({ mensaje: "Error al registrar envío", error: error.message });
//   }
// });
// Registrar envío
router.post("/envios", async (req, res) => {
  const { id_pedido, direccion_entrega, zona_entrega, transporte_id } = req.body;

  if (!id_pedido || !direccion_entrega || !transporte_id) {
    return res.status(400).json({ mensaje: "Faltan campos requeridos" });
  }

  // 🔥 Aquí reemplaza
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 2);
  const fecha_estimada = fecha.toISOString().slice(0, 19).replace('T', ' '); // ⬅️ corregido

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

export default router;
