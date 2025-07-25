const usuario_id = sessionStorage.getItem("cedula");

async function listarCompras() {
  const fecha_inicio = document.getElementById("fecha_inicio").value;
  const fecha_fin = document.getElementById("fecha_fin").value;

  let url = `https://facturacion-cqr4.onrender.com/facturas/usuario/${usuario_id}`;
  if (fecha_inicio && fecha_fin) {
    url += `?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`;
  }

  try {
    const res = await fetch(url);
    const facturas = await res.json();

    const contenedor = document.getElementById("lista-compras");
    contenedor.innerHTML = "";

    if (facturas.length === 0) {
      contenedor.innerHTML = "<p>No se encontraron compras.</p>";
      return;
    }

    facturas.forEach(factura => {
      const subtotal = parseFloat(factura.subtotal || 0);
      const iva = subtotal * 0.15;
      const transporte = parseFloat(factura.transporte_precio || 0);
      const total = subtotal + iva + transporte;

      const div = document.createElement("div");
      div.innerHTML = `
        <p><b>Factura:</b> ${factura.numero_factura}</p>
        <p><b>ID Pedido:</b> ${factura.id_pedido_global}</p>
        <p><b>Fecha:</b> ${factura.fecha_compra}</p>
        <p><b>Total compra productos:</b> $${(subtotal + iva).toFixed(2)}</p>
        <!--<p><b>Total envío:</b> $${transporte.toFixed(2)}</p>-->
        <!--<p><b>Total:</b> $${total.toFixed(2)}</p>-->
        <p><b>Productos:</b></p>
        <ul>
          ${factura.productos.split(', ').map(p => `<li>${p}</li>`).join("")}
        </ul>
        <hr>
      `;
      contenedor.appendChild(div);
    });

  } catch (error) {
    console.error("❌ Error al listar compras:", error.message);
  }
}

document.getElementById("filtro-fechas").addEventListener("submit", function (e) {
  e.preventDefault();
  listarCompras();
});

listarCompras();





