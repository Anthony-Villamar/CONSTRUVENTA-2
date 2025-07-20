let carrito = [];
let transporteSeleccionado = null;
let totalTransporte = 0;
const usuario_id = sessionStorage.getItem("cedula");

// Cargar productos
async function cargarProductos() {
  const res = await fetch("https://inventario-u6ci.onrender.com/api/productos");
  const productos = await res.json();
  console.log('Productos recibidos:', productos);
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";
  productos.forEach(p => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <!--<img src="${p.imagen_url}" alt="Imagen de ${p.nombre}" class="img-fluid" style="max-height:150px; object-fit:contain;">-->
      <img src="${p.imagen}" alt="Imagen de ${p.nombre}" class="img-fluid" style="max-height:150px; object-fit:contain;">
      <h4>${p.nombre}</h4>
      <div class="descripcion">
        <p>${p.descripcion}</p>
        <p><b>Precio:</b> $${p.precio}</p>
        <p><b>Stock:</b> ${p.stock}</p>
      </div>
      <input type="number" id="cantidad_${p.codigo_producto}" value="1" min="1" max="${p.stock}">
      <button onclick="agregarProducto('${p.codigo_producto}', '${p.nombre}', ${p.precio}, ${p.peso_kg}, ${p.stock})">Agregar</button>
    `;
    contenedor.appendChild(div);
  });
  toggleTransporte();
}

function agregarProducto(codigo, nombre, precio, peso) {
  const cantidadInput = document.getElementById("cantidad_" + codigo);
  const cantidad = parseInt(cantidadInput.value);

  // 🔥 Obtiene el stock actual mostrado en pantalla
  const stockElemento = cantidadInput.parentElement.querySelector(".descripcion p:nth-child(3)");
  const stockActualTexto = stockElemento.innerText; // "<b>Stock:</b> 79"
  const stockActual = parseInt(stockActualTexto.split(":")[1].trim());

  // ✅ Validación de stock antes de agregar
  if (cantidad > stockActual) {
    alert(`No puedes agregar más de ${stockActual} unidades en stock.`);
    return;
  }

  // 🔥 Descontar visualmente el stock
  const nuevoStock = stockActual - cantidad;

  // Actualiza el max del input y el stock mostrado en la tarjeta
  cantidadInput.max = nuevoStock;
  stockElemento.innerHTML = `<b>Stock:</b> ${nuevoStock}`;

  // ✅ Agrega al carrito
  const item = carrito.find(p => p.codigo === codigo);
  if (item) {
    item.cantidad += cantidad;
  } else {
    carrito.push({ codigo, nombre, precio, peso, cantidad });
  }

  actualizarCarrito();
}


function calcularPesoTotal() {
  return carrito.reduce((total, item) => total + (item.peso * item.cantidad), 0);
}

async function asignarTransportePorPeso() {
  const pesoTotal = calcularPesoTotal();
  const res = await fetch("https://envios-cff4.onrender.com/transportes");
  const transportes = await res.json();
  const adecuado = transportes.find(t => pesoTotal <= t.capacidad_max_kg);
    const precioTransporte = document.getElementById("precioTransporte");

  if (adecuado) {
    transporteSeleccionado = adecuado;
    totalTransporte = parseFloat(adecuado.precio);
    if (precioTransporte) {
          precioTransporte.innerText = `Precio Transporte: $${totalTransporte.toFixed(2)} (Auto: ${adecuado.nombre})`;
        }  
  } else {
    transporteSeleccionado = null;
    totalTransporte = 0;
    if (precioTransporte) {
      precioTransporte.innerText = "Sin transporte disponible para este peso.";
    }
  }
  actualizarResumen();
}

function limpiarCarrito() {
  carrito = [];
  actualizarCarrito();
  document.getElementById("lista-productos").innerHTML = "";
  document.getElementById("total-articulos").innerText = "$0.00";
  document.getElementById("subtotal").innerText = "$0.00";
  document.getElementById("envio").innerText = "$0.00";
  document.getElementById("iva").innerText = "$0.00";
  document.getElementById("estimacion-total").innerText = "$0.00";
}


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
  const usar = document.getElementById("usarTransporte").checked;
  if (usar) {
    // asignarTransportePorPeso();
        document.getElementById("precioTransporte").innerText = "Transporte será asignado por el administrador.";

  } else {
    totalTransporte = 0;
    transporteSeleccionado = null;
    document.getElementById("precioTransporte").innerText = "Transporte desactivado";
    actualizarResumen();
  }
}

function eliminarProducto(index) {
  const producto = carrito[index];
  const cantidadInput = document.getElementById("cantidad_" + producto.codigo);

  // 🔥 Regresa el stock visual
  const nuevoStock = parseInt(cantidadInput.max) + producto.cantidad;
  cantidadInput.max = nuevoStock;

  const stockElemento = cantidadInput.parentElement.querySelector(".descripcion p:nth-child(3)");
  stockElemento.innerHTML = `<b>Stock:</b> ${nuevoStock}`;

  // ✅ Elimina del carrito
  carrito.splice(index, 1);
  actualizarCarrito();
}

function actualizarResumen() {
  let subtotal = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  // const usarTransporte = document.getElementById("usarTransporte").checked;
  const usarTransporteCheckbox = document.getElementById("usarTransporte");
const usarTransporte = usarTransporteCheckbox ? usarTransporteCheckbox.checked : false;

  // const envio = usarTransporte ? parseFloat(totalTransporte) : 0;
  const envio = 0;
  const iva = (subtotal + envio) * 0.15;
  // const estimacionTotal = subtotal + envio + iva;
  const estimacionTotal = subtotal + iva;

  const lista = document.getElementById("lista-productos");
  lista.innerHTML = "";
  carrito.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `${p.nombre} x ${p.cantidad} - $${(p.precio * p.cantidad).toFixed(2)}`;
    lista.appendChild(div);
  });

  document.getElementById("total-articulos").innerText = `$${subtotal.toFixed(2)}`;
  document.getElementById("subtotal").innerText = `$${subtotal.toFixed(2)}`;
  document.getElementById("iva").innerText = `$${iva.toFixed(2)}`;
  document.getElementById("estimacion-total").innerText = `$${estimacionTotal.toFixed(2)}`;
}

// ✅ Checkbox para usar transporte o no
function toggleTransporte() {
  const usar = document.getElementById("usarTransporte").checked;
  const precioTransporte = document.getElementById("precioTransporte");

  if (!usar) {
    totalTransporte = 0;
    transporteSeleccionado = null;
     if (precioTransporte) {
      precioTransporte.innerText = "Transporte desactivado";
    }
    actualizarResumen();
  } else {
    // asignarTransportePorPeso();
    if (precioTransporte) {
          precioTransporte.innerText = "Transporte será asignado por el administrador.";
          actualizarResumen()
        }    
    actualizarResumen();
  }
  actualizarResumen()
}

paypal.Buttons({
  createOrder: function(data, actions) {
    const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const envio = 0;
const subtotalFinal = subtotal * 0.15;
const totalFinal = subtotal + subtotalFinal;


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
      // ✅ 1. Crear pedido
      const pedidoRes = await fetch("https://pedidos-vi0u.onrender.com/api/pedidos", {
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
       console.log("Respuesta de pedido:", pedidoRes);
      if (!pedidoRes.ok) throw new Error("❌ Error en /api/pedidos");
  
      const pedidoData = await pedidoRes.json();
      const id_pedido = pedidoData.ids_pedidos[0];
      const id_pedido_global = pedidoData.id_pedido_global;
      console.log("📝 id_pedido recibido:", id_pedido);
  
      // ✅ 2. Preparar factura promise
      const facturaPromise = fetch("https://facturacion-cqr4.onrender.com/facturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_pedido_global, transporte_precio: totalTransporte })
        // body: JSON.stringify({ id_pedido_global, transporte_precio: totalTransporte })

      });
  
      // ✅ 3. Preparar envio promise si hay transporte seleccionado
      // En logicaventa.js ➔ dentro de onApprove
let envioPromise = Promise.resolve(); // default si no hay transporte
let envioRealizado = false;

if (document.getElementById("usarTransporte").checked) { // ✅ si pidió transporte
  const usuarioRes = await fetch(`https://construventa-2-36ul.onrender.com/usuarios/${usuario_id}`);
  const usuario = await usuarioRes.json();
  const direccion = usuario.direccion;
  const zona = usuario.zona;

  envioPromise = fetch("https://envios-cff4.onrender.com/envios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_pedido,
      id_cliente: usuario_id,
      direccion_entrega: direccion,
      zona_entrega: zona,
      transporte_id: null // 🔥 SIN transporte asignado
    })
  }).then(res => {
    if (!res.ok) throw new Error("❌ Error en /envios");
    envioRealizado = true;
    return res.json();
  });
}

  
      // ✅ 4. Ejecutar ambas promesas en paralelo
      const [facturaRes, envioRes] = await Promise.all([facturaPromise, envioPromise]);
    console.log("Respuesta de factura:", facturaRes);
      if (!facturaRes.ok) throw new Error("❌ Error en /facturas");
  
      // ✅ 5. Mostrar alerta diferenciada
      if (envioRealizado) {
        console.log("✅ Envío registrado:", envioRes);
        alert("Pedido, factura y envío registrados correctamente.");
      } else {
        console.log("📝 No se registró envío porque no se contrató transporte.");
        alert("Pedido y factura registrados correctamente (sin transporte).");
      }
  
      await cargarProductos();
      limpiarCarrito();
  
    } catch (err) {
      console.error("❌ Error en onApprove:", err.message);
      alert("Error al procesar la compra: " + err.message);
    }
  }

}).render("#paypal-button-container");

(async () => {
  await cargarProductos();
  document.getElementById("usarTransporte").checked = false;
  toggleTransporte()
})();
