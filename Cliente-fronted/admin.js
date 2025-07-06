// ✅ Listar pedidos pendientes
// async function cargarPedidos() {
//   const res = await fetch("https://construventa-3.onrender.com/api/pedidos/pendientes");
//   const pedidos = await res.json();
//   const cont = document.getElementById("lista-pedidos");
//   cont.innerHTML = "";

//   pedidos.forEach(p => {
//     const div = document.createElement("div");
//     div.innerHTML = `
//       <p><b>ID Pedido:</b> ${p.id_pedido}</p>
//       <p><b>Producto:</b> ${p.producto}</p>
//       <p><b>Cantidad:</b> ${p.cantidad}</p>
//       <p><b>Dirección:</b> ${p.direccion_entrega}</p>
//       <p><b>Zona:</b> ${p.zona_entrega}</p>
//       <button onclick="asignarTransporte('${p.id_pedido}', '${p.direccion_entrega}', '${p.zona_entrega}')">Asignar Transporte</button>
//       <hr>
//     `;
//     cont.appendChild(div);
//   });
// }

const admin_id = localStorage.getItem("cedula");
if (!admin_id) {
  window.location.href = "login.html";
}


// ✅ Registrar nuevo producto
async function registrarProducto(event) {
  event.preventDefault();

  const precioInput = document.getElementById("precio").value.replace(",", ".");
  const pesoInput = document.getElementById("peso").value.replace(",", ".");

  const precio = parseFloat(parseFloat(precioInput).toFixed(2));
  const peso_kg = parseFloat(parseFloat(pesoInput).toFixed(2));

  // Validaciones previas
  if (isNaN(precio) || isNaN(peso_kg)) {
    alert("❌ Precio o peso inválido.");
    return;
  }

  const data = {
    codigo_producto: document.getElementById("codigo").value,
    nombre: document.getElementById("nombre").value,
    descripcion: document.getElementById("descripcion").value,
    categoria: document.getElementById("categoria").value,
    precio: precio,
    stock: parseInt(document.getElementById("stock").value),
    peso_kg: peso_kg,
  };

  console.log("🔎 Registrando producto:", data);

  const res = await fetch("https://inventario-d5am.onrender.com/api/productos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    alert("✅ Producto registrado.");
    document.getElementById("form-producto").reset();
    cargarAlertasStock();
  } else {
    const err = await res.text();
    console.error("❌ Error al registrar producto:", err);
    alert("❌ Error al registrar producto.");
  }
}


// ✅ Listar productos con bajo stock y crear reabastecimiento
async function cargarAlertasStock() {
  const res = await fetch("https://inventario-d5am.onrender.com/api/alerta-stock");
  const data = await res.json();
  const productos = data.productos;
  const cont = document.getElementById("alertas-stock");
  cont.innerHTML = "";

  productos.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p>⚠️ <b>${p.nombre}</b> stock bajo: ${p.stock}</p>
      <button onclick="reabastecerProducto('${p.codigo_producto}')">Reabastecer</button>
    `;
    cont.appendChild(div);
  });
}

// ✅ Reabastecer producto
async function reabastecerProducto(codigo) {
  const cantidad = prompt("Ingrese cantidad para reabastecer:", "20");
  if (!cantidad) return;

  const res = await fetch(`https://inventario-d5am.onrender.com/api/productos/${codigo}/reabastecer`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cantidad: parseInt(cantidad) })
  });

  if (res.ok) {
    alert("✅ Producto reabastecido correctamente.");
    cargarAlertasStock();
  } else {
    alert("❌ Error al reabastecer producto.");
  }
}

// ✅ Inicializar
(async () => {
  await cargarAlertasStock();
  // await cargarPedidos();
})();
