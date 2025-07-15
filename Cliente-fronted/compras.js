const usuario_id = sessionStorage.getItem("cedula");

async function listarCompras() {
  const fecha_inicio = document.getElementById("fecha_inicio").value;
  const fecha_fin = document.getElementById("fecha_fin").value;

  let url = `https://pedidos-vi0u.onrender.com/api/pedidos/usuario/${usuario_id}/por-global`;
  if (fecha_inicio && fecha_fin) {
    url += `?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`;
  }

  try {
    const res = await fetch(url);
    const pedidos = await res.json();

    const contenedor = document.getElementById("lista-compras");
    contenedor.innerHTML = "";

    if (pedidos.length === 0) {
      contenedor.innerHTML = "<p>No se encontraron compras en el rango seleccionado.</p>";
      return;
    }

    pedidos.forEach(pedido => {
      const subtotal = parseFloat(pedido.subtotal || 0).toFixed(2);
      const transporte = parseFloat(pedido.transporte_precio || 0).toFixed(2);
      const iva = (subtotal * 0.15).toFixed(2);
      const total = (parseFloat(subtotal) + parseFloat(iva) + parseFloat(transporte)).toFixed(2);

      const div = document.createElement("div");
      div.innerHTML = `
        <p><b>Factura:</b> ${pedido.numero_factura ?? 'No disponible'}</p>
        <p><b>ID Pedido:</b> ${pedido.id_pedido_global}</p>
        <p><b>Fecha:</b> ${pedido.fecha_compra}</p>
        <p><b>Total compra productos (ya con IVA 15%):</b> $${(parseFloat(subtotal) + parseFloat(iva)).toFixed(2)}</p>
        <p><b>Total envío:</b> $${transporte}</p>
        <p><b>Total:</b> $${total}</p>
        <p><b>Productos:</b></p>
        <ul>
          ${pedido.productos.split(', ').map(p => `<li>${p}</li>`).join("")}
        </ul>
        <hr>
      `;
      contenedor.appendChild(div);
    });

  } catch (error) {
    console.error("❌ Error al listar compras:", error);
  }
}

document.getElementById("filtro-fechas").addEventListener("submit", function (e) {
  e.preventDefault();
  listarCompras();
});

listarCompras();






// const usuario_id = sessionStorage.getItem("cedula");

// async function listarCompras() {
//   const fecha_inicio = document.getElementById("fecha_inicio").value;
//   const fecha_fin = document.getElementById("fecha_fin").value;

//   // ➡️ Nuevo endpoint que debe devolver agrupados por id_pedido_global
//   let url = `https://pedidos-vi0u.onrender.com/api/pedidos/usuario/${usuario_id}/por-global`;

//   if (fecha_inicio && fecha_fin) {
//     url += `?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`;
//   }

//   try {
//     const res = await fetch(url);
//     const pedidos = await res.json();

//     const contenedor = document.getElementById("lista-compras");
//     contenedor.innerHTML = "";

//     if (pedidos.length === 0) {
//       contenedor.innerHTML = "<p>No se encontraron compras en el rango seleccionado.</p>";
//       return;
//     }

//     pedidos.forEach(pedido => {
//       const div = document.createElement("div");
//       div.innerHTML = `
//         <p><b>Factura:</b> ${pedido.numero_factura ?? 'No disponible'}</p>
//         <p><b>ID Pedido:</b> ${pedido.id_pedido_global}</p>
//         <p><b>Fecha:</b> ${pedido.fecha_compra}</p>
//         <p><b>Total compra:</b> $${pedido.total_compra ?? 'No disponible'}</p>
//         <p><b>Productos:</b></p>
//         <ul>
//           ${pedido.productos.split(', ').map(p => `<li>${p}</li>`).join('')}
//         </ul>
//         <hr>
//       `;
//       contenedor.appendChild(div);
//     });

//   } catch (error) {
//     console.error("❌ Error al listar compras:", error);
//   }
// }

// document.getElementById("filtro-fechas").addEventListener("submit", function(e){
//   e.preventDefault();
//   listarCompras();
// });

// listarCompras();

