// ✅ Listar pedidos pendientes
async function cargarPedidos() {
  const res = await fetch("https://construventa-3.onrender.com/api/pedidos/pendientes");
  const pedidos = await res.json();
  const cont = document.getElementById("lista-pedidos");
  cont.innerHTML = "";

  pedidos.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><b>ID Pedido:</b> ${p.id_pedido}</p>
      <p><b>Producto:</b> ${p.producto}</p>
      <p><b>Cantidad:</b> ${p.cantidad}</p>
      <p><b>Dirección:</b> ${p.direccion_entrega}</p>
      <p><b>Zona:</b> ${p.zona_entrega}</p>
      <button onclick="asignarTransporte('${p.id_pedido}', '${p.direccion_entrega}', '${p.zona_entrega}')">Asignar Transporte</button>
      <hr>
    `;
    cont.appendChild(div);
  });
}

// ✅ Asignar transporte
async function asignarTransporte(id_pedido, direccion, zona) {
  const resT = await fetch("https://construventa-2-1.onrender.com/transportes");
  const transportes = await resT.json();

  const seleccionado = prompt(
    "Selecciona ID de transporte:\n" + 
    transportes.map(t => `${t.id}: ${t.nombre} (${t.capacidad_max_kg}kg $${t.precio})`).join("\n")
  );

  if (!seleccionado) return;

  const transporte = transportes.find(t => t.id == seleccionado);
  if (!transporte) {
    alert("Transporte inválido.");
    return;
  }

  const envioRes = await fetch("https://construventa-2-1.onrender.com/envios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_pedido,
      direccion_entrega: direccion,
      zona_entrega: zona,
      transporte_id: transporte.id
    })
  });

  if (envioRes.ok) {
    alert("✅ Transporte asignado y envío registrado.");
    cargarPedidos(); // recarga lista
  } else {
    alert("❌ Error al registrar envío.");
  }
}

// ✅ Revisar alertas de stock bajo
async function cargarAlertasStock() {
  try {
    const res = await fetch("https://inventario-d5am.onrender.com/api/alerta-stock");
    const data = await res.json();
    const productos = data.productos; // se ajusta según respuesta PHP

    const cont = document.getElementById("alertas-stock");
    cont.innerHTML = "";

    if (productos.length === 0) {
      cont.innerHTML = "<p>✅ No hay productos con stock bajo.</p>";
      return;
    }

    productos.forEach(p => {
      const div = document.createElement("div");
      div.innerHTML = `<p>⚠️ <b>${p.nombre}</b> stock bajo: ${p.stock}</p>`;
      cont.appendChild(div);
    });

  } catch (error) {
    console.error("❌ Error al cargar alertas de stock:", error);
    const cont = document.getElementById("alertas-stock");
    cont.innerHTML = "<p>❌ Error al cargar alertas de stock.</p>";
  }
}

// ✅ Inicializar solo alertas por ahora
(async () => {
  await cargarAlertasStock();
  await cargarPedidos();
})();
