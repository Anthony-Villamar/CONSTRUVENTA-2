

const admin_id = sessionStorage.getItem("cedula");
if (!admin_id) {
  window.location.href = "index.html";
}

async function cargarProductos() {
  const res = await fetch("https://inventario-u6ci.onrender.com/api/productos");
  const productos = await res.json();
  const cont = document.getElementById("lista-productos");
  cont.innerHTML = "";

  productos.forEach(p => {
    const div = document.createElement("div");
    div.className = "col-md-4 mb-3";
    div.innerHTML = `
      <div class="card h-100">
        <img src="${p.imagen}" class="card-img-top img-fluid" alt="Imagen de ${p.nombre}" style="max-height:150px; object-fit:contain;">
        <div class="card-body">
          <h5 class="card-title">${p.nombre}</h5>
          <p class="card-text">${p.descripcion}</p>
          <ul class="list-group list-group-flush">
            <li class="list-group-item"><b>Código:</b> ${p.codigo_producto}</li>
            <li class="list-group-item"><b>Categoría:</b> ${p.categoria}</li>
            <li class="list-group-item"><b>Precio:</b> $${p.precio}</li>
            <li class="list-group-item"><b>Stock:</b> ${p.stock}</li>
            <li class="list-group-item"><b>Peso:</b> ${p.peso_kg} kg</li>
          </ul>
          <button class="btn btn-primary mt-2" onclick="actualizarProducto('${p.codigo_producto}')">Editar</button>
        </div>
      </div>
    `;
    cont.appendChild(div);
  });
}


// ✅ Registrar nuevo producto
async function registrarProducto(event) {
  event.preventDefault();

  const formData = new FormData();
  formData.append("codigo_producto", document.getElementById("codigo").value);
  formData.append("nombre", document.getElementById("nombre").value);
  formData.append("descripcion", document.getElementById("descripcion").value);
  formData.append("categoria", document.getElementById("categoria").value);
  formData.append("precio", parseFloat(document.getElementById("precio").value).toFixed(2));
  formData.append("stock", parseInt(document.getElementById("stock").value));
  formData.append("peso_kg", parseFloat(document.getElementById("peso").value).toFixed(2));
  // formData.append("imagen", document.getElementById("imagen").files[0]);
  formData.append("imagen_url", document.getElementById("imagen_url").value);

  const res = await fetch("https://inventario-u6ci.onrender.com/api/productos", {
    method: "POST",
    body: formData
  });

  if (res.ok) {
    alert("✅ Producto registrado con imagen.");
    document.getElementById("form-producto").reset();
    cargarAlertasStock();
    cargarProductos();
  } else {
    const err = await res.text();
    console.error("❌ Error al registrar producto:", err);
    alert("❌ Error al registrar producto.");
  }
}

async function actualizarProducto(codigo) {
  const nuevoPrecio = prompt("Nuevo precio:");
  const nuevaDescripcion = prompt("Nueva descripción:");

  const data = {
    precio: parseFloat(nuevoPrecio),
    descripcion: nuevaDescripcion
  };

  const res = await fetch(`https://inventario-u6ci.onrender.com/api/productos/${codigo}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });

  if (res.ok) {
    alert("✅ Producto actualizado correctamente.");
    cargarProductos(); // recarga lista
  } else {
    alert("❌ Error al actualizar producto.");
  }
}

// ✅ Listar productos con bajo stock y crear reabastecimiento
async function cargarAlertasStock() {
  const res = await fetch("https://inventario-u6ci.onrender.com/api/alerta-stock");
  const data = await res.json();
  const productos = data.productos;
  const cont = document.getElementById("alertas-stock");
  cont.innerHTML = "";

  productos.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p>⚠️ <b>${p.nombre}</b> stock bajo: ${p.stock}</p>
      <button onclick="reabastecerProducto('${p.codigo_producto}')">Reabastecer</button>
    `;
    cont.appendChild(div);
  });
}

// ✅ Reabastecer producto
async function reabastecerProducto(codigo) {
  const cantidad = prompt("Ingrese cantidad para reabastecer:", "20");
  if (!cantidad) return;

  const res = await fetch(`https://inventario-u6ci.onrender.com/api/productos/${codigo}/reabastecer`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cantidad: parseInt(cantidad) })
  });

  if (res.ok) {
    alert("✅ Producto reabastecido correctamente.");
    cargarAlertasStock();
  } else {
    alert("❌ Error al reabastecer producto.");
  }
}

