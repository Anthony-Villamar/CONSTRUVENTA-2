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
        t.precio AS transporte_precio,
        u.nombre AS cliente_nombre,      -- Aquí corregí el nombre del cliente
        u.apellido AS cliente_apellido,  -- Aquí agregué el apellido
        u.direccion AS cliente_direccion, -- Dirección del cliente
        u.zona AS cliente_zona           -- Zona del cliente
      FROM envios e
      JOIN pedido p ON e.id_pedido = p.id_pedido_global
      JOIN producto pr ON p.producto = pr.codigo_producto
      JOIN transportes t ON e.transporte_id = t.id
      JOIN usuario u ON p.id_cliente = u.id_cliente   -- Asegúrate de que id_cliente sea correcto
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



// Seguimiento de envios
// router.get("/envios/usuario/:id_cliente", async (req, res) => {
//   const { id_cliente } = req.params;

//   try {
//     const [filas] = await db.execute(`
//       SELECT 
//         e.*, 
//         p.id_pedido_global, 
//         GROUP_CONCAT(CONCAT(pr.nombre, ' x', p.cantidad) SEPARATOR ', ') AS productos,
//         t.nombre AS transporte_nombre, 
//         t.precio AS transporte_precio
//       FROM envios e
//       JOIN pedido p ON e.id_pedido = p.id_pedido_global
//       JOIN producto pr ON p.producto = pr.codigo_producto
//       JOIN transportes t ON e.transporte_id = t.id
//       WHERE p.id_cliente = ?
//       GROUP BY e.id_envio, p.id_pedido_global
//       ORDER BY e.fecha_estimada DESC
//     `, [id_cliente]);

//     res.json(filas);
//   } catch (error) {
//     console.error("❌ Error al obtener envíos:", error.message);
//     res.status(500).json({ mensaje: "Error al obtener envíos", error: error.message });
//   }
// });


router.get("/envios/pendientes", async (req, res) => {
  try {
    const [filas] = await db.execute(`
      SELECT e.*, 
        IFNULL((
          SELECT SUM(pr.peso_kg * p.cantidad)
          FROM pedido p
          JOIN producto pr ON p.producto = pr.codigo_producto
          WHERE p.id_pedido_global = e.id_pedido
        ), 0) AS peso_total_kg
      FROM envios e
      WHERE e.transporte_id IS NULL
    `);
    res.json(filas);
  } catch (error) {
    console.error("❌ Error al obtener envíos pendientes:", error.message);
    res.status(500).json({ mensaje: "Error al obtener envíos pendientes", error: error.message });
  }
});



// // Asignar transporte a un envio
// router.put("/envios/:id", async (req, res) => {
//   const { id } = req.params;
//   const { transporte_id } = req.body;

//   if (!transporte_id) return res.status(400).json({ mensaje: "Falta transporte_id" });

//   try {
//     await db.execute(`UPDATE envios SET transporte_id = ? WHERE id_envio = ?`, [transporte_id, id]);
//     res.json({ mensaje: "Transporte asignado correctamente" });
//   } catch (error) {
//     console.error("❌ Error al asignar transporte:", error.message);
//     res.status(500).json({ mensaje: "Error al asignar transporte", error: error.message });
//   }
// });



// Asignar transporte a un envio
router.put("/envios/:id", async (req, res) => {
  const { id } = req.params;
  const { transporte_id } = req.body;

  if (!transporte_id) return res.status(400).json({ mensaje: "Falta transporte_id" });

  try {
    // Primero actualizamos el transporte del envío
    await db.execute(`UPDATE envios SET transporte_id = ? WHERE id_envio = ?`, [transporte_id, id]);

    // Ahora obtenemos el precio del transporte asignado
    const [envio] = await db.execute(`SELECT * FROM envios WHERE id_envio = ?`, [id]);
    const precio_transporte = envio.transporte_id ? (await db.execute(`SELECT precio FROM transportes WHERE id = ?`, [envio.transporte_id]))[0][0].precio : 0;

    // Actualizamos el precio del transporte en la tabla factura
    await db.execute(`UPDATE factura SET transporte_precio = ? WHERE id_pedido = ?`, [precio_transporte, envio.id_pedido]);

    res.json({ mensaje: "Transporte asignado y precio actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al asignar transporte:", error.message);
    res.status(500).json({ mensaje: "Error al asignar transporte", error: error.message });
  }
});

// Ver envíos de un transportista (por transporte_id)
router.get("/envios/transporte/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [filas] = await db.execute(`
      SELECT e.*, t.nombre AS transporte_nombre
      FROM envios e
      JOIN transportes t ON e.transporte_id = t.id
      WHERE e.transporte_id = ?
      ORDER BY e.fecha_estimada DESC
    `, [id]);

    res.json(filas);
  } catch (error) {
    console.error("❌ Error al obtener envíos del transportista:", error.message);
    res.status(500).json({ mensaje: "Error al obtener envíos", error: error.message });
  }
});


// Cambiar estado del envío (pendiente → en tránsito → entregado)
router.put("/envios/:id/estado", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosValidos = ["pendiente", "en tránsito", "entregado"];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ mensaje: "Estado no válido" });
  }

  try {
    await db.execute(`UPDATE envios SET estado = ? WHERE id_envio = ?`, [estado, id]);
    res.json({ mensaje: "Estado actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar estado:", error.message);
    res.status(500).json({ mensaje: "Error al actualizar estado", error: error.message });
  }
});

// LOGIN de transportistas
router.post("/transportistas/login", async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const [rows] = await db.execute(
      `SELECT * FROM usuarios_transporte WHERE usuario = ?`,
      [usuario]
    );

    if (rows.length === 0) {
      return res.status(401).json({ mensaje: "Usuario no encontrado" });
    }

    const user = rows[0];

    // Comparación directa (si no usas bcrypt aún)
    if (contrasena !== user.contrasena) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    res.json({ transporte_id: user.transporte_id });
  } catch (error) {
    console.error("❌ Error en login de transportista:", error.message);
    res.status(500).json({ mensaje: "Error en login", error: error.message });
  }
});

export default router;
