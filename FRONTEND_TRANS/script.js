// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const contrasena = document.getElementById("contrasena").value;

    const res = await fetch("https://envios-cff4.onrender.com/transportistas/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, contrasena })
    });

    const data = await res.json();
    if (res.ok) {
      sessionStorage.setItem("transporte_id", data.transporte_id);
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("error").innerText = data.mensaje;
    }
  });
}

// DASHBOARD
const listaEnvios = document.getElementById("listaEnvios");
if (listaEnvios) {
  const transporteId = sessionStorage.getItem("transporte_id");
  if (!transporteId) window.location.href = "index.html";
fetch(`https://envios-cff4.onrender.com/envios/usuario/${transporteId}`)
  .then(res => res.json())
  .then(envios => {
    envios.forEach(envio => {
      const div = document.createElement("div");
      div.className = "envio";
      div.innerHTML = `
        <p><strong>ID:</strong> ${envio.id_envio} | <strong>Pedido:</strong> ${envio.id_pedido}</p>
        <p><strong>Estado:</strong> ${envio.estado}</p>
        <p><strong>Cliente:</strong> ${envio.cliente_nombre} ${envio.cliente_apellido} (${envio.cliente_cedula})</p>
        <p><strong>Dirección:</strong> ${envio.cliente_direccion}</p>
        <p><strong>Zona:</strong> ${envio.cliente_zona}</p>
        <select onchange="actualizarEstado(${envio.id_envio}, this.value)">
          <option disabled selected>Cambiar estado</option>
          <option value="pendiente">Pendiente</option>            
          <option value="en tránsito">En tránsito</option>
          <option value="entregado">Entregado</option>
        </select>
      `;
      listaEnvios.appendChild(div);
    });
  })
  .catch(error => {
    console.error("Error al obtener los envíos:", error);
  });


  
  // fetch(`https://envios-cff4.onrender.com/envios/transporte/${transporteId}`)
  //   .then(res => res.json())
  //   .then(envios => {
  //     envios.forEach(envio => {
  //       const div = document.createElement("div");
  //       div.className = "envio";
  //       div.innerHTML = `
  //         <p><strong>ID:</strong> ${envio.id_envio} | <strong>Pedido:</strong> ${envio.id_pedido}</p>
  //         <p><strong>Estado:</strong> ${envio.estado}</p>
  //         <p><strong>Cliente:</strong> ${envio.cliente_nombre} ${envio.cliente_apellido} (${envio.cliente_cedula})</p>
  //         <p><strong>Dirección:</strong> ${envio.cliente_direccion}</p>
  //         <p><strong>Zona:</strong> ${envio.cliente_zona}</p>
  //         <select onchange="actualizarEstado(${envio.id_envio}, this.value)">
  //           <option disabled selected>Cambiar estado</option>
  //           <option value="pendiente">Pendiente</option>            
  //           <option value="en tránsito">En tránsito</option>
  //           <option value="entregado">Entregado</option>
  //         </select>
  //       `;

  //       // div.innerHTML = `
  //       //   <p><strong>ID:</strong> ${envio.id_envio} | <strong>Pedido:</strong> ${envio.id_pedido}</p>
  //       //   <p><strong>Estado:</strong> ${envio.estado}</p>
  //       //   <select onchange="actualizarEstado(${envio.id_envio}, this.value)">
  //       //     <option disabled selected>Cambiar estado</option>
  //       //     <option value="pendiente">Pendiente</option>            
  //       //     <option value="en tránsito">En tránsito</option>
  //       //     <option value="entregado">Entregado</option>
  //       //   </select>
  //       // `;

        
    //     listaEnvios.appendChild(div);
    //   });
    // });
}

function actualizarEstado(idEnvio, nuevoEstado) {
  fetch(`https://envios-cff4.onrender.com/envios/${idEnvio}/estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: nuevoEstado })
  }).then(() => window.location.reload());
}
