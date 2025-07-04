let carrito = [];
let transporteSeleccionado = null;
let totalTransporte = 0;
let transporteActivo = false; // ✅ Variable global para saber si el transporte está activo
const usuario_id = localStorage.getItem("cedula");

// 🔄 Cargar productos
async function cargarProductos() {
  const res = await fetch("https://inventario-d5am.onrender.com/api/productos");
  const productos = await res.json();
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";
  productos.forEach(p => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <h4>${p.nombre}</h4>
      <p>${p.descripcion}</p>
      <p><b>Precio:</b> $${p.precio}</p>
      <p><b>Stock:</b> ${p.stock}</p>
      <input type="number" id="cantidad_${p.codigo_producto}" value="1" min="1" max="${p.stock}" style="width:60px;">
      <button onclick='agregarProducto("${p.codigo_producto}", "${p.nombre}", ${p.precio}, ${p.peso_kg}, ${p.stock})'>Agregar</button>
    `;
    contenedor.appendChild(div);
  });
}

// ✅ Agregar producto con control de stock
function agregarProducto(codigo, nombre, precio, peso, stock) {
  const cantidad = parseInt(document.getElementById("cantidad_" + codigo).value);

  if (cantidad > stock) {
    alert(`No puedes agregar más de ${stock} unidades de este producto.`);
    return;
  }

  const item = carrito.find(p => p.codigo === codigo);
  if (item) {
    if (item.cantidad + cantidad > stock) {
      alert(`No puedes agregar más de ${stock} unidades en total de este producto.`);
      return;
    }
    item.cantidad += cantidad;
  } else {
    carrito.push({ codigo, nombre, precio, peso, cantidad });
  }

  actualizarCarrito();
}

// 🧮 Calcular peso total
function calcularPesoTotal() {
  return carrito.reduce((total, item) => total + (item.peso * item.cantidad), 0);
}

// 🚚 Asignar transporte solo si transporteActivo es true
async function asignarTransportePorPeso() {
  if (!transporteActivo) {
    transporteSeleccionado = null;
    totalTransporte = 0;
    document.getElementById("precioTransporte").innerText = "Transporte desactivado";
    return;
  }

  const pesoTotal = calcularPesoTotal();
  const res = await fetch("https://construventa-2-1.onrender.com/transportes");
  const transportes = await res.json();

  const adecuado = transportes.find(t => pesoTotal <= t.capacidad_max_kg);
  if (adecuado) {
    transporteSeleccionado = adecuado;
    totalTransporte = parseFloat(adecuado.precio);
    document.getElementById("precioTransporte").innerText = `Precio Transporte: $${totalTransporte.toFixed(2)} (Auto: ${adecuado.nombre})`;
  } else {
    transporteSeleccionado = null;
    totalTransporte = 0;
    document.getElementById("precioTransporte").innerText = "Sin transporte disponible para este peso.";
  }
  actualizarResumen();
}

// 🛒 Actualizar carrito
function actualizarCarrito() {
  const lista = document.getElementById("carrito");
  lista.innerHTML = "";
  carrito.forEach((p, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${p.nombre} x ${p.cantidad}
      <button onclick="eliminarProducto(${index})">Eliminar</button>
    `;
    lista.appendChild(li);
  });
  asignarTransportePorPeso();
  actualizarResumen();
}

// ❌ Eliminar producto del carrito
function eliminarProducto(index) {
  carrito.splice(index, 1);
  actualizarCarrito();
}

// 💲 Actualizar resumen de compra
function actualizarResumen() {
  let subtotal = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const envio = transporteActivo ? parseFloat(totalTransporte) : 0;
  const iva = (subtotal + envio) * 0.15;
  const estimacionTotal = subtotal + envio + iva;

  const lista = document.getElementById("lista-productos");
  lista.innerHTML = "";
  carrito.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `${p.nombre} x ${p.cantidad} - $${(p.precio * p.cantidad).toFixed(2)}`;
    lista.appendChild(div);
  });

  document.getElementById("total-articulos").innerText = `$${subtotal.toFixed(2)}`;
  document.getElementById("subtotal").innerText = `$${subtotal.toFixed(2)}`;
  document.getElementById("envio").innerText = `$${envio.toFixed(2)}`;
  document.getElementById("iva").innerText = `$${iva.toFixed(2)}`;
  document.getElementById("estimacion-total").innerText = `$${estimacionTotal.toFixed(2)}`;
}

// ✅ Checkbox transporte
function toggleTransporte() {
  transporteActivo = document.getElementById("usarTransporte").checked;
  asignarTransportePorPeso();
}

// 💳 PayPal Buttons
paypal.Buttons({
  createOrder: function(data, actions) {
    const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const envio = transporteActivo ? totalTransporte : 0;
    const iva = (subtotal + envio) * 0.15;
    const totalFinal = subtotal + envio + iva;

    if (totalFinal <= 0) {
      alert("No puedes pagar un total de $0.00. Agrega productos al carrito.");
      return;
    }
    return actions.order.create({
      purchase_units: [{ amount: { value: totalFinal.toFixed(2) } }]
    });
  },
  onApprove: async function(data, actions) {
    await actions.order.capture();
    alert("¡Pago exitoso!");

    try {
      // 1️⃣ Crear pedido
      const pedidoRes = await fetch("https://construventa-3.onrender.com/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id,
          productos: carrito.map(item => ({
            codigo_producto: item.codigo,
            cantidad: item.cantidad
          }))
        })
      });
      if (!pedidoRes.ok) throw new Error("❌ Error en /api/pedidos");

      const pedidoData = await pedidoRes.json();
      const id_pedido = pedidoData.ids_pedidos[0];
      console.log("📝 id_pedido recibido:", id_pedido);

      // 2️⃣ Generar factura
      const facturaRes = await fetch("https://facturacion-dhh9.onrender.com/facturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_pedido, transporte_precio: totalTransporte })
      });
      if (!facturaRes.ok) throw new Error("❌ Error en /facturas");

      // 3️⃣ Registrar envío si transporte activo
      if (transporteActivo && transporteSeleccionado) {
        const usuarioRes = await fetch(`https://usuarios-1yw0.onrender.com/usuarios/${usuario_id}`);
        const usuario = await usuarioRes.json();

        const envioRes = await fetch("https://construventa-2-1.onrender.com/envios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_pedido,
            direccion_entrega: usuario.direccion,
            zona_entrega: usuario.zona,
            transporte_id: transporteSeleccionado.id
          })
        });
        if (!envioRes.ok) throw new Error("❌ Error en /envios");

        const envioData = await envioRes.json();
        console.log("✅ Envío registrado:", envioData);
        alert("Pedido, factura y envío registrados correctamente.");
      } else {
        console.log("📝 No se registró envío porque no se contrató transporte.");
        alert("Pedido y factura registrados correctamente (sin transporte).");
      }

    } catch (err) {
      console.error("❌ Error en onApprove:", err.message);
      alert("Error al procesar la compra: " + err.message);
    }
  }

}).render("#paypal-button-container");

// 🔃 Inicializar
(async () => {
  await cargarProductos();
})();
