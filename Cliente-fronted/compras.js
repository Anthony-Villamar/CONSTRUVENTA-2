const usuario_id = localStorage.getItem("cedula");

// Cuando se carga la página
window.onload = () => {
  listarCompras();
};

// Función para listar compras
async function listarCompras() {
  let url = `https://construventa-3.onrender.com/api/pedidos/usuario/${usuario_id}`;

  const fecha_inicio = document.getElementById("fecha_inicio").value;
  const fecha_fin = document.getElementById("fecha_fin").value;

  if (fecha_inicio && fecha_fin) {
    url += `?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`;
  }

  const res = await fetch(url);
  const pedidos = await res.json();

  const contenedor = document.getElementById("lista-compras");
  contenedor.innerHTML = "";

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
}

// Evento para botón filtrar
document.getElementById("filtrar").addEventListener("click", listarCompras);
