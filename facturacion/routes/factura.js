import express from "express";
import mysql from "mysql2/promise";
import axios from "axios";

const router = express.Router();

// Conexión a base de datos plataforma_construventa
router.post("/facturas", async (req, res) => {
  console.log("✅ Recibido POST /facturas:", req.body);

  const { id_pedido_global, transporte_precio } = req.body;
  if (!id_pedido_global) return res.status(400).json({ mensaje: "Falta id_pedido_global" });

  try {
    const [pedidos] = await db.execute(
      `SELECT producto, cantidad FROM pedido WHERE id_pedido_global = ?`,
      [id_pedido_global]
    );

    if (pedidos.length === 0) {
      return res.status(400).json({ mensaje: "No hay productos asociados a ese pedido global" });
    }

    let subtotalProductos = 0;
    for (const pedido of pedidos) {
      const [productoRows] = await db.execute(
        `SELECT precio FROM producto WHERE codigo_producto = ?`,
        [pedido.producto]
      );
      if (productoRows.length === 0) {
        return res.status(400).json({ mensaje: `Producto no encontrado: ${pedido.producto}` });
      }
      const precio = parseFloat(productoRows[0].precio);
      subtotalProductos += precio * pedido.cantidad;
    }

    const iva = subtotalProductos * 0.15;
    const total = subtotalProductos + iva + (parseFloat(transporte_precio) || 0);

    await db.execute(
      `INSERT INTO factura (id_pedido, fecha_emision, total, transporte_precio)
       VALUES (?, CONVERT_TZ(NOW(), '+00:00', '-05:00'), ?, ?)`,
      [id_pedido_global, total, transporte_precio]
    );

    res.json({
      mensaje: "Factura generada",
      subtotal: subtotalProductos,
      iva,
      transporte: parseFloat(transporte_precio) || 0,
      total
    });

  } catch (err) {
    console.error("❌ Error al generar factura:", err.message);
    res.status(500).json({ mensaje: "Error al generar factura" });
  }
});

// const db = await mysql.createConnection({
//    host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME || "plataforma_construventa",
//   port: process.env.DB_PORT || 3306,
// });



// // CREAR FACTURA Y CALCULAR TOTAL
// router.post("/facturas", async (req, res) => {
//     console.log("✅ Recibido POST /facturas:", req.body);

//     const { id_pedido_global, transporte_precio } = req.body;
//     if (!id_pedido_global) return res.status(400).json({ mensaje: "Falta id_pedido_global" });

//     try {
//         // 🔍 Buscar todos los pedidos que comparten ese id_pedido_global
//         const [pedidos] = await db.execute(
//             `SELECT producto, cantidad FROM pedido WHERE id_pedido_global = ?`,
//             [id_pedido_global]
//         );

//         if (pedidos.length === 0) {
//             return res.status(400).json({ mensaje: "No hay productos asociados a ese pedido global" });
//         }

//         let subtotalProductos = 0;

//         for (const pedido of pedidos) {
//             const [productoRows] = await db.execute(
//                 `SELECT precio FROM producto WHERE codigo_producto = ?`,
//                 [pedido.producto]
//             );

//             if (productoRows.length === 0) {
//                 return res.status(400).json({ mensaje: `Producto no encontrado: ${pedido.producto}` });
//             }

//             const precio = parseFloat(productoRows[0].precio);
//             subtotalProductos += precio * pedido.cantidad;
//         }

//         const subtotalConTransporte = subtotalProductos + (parseFloat(transporte_precio) || 0);
//         const iva = subtotalConTransporte * 0.15;
//         const monto_total = subtotalConTransporte + iva;

//         await db.execute(
//             `INSERT INTO factura (id_pedido, fecha_emision, total, transporte_precio)
//              VALUES (?, CONVERT_TZ(NOW(), '+00:00', '-05:00'), ?, ?)`,
//             [id_pedido_global, monto_total, transporte_precio]
//         );

//         console.log("✅ Factura generada correctamente");
//         res.json({
//             mensaje: "Factura generada",
//             subtotal: subtotalConTransporte,
//             iva,
//             monto_total
//         });

//     } catch (err) {
//         console.error("❌ Error al generar factura:", err.response?.data || err.message || err);
//         res.status(500).json({ mensaje: "Error al generar factura" });
//     }
// });


// CONSULTAR FACTURAS
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

// CONSULTAR FACTURAS POR ID
router.get("/facturas/usuario/:id_cliente", async (req, res) => {
    const { id_cliente } = req.params;

    try {
        const [facturas] = await db.execute(`
            SELECT f.id_factura, f.id_pedido, f.fecha_emision, f.total, f.transporte_precio
            FROM factura f
            JOIN pedido p ON f.id_pedido = p.id_pedido
            WHERE p.id_cliente = ?
            ORDER BY f.fecha_emision DESC
        `, [id_cliente]);

        res.json(facturas);
    } catch (error) {
        console.error("❌ Error al obtener facturas por usuario:", error.message);
        res.status(500).json({ mensaje: "Error al obtener facturas por usuario" });
    }
});


export default router;
