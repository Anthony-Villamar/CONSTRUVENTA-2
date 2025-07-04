let carrito = [];
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
      const cantidadInput = document.getElementById("cantidad_" + codigo);
      const cantidad = parseInt(cantidadInput.value);
      const stockMax = parseInt(cantidadInput.max);

      const item = carrito.find(p => p.codigo === codigo);
      const cantidadTotal = item ? item.cantidad + cantidad : cantidad;

      if (cantidadTotal > stockMax) {
        alert(`No puedes agregar ${cantidadTotal} unidades. Stock disponible: ${stockMax}.`);
        return;
      }

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

    function eliminarProducto(index) {
      carrito.splice(index, 1);
      actualizarCarrito();
    }

    function actualizarResumen() {
      let subtotal = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
      const envio = parseFloat(totalTransporte) || 0;
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

    function toggleTransporte() {
      const usar = document.getElementById("usarTransporte").checked;
      if (!usar) {
        totalTransporte = 0;
        transporteSeleccionado = null;
        document.getElementById("precioTransporte").innerText = "Transporte desactivado";
      } else {
        asignarTransportePorPeso();
      }
      actualizarResumen();
    }

    paypal.Buttons({
      createOrder: function(data, actions) {
        const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
        const subtotalFinal = (subtotal + totalTransporte) * 0.15;
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

          const facturaRes = await fetch("https://facturacion-dhh9.onrender.com/facturas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_pedido, transporte_precio: totalTransporte })
          });
          if (!facturaRes.ok) throw new Error("❌ Error en /facturas");

          if (transporteSeleccionado) {
            const usuarioRes = await fetch(`https://usuarios-1yw0.onrender.com/usuarios/${usuario_id}`);
            const usuario = await usuarioRes.json();
            const direccion = usuario.direccion;
            const zona = usuario.zona;

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

    (async () => {
      await cargarProductos();
    })();
