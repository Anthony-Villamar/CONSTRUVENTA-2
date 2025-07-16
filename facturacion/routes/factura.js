import express from "express";
import mysql from "mysql2/promise";

const router = express.Router();

// Conexión a base de datos
const db = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "plataforma_construventa",
  port: process.env.DB_PORT || 3306,
});



// router.post("/facturas", async (req, res) => {
//   const { id_pedido_global } = req.body;  // Retirado transporte_precio de los parámetros del cuerpo
//   if (!id_pedido_global) return res.status(400).json({ mensaje: "Falta id_pedido_global" });

//   try {
//     // Obtener los productos del pedido
//     const [pedidos] = await db.execute(
//       `SELECT producto, cantidad FROM pedido WHERE id_pedido_global = ?`,
//       [id_pedido_global]
//     );

//     if (pedidos.length === 0) {
//       return res.status(400).json({ mensaje: "No hay productos en ese pedido global" });
//     }

//     let subtotal = 0;
//     for (const pedido of pedidos) {
//       const [productoRow] = await db.execute(
//         `SELECT precio FROM producto WHERE codigo_producto = ?`,
//         [pedido.producto]
//       );
//       if (productoRow.length === 0) continue;
//       const precio = parseFloat(productoRow[0].precio);
//       subtotal += precio * pedido.cantidad;
//     }

//     // Obtener el precio del transporte desde la tabla envios
//     const [envio] = await db.execute(
//       `SELECT e.transporte_id, t.precio AS transporte_precio 
//        FROM envios e 
//        JOIN transportes t ON e.transporte_id = t.id
//        WHERE e.id_pedido = ?`,
//       [id_pedido_global]
//     );

//     if (envio.length === 0) {
//       return res.status(400).json({ mensaje: "No se encontró transporte para el pedido" });
//     }

//     const transporte_precio = parseFloat(envio[0].transporte_precio) || 0;
    
//     const iva = subtotal * 0.15;
//     const total = subtotal + iva + transporte_precio;

//     // Insertar la factura en la base de datos
//     await db.execute(
//       `INSERT INTO factura (id_pedido, fecha_emision, total, transporte_precio)
//        VALUES (?, CONVERT_TZ(NOW(), '+00:00', '-05:00'), ?, ?)`,
//       [id_pedido_global, total, transporte_precio]
//     );

//     res.json({ mensaje: "Factura generada", subtotal, iva, transporte: transporte_precio, total });

//   } catch (err) {
//     console.error("❌ Error al generar factura:", err.message);
//     res.status(500).json({ mensaje: "Error al generar factura" });
//   }
// });

// // POST /facturas
router.post("/facturas", async (req, res) => {
  const { id_pedido_global, transporte_precio } = req.body;
  if (!id_pedido_global) return res.status(400).json({ mensaje: "Falta id_pedido_global" });

  try {
    const [pedidos] = await db.execute(
      `SELECT producto, cantidad FROM pedido WHERE id_pedido_global = ?`,
      [id_pedido_global]
    );

    if (pedidos.length === 0) {
      return res.status(400).json({ mensaje: "No hay productos en ese pedido global" });
    }

    let subtotal = 0;
    for (const pedido of pedidos) {
      const [productoRow] = await db.execute(
        `SELECT precio FROM producto WHERE codigo_producto = ?`,
        [pedido.producto]
      );
      if (productoRow.length === 0) continue;
      const precio = parseFloat(productoRow[0].precio);
      subtotal += precio * pedido.cantidad;
    }

    const iva = subtotal * 0.15;
    const total = subtotal + iva + (parseFloat(transporte_precio) || 0);

    await db.execute(
      `INSERT INTO factura (id_pedido, fecha_emision, total, transporte_precio)
       VALUES (?, CONVERT_TZ(NOW(), '+00:00', '-05:00'), ?, ?)`,
      [id_pedido_global, total, transporte_precio]
    );

    res.json({ mensaje: "Factura generada", subtotal, iva, transporte: parseFloat(transporte_precio) || 0, total });

  } catch (err) {
    console.error("❌ Error al generar factura:", err.message);
    res.status(500).json({ mensaje: "Error al generar factura" });
  }
});


// // CONSULTAR FACTURAS
router.get("/facturas", async (req, res) => {
    try {
        const [facturas] = await db.execute(`
            SELECT f.id_factura, f.id_pedido, f.fecha_emision, f.total, f.transporte_precio
            FROM factura f
            ORDER BY f.fecha_emision DESC
        `);

        res.json(facturas);
    } catch (error) {
        console.error("❌ Error al obtener facturas:", error.message);
        res.status(500).json({ mensaje: "Error al obtener facturas" });
    }
});

// GET /facturas/usuario/:id_cliente (para compras.js)
router.get("/facturas/usuario/:id_cliente", async (req, res) => {
  const { id_cliente } = req.params;

  try {
    const [result] = await db.execute(`
      SELECT 
        f.id_factura AS numero_factura,
        f.id_pedido AS id_pedido_global,
        DATE_FORMAT(f.fecha_emision, '%Y-%m-%d %H:%i:%s') AS fecha_compra,
        f.total,
        f.transporte_precio,
        ROUND(f.total / 1.15, 2) AS subtotal,
        GROUP_CONCAT(CONCAT(pr.nombre, ' x', p.cantidad) SEPARATOR ', ') AS productos
      FROM factura f
      JOIN pedido p ON f.id_pedido = p.id_pedido_global
      JOIN producto pr ON p.producto = pr.codigo_producto
      WHERE p.id_cliente = ?
      GROUP BY f.id_factura, f.id_pedido, f.fecha_emision, f.total, f.transporte_precio
      ORDER BY f.fecha_emision DESC
    `, [id_cliente]);

    res.json(result);

  } catch (error) {
    console.error("❌ Error al obtener facturas por usuario:", error.message);
    res.status(500).json({ mensaje: "Error al obtener facturas por usuario" });
  }
});

//para facturas.html
// GET /facturas/usuario/:id_cliente
router.get("/facturas/usuarios/:id_cliente", async (req, res) => {
  const { id_cliente } = req.params;

  try {
    const [facturas] = await db.execute(`
      SELECT 
        f.id_factura, 
        f.id_pedido, 
        f.fecha_emision, 
        f.total, 
        f.transporte_precio,
        e.transporte_id, 
        t.nombre AS transporte_nombre,
        t.precio AS transporte_precio
      FROM factura f
      JOIN envios e ON f.id_pedido = e.id_pedido
      LEFT JOIN transportes t ON e.transporte_id = t.id
      WHERE e.id_cliente = ?
      ORDER BY f.fecha_emision DESC
    `, [id_cliente]);

    res.json(facturas);
  } catch (error) {
    console.error("❌ Error al obtener facturas:", error.message);
    res.status(500).json({ mensaje: "Error al obtener facturas" });
  }
});



export default router;

