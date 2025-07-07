// const usuario_id = localStorage.getItem("cedula");

// async function listarCompras() {
//   const fecha_inicio = document.getElementById("fecha_inicio").value;
//   const fecha_fin = document.getElementById("fecha_fin").value;

//   let url = `https://construventa-3.onrender.com/api/pedidos/usuario/${usuario_id}`;

//   // Agrega parámetros de fecha si están definidos
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
//         <p><b>ID Pedido:</b> ${pedido.id_pedido}</p>
//         <p><b>Producto:</b> ${pedido.producto}</p>
//         <p><b>Cantidad:</b> ${pedido.cantidad}</p>
//         <p><b>Fecha:</b> ${pedido.fecha_pedido}</p>
//         <hr>
//       `;
//       contenedor.appendChild(div);
//     });

//   } catch (error) {
//     console.error("❌ Error al listar compras:", error);
//   }
// }

// // ✅ Evento para el formulario de filtrado
// document.getElementById("filtro-fechas").addEventListener("submit", function(e){
//   e.preventDefault(); // Previene el envío tradicional
//   listarCompras();
// });

// // ✅ Llama a listarCompras al cargar la página para mostrar todas las compras inicialmente
// listarCompras();

const usuario_id = localStorage.getItem("cedula");

async function listarCompras() {
  const fecha_inicio = document.getElementById("fecha_inicio").value;
  const fecha_fin = document.getElementById("fecha_fin").value;

  let url = `https://construventa-3.onrender.com/api/pedidos/usuario/${usuario_id}`;

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

    // ✅ Agrupar productos por id_pedido
    const pedidosAgrupados = {};
    pedidos.forEach(pedido => {
      if (!pedidosAgrupados[pedido.id_pedido]) {
        pedidosAgrupados[pedido.id_pedido] = {
          fecha: pedido.fecha_pedido,
          productos: []
        };
      }
      pedidosAgrupados[pedido.id_pedido].productos.push({
        codigo: pedido.producto,
        cantidad: pedido.cantidad
      });
    });

    // ✅ Mostrar pedidos agrupados
    for (const id_pedido in pedidosAgrupados) {
      const data = pedidosAgrupados[id_pedido];

      const div = document.createElement("div");
      div.innerHTML = `
        <p><b>ID Pedido:</b> ${id_pedido}</p>
        <p><b>Fecha:</b> ${data.fecha}</p>
        <p><b>Productos:</b></p>
        <ul>
          ${data.productos.map(p => `<li>${p.codigo} x ${p.cantidad}</li>`).join("")}
        </ul>
        <hr>
      `;
      contenedor.appendChild(div);
    }

  } catch (error) {
    console.error("❌ Error al listar compras:", error);
  }
}

document.getElementById("filtro-fechas").addEventListener("submit", function(e){
  e.preventDefault();
  listarCompras();
});

listarCompras();
