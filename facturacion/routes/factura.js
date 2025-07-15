import express from "express";
import mysql from "mysql2/promise";
import axios from "axios";

const router = express.Router();

// Conexión a base de datos plataforma_construventa
const db = await mysql.createConnection({
   host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "plataforma_construventa",
  port: process.env.DB_PORT || 3306,
});



// CREAR FACTURA Y CALCULAR TOTAL
router.post("/facturas", async (req, res) => {
  console.log("✅ Recibido POST /facturas:", req.body);

  const { id_pedido_global, transporte_precio } = req.body;
  if (!id_pedido_global) {
    return res.status(400).json({ mensaje: "Falta id_pedido_global" });
  }

  try {
    // 1. Obtener todos los pedidos relacionados al id_pedido_global
    const [pedidos] = await db.execute(
      `SELECT * FROM pedido WHERE id_pedido_global = ?`,
      [id_pedido_global]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({ mensaje: "No se encontraron pedidos" });
    }

    let subtotal = 0;

    for (const p of pedidos) {
      const [producto] = await db.execute(
        `SELECT precio FROM producto WHERE codigo_producto = ?`,
        [p.codigo_producto]
      );

      if (producto.length === 0) {
        return res.status(404).json({ mensaje: `Producto no encontrado: ${p.codigo_producto}` });
      }

      const precio = parseFloat(producto[0].precio);
      subtotal += precio * p.cantidad;
    }

    const transporte = parseFloat(transporte_precio) || 0;
    const subtotalConTransporte = subtotal + transporte;
    const iva = subtotalConTransporte * 0.15;
    const monto_total = subtotalConTransporte + iva;

   await db.execute(`
     INSERT INTO factura (id_pedido, fecha_emision, total, transporte_precio)
     VALUES (?, CONVERT_TZ(NOW(), '+00:00', '-05:00'), ?, ?)
   `, [id_pedido, monto_total, transporte_precio]);

    console.log("✅ Factura generada correctamente");
    res.json({
      mensaje: "Factura generada",
      subtotal: subtotalConTransporte,
      iva,
      monto_total
    });

  } catch (err) {
    console.error("❌ Error al generar factura:", err.message);
    res.status(500).json({ mensaje: "Error al generar factura" });
  }
});


// router.post("/facturas", async (req, res) => {
//     console.log("✅ Recibido POST /facturas:", req.body);

//     const { id_pedido, transporte_precio } = req.body;
//     if (!id_pedido) return res.status(400).json({ mensaje: "Falta id_pedido" });

//     try {
//         // Obtener detalles del pedido desde Laravel
//         const pedidoRes = await axios.get(`https://pedidos-vi0u.onrender.com/api/pedidos/${id_pedido}`);
//         const pedido = pedidoRes.data;

//         if (!pedido || !pedido.producto) {
//             return res.status(400).json({ mensaje: "El pedido no tiene producto" });
//         }

//         // Obtener precio del producto desde la base de datos producto
//         const [productoRows] = await db.execute(
//             `SELECT precio FROM producto WHERE codigo_producto = ?`,
//             [pedido.producto]
//         );

//         if (productoRows.length === 0) {
//             return res.status(400).json({ mensaje: "Producto no encontrado" });
//         }

//         const precioProducto = parseFloat(productoRows[0].precio);
//         const subtotalProductos = precioProducto * pedido.cantidad;

//         const subtotalConTransporte = subtotalProductos + (parseFloat(transporte_precio) || 0);
//         const iva = subtotalConTransporte * 0.15;
//         const monto_total = subtotalConTransporte + iva;

//         console.log("🧾 Insertando factura con:", {
//             id_pedido,
//             subtotal: subtotalConTransporte,
//             iva,
//             monto_total
//         });

//         // Insertar en la tabla de factura
//         await db.execute(
//             `INSERT INTO factura (id_pedido, fecha_emision, total, transporte_precio)
//              VALUES (?, CONVERT_TZ(NOW(), '+00:00', '-05:00'), ?, ?)`,
//             [id_pedido, monto_total, transporte_precio]
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