async function cargarEnviosPendientes() {
  const res = await fetch("https://envios-cff4.onrender.com/envios/pendientes");
  const envios = await res.json();
  const cont = document.getElementById("envios-pendientes");
  cont.innerHTML = "";

  if (envios.length === 0) {
    cont.innerHTML = "<p>No hay envíos pendientes sin transporte.</p>";
    return;
  }

  let html = `<table class="table"><tr>
    <th>ID</th><th>Dirección</th><th>Zona</th><th>Peso Total (kg)</th><th>Asignar Transporte</th></tr>`;

  envios.forEach(e => {
    html += `<tr id="envio-${e.id_envio}">
      <td>${e.id_envio}</td>
      <td>${e.direccion_entrega}</td>
      <td>${e.zona_entrega}</td>
      <td>${e.peso_total_kg.toFixed(2)} kg</td>
      <td><button onclick="mostrarTransportesDisponibles(${e.id_envio}, '${e.zona_entrega}')">Asignar</button></td>
    </tr>`;
  });
  html += `</table>`;
  cont.innerHTML = html;
}


async function mostrarTransportesDisponibles(id_envio, zona) {
  const res = await fetch(`https://envios-cff4.onrender.com/transportes/${zona}`);
  const transportes = await res.json();

  let transportesHTML = "<select id='transporte_id'>";
  transportes.forEach(t => {
    transportesHTML += `<option value="${t.id}">${t.nombre} ($${t.precio})</option>`;
  });
  transportesHTML += "</select>";

  // Buscar la fila correspondiente para este id_envio
  const row = document.getElementById(`envio-${id_envio}`);

  // Solo agregar el botón si no existe aún
  if (!row.querySelector(".transporte-select")) {
    row.innerHTML += `
      <td class="transporte-select">${transportesHTML}</td>
      <td><button onclick="asignarTransporte(${id_envio})">Confirmar</button></td>
    `;
  }
}



async function cargarCompras() {
  // Aquí deberías cargar las compras, tal vez obteniendo el precio actualizado desde la base de datos.
  const res = await fetch("https://construventa-1.onrender.com/api/compras");
  const compras = await res.json();

  // Actualizar la UI con la nueva información
  // Mostrar los datos actualizados con el transporte asignado y el precio en la interfaz de usuario
  const contenedor = document.getElementById("lista-compras");
  contenedor.innerHTML = "";
  compras.forEach(compra => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><b>Factura:</b> ${compra.numero_factura}</p>
      <p><b>Total compra productos (ya con IVA 15%):</b> $${compra.total_compra_productos}</p>
      <p><b>Total envío:</b> $${compra.transporte_precio}</p>
      <p><b>Total:</b> $${compra.total}</p>
      <p><b>Productos:</b></p>
      <ul>
        ${compra.productos.map(p => `<li>${p}</li>`).join('')}
      </ul>
    `;
    contenedor.appendChild(div);
  });
}

//Asignar transporte a un envío
async function asignarTransporte(id_envio) {
  const transporte_id = document.getElementById("transporte_id").value;

  const res = await fetch(`https://envios-cff4.onrender.com/envios/${id_envio}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transporte_id })
  });

  if (res.ok) {
    alert("✅ Transporte asignado correctamente.");
    cargarEnviosPendientes(); // Recarga la lista de envíos
  } else {
    alert("❌ Error al asignar transporte.");
  }
}



async function cargarTransportes() {
  const res = await fetch("https://envios-cff4.onrender.com/transportes");
  const transportes = await res.json();
  const cont = document.getElementById("lista-transportes");
  cont.innerHTML = "";

  if (transportes.length === 0) {
    cont.innerHTML = "<p>No hay transportes registrados.</p>";
    return;
  }

  let html = `<table class="table"><tr><th>ID</th><th>Nombre</th><th>Capacidad</th><th>Precio</th></tr>`;
  transportes.forEach(t => {
    html += `<tr>
      <td>${t.id}</td>
      <td>${t.nombre}</td>
      <td>${t.capacidad_max_kg} kg</td>
      <td>$${t.precio}</td>
    </tr>`;
  });
  html += `</table>`;
  cont.innerHTML = html;
}


// ✅ Inicializar
(async () => {
  await cargarAlertasStock();
  await cargarProductos();
   await cargarEnviosPendientes();
  await cargarTransportes();
})();
