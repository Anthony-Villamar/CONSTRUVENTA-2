

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
        <p><b>Factura:</b> ${pedido.numero_factura ?? 'No disponible'}</p>
        <p><b>ID Pedido:</b> ${pedido.id_pedido_global}</p>
        <p><b>Fecha:</b> ${pedido.fecha_compra}</p>
        <p><b>Total compra:</b> $${pedido.total_compra ?? 'No disponible'}</p>
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

