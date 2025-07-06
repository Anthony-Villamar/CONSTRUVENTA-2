// admin.js

async function cargarAlertasStock() {
  try {
    const res = await fetch("https://inventario-d5am.onrender.com/api/alerta-stock");
    const data = await res.json();

    const contenedor = document.getElementById("alertas-stock");
    contenedor.innerHTML = "";

    if (data.productos.length === 0) {
      contenedor.innerHTML = "<p>No hay alertas de stock.</p>";
      return;
    }

    data.productos.forEach(p => {
      const div = document.createElement("div");
      div.innerHTML = `
        <p><b>${p.nombre}</b> (${p.codigo_producto}) - Stock: ${p.stock}</p>
      `;
      contenedor.appendChild(div);
    });
  } catch (err) {
    console.error("❌ Error al cargar alertas de stock:", err);
  }
}

async function cargarPedidosTransporte() {
  try {
    const res = await fetch("https://construventa-3.onrender.com/api/pedidos/requieren-transporte");
    const pedidos = await res.json();

    const contenedor = document.getElementById("pedidos-transporte");
    contenedor.innerHTML = "";

    if (pedidos.length === 0) {
      contenedor.innerHTML = "<p>No hay pedidos pendientes de transporte.</p>";
      return;
    }

    pedidos.forEach(pedido => {
      const div = document.createElement("div");
      div.innerHTML = `
        <p><b>ID Pedido:</b> ${pedido.id_pedido}</p>
        <p><b>Cliente:</b> ${pedido.id_cliente}</p>
        <p><b>Dirección:</b> ${pedido.direccion_entrega}</p>
        <p><b>Zona:</b> ${pedido.zona_entrega}</p>
        <button onclick="asignarTransporte('${pedido.id_pedido}')">Asignar Transporte</button>
        <hr>
      `;
      contenedor.appendChild(div);
    });
  } catch (err) {
    console.error("❌ Error al cargar pedidos transporte:", err);
  }
}

async function asignarTransporte(id_pedido) {
  const transporte_id = prompt("Ingrese ID del transporte a asignar:");
  if (!transporte_id) return;

  try {
    const res = await fetch("https://construventa-2-1.onrender.com/envios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_pedido,
        direccion_entrega: "direccion_desde_BD", // Aquí colocarías datos reales si ya los traes
        zona_entrega: "zona_desde_BD",
        transporte_id
      })
    });
    const data = await res.json();
    alert("✅ " + data.mensaje);
    cargarPedidosTransporte();
  } catch (err) {
    console.error("❌ Error al asignar transporte:", err);
    alert("Error al asignar transporte.");
  }
}

(async () => {
  await cargarAlertasStock();
  await cargarPedidosTransporte();
})();
