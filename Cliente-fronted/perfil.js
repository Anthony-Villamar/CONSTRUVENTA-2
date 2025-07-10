const usuario_id = localStorage.getItem("cedula");

document.getElementById("perfil-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    cedula: usuario_id,
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    telefono: document.getElementById("telefono").value,
    direccion: document.getElementById("direccion").value,
    zona: document.getElementById("zona").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    rol: "cliente"  // ✅ Envía si tu modelo lo requiere por defecto
  };

  if !(email.endsWith("@gmail.com")||email.endsWith("@hotmail.com")||email.endsWith("outlook.com")) {
                alert("El correo debe terminar en @gmail.com, @hotmail.com, @outlook.com");
                emailInput.focus();
                return;
            }

  ["telefono"].forEach(id => {
    document.getElementById(id).addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, ""); // Reemplaza todo lo que no sea dígito
    });
});
  
  const res = await fetch(`https://usuarios-1yw0.onrender.com/usuarios/${usuario_id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    alert("Datos actualizados correctamente.");
  } else {
    alert("Error al actualizar datos.");
  }
});
