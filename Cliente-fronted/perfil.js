const usuario_id = sessionStorage.getItem("cedula");

async function consultarPerfil() {
  try {
    const res = await fetch(`https://construventa-2-36ul.onrender.com/usuarios/${usuario_id}`);
    if (!res.ok) throw new Error("No se pudo obtener el usuario");

    const data = await res.json();

    // Mostrar en la sección de perfil
    document.getElementById("cedula").textContent = data.cedula;
    document.getElementById("nombre").textContent = data.nombre;
    document.getElementById("apellido").textContent = data.apellido;
    document.getElementById("telefono").textContent = data.telefono;
    document.getElementById("direccion").textContent = data.direccion;
    document.getElementById("zona").textContent = data.zona;
    document.getElementById("email").textContent = data.email;

    // Autocompletar formulario de actualización
    document.getElementById("cedula-input").value = data.cedula;
    document.getElementById("nombre-input").value = data.nombre;
    document.getElementById("apellido-input").value = data.apellido;
    document.getElementById("telefono-input").value = data.telefono;
    document.getElementById("direccion-input").value = data.direccion;
    document.getElementById("zona-input").value = data.zona;
    document.getElementById("email-input").value = data.email;

  } catch (error) {
    console.error("❌ Error al cargar perfil:", error);
    document.getElementById("datos-usuario").innerHTML = "<p>Error al cargar datos de usuario.</p>";
  }
}

// ✅ Validación y envío del formulario
document.getElementById("formulario").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {};

  // Recorre cada input y agrega solo los que tengan valor
  ["nombre", "apellido", "telefono", "direccion", "zona", "email", "password"].forEach(campo => {
    const valor = document.getElementById(`${campo}-input`).value.trim();
    if (valor) data[campo] = valor;
  });

  // Validación opcional de email si fue editado
  if (data.email && !(
    data.email.endsWith("@gmail.com") ||
    data.email.endsWith("@hotmail.com") ||
    data.email.endsWith("@outlook.com")
  )) {
    alert("El correo debe terminar en @gmail.com, @hotmail.com o @outlook.com");
    document.getElementById("email-input").focus();
    return;
  }

  // Solo dígitos en teléfono si se edita
  if (data.telefono) {
    data.telefono = data.telefono.replace(/\D/g, "");
  }

  try {
    const res = await fetch(`https://construventa-2-36ul.onrender.com/usuarios/${usuario_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert("Datos actualizados correctamente.");
      consultarPerfil(); // 🔄 Recarga datos actualizados
    } else {
      const err = await res.json();
      alert("Error al actualizar: " + (err.detail || "Intenta nuevamente"));
    }

  } catch (error) {
    console.error("❌ Error al actualizar:", error);
    alert("Error de conexión con el servidor.");
  }
});

window.onload = consultarPerfil;
