// const usuario_id = localStorage.getItem("cedula");

// window.onload = () => {
//   cargarEnvios();
//   setInterval(cargarEnvios, 10000); // 🔄 refresca cada 10s
// };

// async function cargarEnvios() {
//   const res = await fetch(`https://construventa-2-1.onrender.com/envios/usuario/${usuario_id}`);
//   const lista = document.getElementById("lista-envios");

//   if (!res.ok) {
//     lista.innerHTML = "<p>No se pudieron obtener los envíos.</p>";
//     return;
//   }

//   const envios = await res.json();

//   if (envios.length === 0) {
//     lista.innerHTML = "<p>No tienes envíos registrados.</p>";
//     return;
//   }

//   lista.innerHTML = "";
//   envios.forEach(e => {
//     const div = document.createElement("div");
//     div.className = "envio";
//     div.innerHTML = `
//       <h4>Pedido: ${e.id_pedido}</h4>
//       <p>Transporte: ${e.transporte_nombre} ($${e.transporte_precio})</p>
//       <p>Dirección: ${e.direccion_entrega}</p>
//       <p>Zona: ${e.zona_entrega}</p>
//       <p>Estado: <strong>${e.estado}</strong></p>
//       <p>Fecha estimada de entrega: ${e.fecha_estimada}</p>
//       <hr>
//     `;
//     lista.appendChild(div);
//   });
// }


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

  // 🔥 Agrupar productos por pedido
  const agrupados = {};
  envios.forEach(e => {
    if (!agrupados[e.id_pedido]) {
      agrupados[e.id_pedido] = {
        pedido: e,
        productos: []
      };
    }
    agrupados[e.id_pedido].productos.push({
      nombre: e.nombre_producto,
      cantidad: e.cantidad
    });
  });

  // 🔥 Mostrar pedidos
  Object.values(agrupados).forEach(grupo => {
  const p = grupo.pedido;

  // Aquí usamos grupo.productos correctamente
  const productosHTML = grupo.productos.length > 0
    ? grupo.productos.map(pr => `<li>${pr.nombre} x ${pr.cantidad}</li>`).join('')
    : '<li>No hay productos</li>';

  const div = document.createElement("div");
  div.className = "envio";
  div.innerHTML = `
    <h4>Pedido: ${p.id_pedido}</h4>
    <p>Transporte: ${p.transporte_nombre} ($${p.transporte_precio})</p>
    <p>Dirección: ${p.direccion_entrega}</p>
    <p>Zona: ${p.zona_entrega}</p>
    <p>Estado: <strong>${p.estado}</strong></p>
    <p>Fecha estimada de entrega: ${p.fecha_estimada}</p>
    <p><b>Productos:</b></p>
    <ul>
      ${productosHTML}
    </ul>
    <hr>
  `;
  lista.appendChild(div);
});

}
