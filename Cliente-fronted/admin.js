

const admin_id = localStorage.getItem("cedula");
if (!admin_id) {
  window.location.href = "index.html";
}

async function cargarProductos() {
  const res = await fetch("https://inventario-d5am.onrender.com/api/productos");
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

  const res = await fetch("https://inventario-d5am.onrender.com/api/productos", {
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

  const res = await fetch(`https://inventario-d5am.onrender.com/api/productos/${codigo}`, {
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
  const res = await fetch("https://inventario-d5am.onrender.com/api/alerta-stock");
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

  const res = await fetch(`https://inventario-d5am.onrender.com/api/productos/${codigo}/reabastecer`, {
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

// ✅ Inicializar
(async () => {
  await cargarAlertasStock();
  await cargarProductos();
  // await cargarPedidos();
})();
