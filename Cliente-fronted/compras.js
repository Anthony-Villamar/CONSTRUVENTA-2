const usuario_id = localStorage.getItem("cedula");

window.onload = () => {
  cargarCompras(); // Cargar todas al inicio
};

async function cargarCompras(fecha_inicio = "", fecha_fin = "") {
  let url = `http://localhost:8000/api/pedidos/usuario/${usuario_id}`;

  // Si se especifican fechas, agregarlas como parámetros
  const params = new URLSearchParams();
  if (fecha_inicio) params.append("fecha_inicio", fecha_inicio);
  if (fecha_fin) params.append("fecha_fin", fecha_fin);
  if (params.toString() !== "") url += "?" + params.toString();

  const res = await fetch(url);
  const contenedor = document.getElementById("lista-compras");
  contenedor.innerHTML = "";

  if (!res.ok) {
    contenedor.innerHTML = "<p>No se encontraron compras en este rango de fechas.</p>";
    return;
  }

  const pedidos = await res.json();

  pedidos.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h4>Pedido #${p.id_pedido}</h4>
      <p>Fecha: ${p.fecha_pedido}</p>
      <p>Producto: ${p.producto}</p>
      <p>Cantidad: ${p.cantidad}</p>
      <p>Dirección de entrega: ${p.direccion_entrega}</p>
      <p>Zona: ${p.zona_entrega}</p>
      <hr>
    `;
    contenedor.appendChild(div);
  });
}

// 🟢 Evento para filtrar por fechas
document.getElementById("filtro-fechas").addEventListener("submit", (e) => {
  e.preventDefault();
  const fecha_inicio = document.getElementById("fecha_inicio").value;
  const fecha_fin = document.getElementById("fecha_fin").value;
  cargarCompras(fecha_inicio, fecha_fin);
});
