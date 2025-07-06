const usuario_id = localStorage.getItem("cedula");

async function listarCompras() {
  const fecha_inicio = document.getElementById("fecha_inicio").value;
  const fecha_fin = document.getElementById("fecha_fin").value;

  let url = `https://construventa-3.onrender.com/api/pedidos/usuario/${usuario_id}`;

  // Agrega parámetros de fecha si están definidos
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
        <p><b>ID Pedido:</b> ${pedido.id_pedido}</p>
        <p><b>Producto:</b> ${pedido.producto}</p>
        <p><b>Cantidad:</b> ${pedido.cantidad}</p>
        <p><b>Fecha:</b> ${pedido.fecha_pedido}</p>
        <hr>
      `;
      contenedor.appendChild(div);
    });

  } catch (error) {
    console.error("❌ Error al listar compras:", error);
  }
}

// ✅ Evento para el formulario de filtrado
document.getElementById("filtro-fechas").addEventListener("submit", function(e){
  e.preventDefault(); // Previene el envío tradicional
  listarCompras();
});

// ✅ Llama a listarCompras al cargar la página para mostrar todas las compras inicialmente
listarCompras();
