const usuario_id = localStorage.getItem("cedula");

async function consultarPerfil() {
  try {
    const res = await fetch(`https://usuarios-1yw0.onrender.com/usuarios/${usuario_id}`);
    if (!res.ok) throw new Error("No se pudo obtener el usuario");

    const data = await res.json();

    // 🔥 Mostrar en la sección de perfil
    document.getElementById("cedula").textContent = data.cedula;
    document.getElementById("nombre").textContent = data.nombre;
    document.getElementById("apellido").textContent = data.apellido;
    document.getElementById("telefono").textContent = data.telefono;
    document.getElementById("direccion").textContent = data.direccion;
    document.getElementById("zona").textContent = data.zona;
    document.getElementById("email").textContent = data.email;

    // 🔥 Autocompletar formulario de actualización
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

  const email = document.getElementById("email-input").value;

  if (
    !(
      email.endsWith("@gmail.com") ||
      email.endsWith("@hotmail.com") ||
      email.endsWith("@outlook.com")
    )
  ) {
    alert("El correo debe terminar en @gmail.com, @hotmail.com o @outlook.com");
    document.getElementById("email-input").focus();
    return;
  }

  const data = {
    cedula: usuario_id,
    nombre: document.getElementById("nombre-input").value,
    apellido: document.getElementById("apellido-input").value,
    telefono: document.getElementById("telefono-input").value,
    direccion: document.getElementById("direccion-input").value,
    zona: document.getElementById("zona-input").value,
    email: email,
    password: document.getElementById("password-input").value,
    rol: "cliente"
  };

  // ✅ Solo dígitos en teléfono
  data.telefono = data.telefono.replace(/\D/g, "");

  const res = await fetch(`https://usuarios-1yw0.onrender.com/usuarios/${usuario_id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    alert("Datos actualizados correctamente.");
    consultarPerfil(); // 🔄 Recarga datos actualizados
  } else {
    alert("Error al actualizar datos.");
  }
});

window.onload = consultarPerfil;


// const usuario_id = localStorage.getItem("cedula");

// document.getElementById("perfil-form").addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const data = {
//     cedula: usuario_id,
//     nombre: document.getElementById("nombre").value,
//     apellido: document.getElementById("apellido").value,
//     telefono: document.getElementById("telefono").value,
//     direccion: document.getElementById("direccion").value,
//     zona: document.getElementById("zona").value,
//     email: document.getElementById("email").value,
//     password: document.getElementById("password").value,
//     rol: "cliente"  // ✅ Envía si tu modelo lo requiere por defecto
//   };

//  if (
//   !(
//       email.endsWith("@gmail.com") ||
//       email.endsWith("@hotmail.com") ||
//       email.endsWith("@outlook.com")
//     )
//   ) {
//     alert("El correo debe terminar en @gmail.com, @hotmail.com, @outlook.com");
//     emailInput.focus();
//     return;
//   }


//   ["telefono"].forEach(id => {
//     document.getElementById(id).addEventListener("input", function () {
//         this.value = this.value.replace(/\D/g, ""); // Reemplaza todo lo que no sea dígito
//     });
// });
  
//   const res = await fetch(`https://usuarios-1yw0.onrender.com/usuarios/${usuario_id}`, {
//     method: "PATCH",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data)
//   });

//   if (res.ok) {
//     alert("Datos actualizados correctamente.");
//   } else {
//     alert("Error al actualizar datos.");
//   }
// });
