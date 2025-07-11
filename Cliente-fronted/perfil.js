const usuario_id = localStorage.getItem("cedula");

async function consultarPerfil() {
  try {
    const res = await fetch(`https://usuarios-1yw0.onrender.com/usuarios/${usuario_id}`);
    if (!res.ok) throw new Error("No se pudo obtener el usuario");

    const data = await res.json();

    // Mostrar datos
    document.getElementById("cedula").textContent = data.cedula;
    document.getElementById("nombre").textContent = data.nombre;
    document.getElementById("apellido").textContent = data.apellido;
    document.getElementById("telefono").textContent = data.telefono;
    document.getElementById("direccion").textContent = data.direccion;
    document.getElementById("zona").textContent = data.zona;
    document.getElementById("email").textContent = data.email;

    // Autocompletar formulario (la cédula no editable)
    document.getElementById("cedula-input").value = data.cedula;
    document.getElementById("nombre-input").value = data.nombre;
    document.getElementById("apellido-input").value = data.apellido;
    document.getElementById("telefono-input").value = data.telefono;
    document.getElementById("direccion-input").value = data.direccion;
    document.getElementById("zona-input").value = data.zona;
    document.getElementById("email-input").value = data.email;

  } catch (error) {
    console.error("❌ Error al cargar perfil:", error);
    alert("Error al cargar los datos de perfil.");
  }
}

document.getElementById("formulario").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email-input").value;
  if (!/@gmail\.com$|@hotmail\.com$|@outlook\.com$/.test(email)) {
    alert("El correo debe terminar en @gmail.com, @hotmail.com o @outlook.com");
    return;
  }

  const data = {
    nombre: document.getElementById("nombre-input").value,
    apellido: document.getElementById("apellido-input").value,
    telefono: document.getElementById("telefono-input").value.replace(/\D/g, ""),
    direccion: document.getElementById("direccion-input").value,
    zona: document.getElementById("zona-input").value,
    email: email,
    password: document.getElementById("password-input").value
  };

  try {
    const res = await fetch(`https://usuarios-1yw0.onrender.com/usuarios/${usuario_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert("Datos actualizados correctamente.");
      consultarPerfil(); // Recargar datos actualizados
    } else {
      alert("Error al actualizar los datos.");
    }
  } catch (error) {
    console.error("❌ Error al actualizar:", error);
    alert("Error al actualizar los datos.");
  }
});

window.onload = consultarPerfil;
