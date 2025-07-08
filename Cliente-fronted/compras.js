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

//desde aqui 
// const usuario_id = localStorage.getItem("cedula");

// async function listarCompras() {
//   const fecha_inicio = document.getElementById("fecha_inicio").value;
//   const fecha_fin = document.getElementById("fecha_fin").value;

//   // let url = `https://construventa-3.onrender.com/api/pedidos/usuario/${usuario_id}`;
//   let url = `https://construventa-3.onrender.com/api/pedidos/usuario/${usuario_id}/agrupados`;

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

//     // 🔥 Agrupar por fecha_pedido (sin segundos)
//     const agrupados = {};
//     pedidos.forEach(p => {
//       // const fechaHora = p.fecha_pedido.slice(0, 16); // yyyy-mm-dd HH:MM
//       const fechaHora = p.hora_compra.slice(0, 16); // yyyy-mm-dd HH:MM
//       if (!agrupados[fechaHora]) {
//         agrupados[fechaHora] = [];
//       }
//       agrupados[fechaHora].push(p);
//     });

//     // 🔥 Mostrar agrupados
//     // Object.keys(agrupados).forEach(fechaHora => {
//     //   const grupo = agrupados[fechaHora];

//     //   const div = document.createElement("div");
//     //   div.innerHTML = `
//     //     <p><b>ID Pedido:</b> ${grupo[0].id_pedido}</p>
//     //     <p><b>Fecha:</b> ${fechaHora}</p>
//     //     <p><b>Productos:</b></p>
//     //     <ul>
//     //       <!--${grupo.map(p => `<li>${p.producto} x ${p.cantidad}</li>`).join("")}-->
//     //       ${grupo.map(p => `<li>${p.nombre_producto} x ${p.cantidad}</li>`).join("")}
//     //     </ul>
//     //     <hr>
//     //   `;
//     //   contenedor.appendChild(div);
//     // });
// Object.values(pedidos).forEach(pedido => {
//   const div = document.createElement("div");
//   div.innerHTML = `
//     <p><b>ID Pedido:</b> ${pedido.primer_id_pedido}</p>
//     <p><b>Hora:</b> ${pedido.hora_compra}</p>
//     <p><b>Productos:</b></p>
//     <ul>
//         ${pedido.productos.split(', ').map(p => `<li>${p}</li>`).join('')}
//     </ul>
//     <hr>
//   `;
//   contenedor.appendChild(div);
// });

//   } catch (error) {
//     console.error("❌ Error al listar compras:", error);
//   }
// }
// document.getElementById("filtro-fechas").addEventListener("submit", function(e){
//   e.preventDefault();
//   listarCompras();
// });

// listarCompras();



const usuario_id = localStorage.getItem("cedula");

async function listarCompras() {
  const fecha_inicio = document.getElementById("fecha_inicio").value;
  const fecha_fin = document.getElementById("fecha_fin").value;

  // ➡️ Nuevo endpoint que debe devolver agrupados por id_pedido_global
  let url = `https://construventa-3.onrender.com/api/pedidos/usuario/${usuario_id}/por-global`;

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
      const div = document.createElement("div");
      div.innerHTML = `
        <p><b>ID Pedido Global:</b> ${pedido.id_pedido_global}</p>
        <p><b>Fecha:</b> ${pedido.fecha_compra}</p>
        <p><b>Productos:</b></p>
        <ul>
          ${pedido.productos.split(', ').map(p => `<li>${p}</li>`).join('')}
        </ul>
        <hr>
      `;
      contenedor.appendChild(div);
    });

  } catch (error) {
    console.error("❌ Error al listar compras:", error);
  }
}

document.getElementById("filtro-fechas").addEventListener("submit", function(e){
  e.preventDefault();
  listarCompras();
});

listarCompras();

