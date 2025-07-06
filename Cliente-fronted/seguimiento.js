const usuario_id = localStorage.getItem("cedula");

window.onload = () => {
  cargarEnvios();
  setInterval(cargarEnvios, 10000); // 🔄 refresca cada 10s
};

async function cargarEnvios() {
  const res = await fetch(`https://construventa-2-1.onrender.com/envios/usuario/${usuario_id}`);
  const lista = document.getElementById("lista-envios");

  if (!res.ok) {
    lista.innerHTML = "<p>No se pudieron obtener los envíos.</p>";
    return;
  }

  const envios = await res.json();

  if (envios.length === 0) {
    lista.innerHTML = "<p>No tienes envíos registrados.</p>";
    return;
  }

  lista.innerHTML = "";
  envios.forEach(e => {
    const div = document.createElement("div");
    div.className = "envio";
    div.innerHTML = `
      <h4>Pedido: ${e.id_pedido}</h4>
      <p>Transporte: ${e.transporte_nombre} ($${e.transporte_precio})</p>
      <p>Dirección: ${e.direccion_entrega}</p>
      <p>Zona: ${e.zona_entrega}</p>
      <p>Estado: <strong>${e.estado}</strong></p>
      <p>Fecha estimada de entrega: ${e.fecha_estimada}</p>
      <hr>
    `;
    lista.appendChild(div);
  });
}
