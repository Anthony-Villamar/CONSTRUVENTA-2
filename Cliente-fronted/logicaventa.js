let carrito = [];
let transportesDisponibles = [];
let transporteSeleccionado = null;
let totalTransporte = 0;
const usuario_id = localStorage.getItem("cedula");

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
            <button onclick='agregarProducto("${p.codigo_producto}", "${p.nombre}", ${p.precio}, ${p.peso_kg})'>Agregar</button>
        `;
        contenedor.appendChild(div);
    });
}

function agregarProducto(codigo, nombre, precio, peso) {
    const cantidad = parseInt(document.getElementById("cantidad_" + codigo).value);
    const item = carrito.find(p => p.codigo === codigo);
    if (item) {
        item.cantidad += cantidad;
    } else {
        carrito.push({ codigo, nombre, precio, peso, cantidad });
    }
    actualizarCarrito();
}

function actualizarResumen() {
  let subtotal = 0;
  carrito.forEach(p => {
    subtotal += p.precio * p.cantidad;
  });

  const envio = parseFloat(totalTransporte) || 0;
  const iva = (subtotal + envio) * 0.15;
  const estimacionTotal = subtotal + envio + iva;

  // Lista de productos con mini resumen
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

function actualizarCarrito() {
    const lista = document.getElementById("carrito");
  lista.innerHTML = "";
  let total = 0;
  carrito.forEach((p, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${p.nombre} x ${p.cantidad}
      <button onclick="eliminarProducto(${index})">Eliminar</button>
    `;
    lista.appendChild(li);
    total += p.precio * p.cantidad;
  });
  // 🟢 Actualizar resumen también
  actualizarResumen();
}
function eliminarProducto(index) {
  carrito.splice(index, 1); // Elimina el producto en esa posición
  actualizarCarrito();      // Actualiza la vista del carrito y el resumen
}



let direccion = "";
let zona = "";

async function cargarTransportes() {
    const clienteRes = await fetch(`https://usuarios-1yw0.onrender.com/usuarios/${usuario_id}`);
    const cliente = await clienteRes.json();
    direccion = cliente.direccion;
    zona = cliente.zona;

    const res = await fetch(`https://construventa-2-1.onrender.com/transportes/${zona}`);
    transportesDisponibles = await res.json();

    const selector = document.getElementById("selectorTransporte");
    selector.innerHTML = '<option value="">-- Selecciona un transporte --</option>';
    transportesDisponibles.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = `${t.nombre} - $${t.precio}`;
        selector.appendChild(opt);
    });
}

function actualizarPrecioTransporte() {
    const id = document.getElementById("selectorTransporte").value;
    const transporte = transportesDisponibles.find(t => t.id == id);
    if (transporte) {
        transporteSeleccionado = transporte;
        totalTransporte = parseFloat(transporte.precio);
        document.getElementById("precioTransporte").innerText = `Precio Transporte: $${totalTransporte.toFixed(2)}`;
        actualizarCarrito();
    } else {
        totalTransporte = 0;
        transporteSeleccionado = null;
    }
}

paypal.Buttons({
    createOrder: function(data, actions) {
        const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
        const subtotalFinal = (subtotal + totalTransporte)* 0.15;
        const totalFinal = subtotal + totalTransporte + subtotalFinal;

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
            // 1. Crear pedido
            const pedidoRes = await fetch("http://127.0.0.1:8000/api/pedidos", {
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

            // 2. Generar factura
            const facturaRes = await fetch("https://facturacion-dhh9.onrender.com/facturas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_pedido, transporte_precio: totalTransporte })
            });
            if (!facturaRes.ok) throw new Error("❌ Error en /facturas");

            // 3. Registrar envío
            const envioRes = await fetch("https://construventa-2-1.onrender.com/envios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_pedido,
                    direccion_entrega: direccion,
                    zona_entrega: zona,
                    transporte_id: transporteSeleccionado.id
                })
            });
            if (!envioRes.ok) throw new Error("❌ Error en /envios");

            const envioData = await envioRes.json();
            console.log("✅ Envío registrado:", envioData);

            alert("Pedido, factura y envío registrados correctamente.");
        } catch (err) {
            console.error("❌ Error en onApprove:", err.message);
            alert("Error al procesar la compra: " + err.message);
        }
    }
}).render("#paypal-button-container");

(async () => {
    await cargarProductos();
    await cargarTransportes();
})();
