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

  // 🔥 Agrupar productos por id_pedido_global
  const agrupados = {};
  envios.forEach(e => {
    if (!agrupados[e.id_pedido_global]) {
      agrupados[e.id_pedido_global] = {
        pedido: e,
        productos: []
      };
    }
    agrupados[e.id_pedido_global].productos.push(`${e.nombre_producto} x${e.cantidad}`);
  });


Object.values(envios).forEach(p => {
  const div = document.createElement("div");
  div.className = "envio";
  div.innerHTML = `
    <h4>Pedido Global: ${p.id_pedido_global}</h4>
    <p>Transporte: ${p.transporte_nombre} ($${p.transporte_precio})</p>
    <p>Dirección: ${p.direccion_entrega}</p>
    <p>Zona: ${p.zona_entrega}</p>
    <p>Estado: <strong>${p.estado}</strong></p>
    <p>Fecha estimada de entrega: ${p.fecha_estimada.slice(0,10)}</p>
    <p><b>Productos:</b></p>
    <ul>
      ${p.productos.split(', ').map(prod => `<li>${prod}</li>`).join('')}
    </ul>
    <hr>
  `;
  lista.appendChild(div);
});

  
}
