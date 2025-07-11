<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Actualización de datos</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</head>
<body class="bg-light">

<header>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand" href="venta.html">ConstruVenta</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a class="nav-link" href="venta.html">Inicio</a></li>
          <li class="nav-item"><a class="nav-link" href="compras.html">Tus Compras</a></li>
          <li class="nav-item"><a class="nav-link" href="seguimiento.html">Seguimiento de Envío</a></li>
          <li class="nav-item"><a class="nav-link active" href="perfil.html">Perfil</a></li>
          <li class="nav-item"><a class="nav-link" href="index.html" onclick="logout()">Log out</a></li>
        </ul>
      </div>
    </div>
  </nav>
</header>

<main class="container mt-5">
  <h3 class="text-center mb-4">Mi Perfil</h3>

  <div class="row justify-content-center">
    <div class="col-md-6">

      <!-- Datos del Usuario -->
      <div class="card shadow mb-4">
        <div class="card-body">
          <h5 class="card-title">Datos Registrados</h5>
          <p><b>Cédula:</b> <span id="cedula"></span></p>
          <p><b>Nombre:</b> <span id="nombre"></span></p>
          <p><b>Apellido:</b> <span id="apellido"></span></p>
          <p><b>Teléfono:</b> <span id="telefono"></span></p>
          <p><b>Dirección:</b> <span id="direccion"></span></p>
          <p><b>Zona:</b> <span id="zona"></span></p>
          <p><b>Email:</b> <span id="email"></span></p>
        </div>
      </div>

      <!-- Formulario de Actualización -->
      <div class="card shadow">
        <div class="card-body">
          <h5 class="card-title text-center mb-4">Actualización de Datos</h5>

          <form id="formulario">

            <div class="mb-3">
              <label for="cedula-input" class="form-label">Cédula</label>
              <input type="text" class="form-control" id="cedula-input" readonly />
            </div>

            <div class="mb-3">
              <label for="nombre-input" class="form-label">Nombre</label>
              <input type="text" class="form-control" id="nombre-input" maxlength="15" required />
            </div>

            <div class="mb-3">
              <label for="apellido-input" class="form-label">Apellido</label>
              <input type="text" class="form-control" id="apellido-input" maxlength="20" required />
            </div>

            <div class="mb-3">
              <label for="telefono-input" class="form-label">Teléfono</label>
              <input type="text" class="form-control" id="telefono-input" maxlength="10" required />
            </div>

            <div class="mb-3">
              <label for="direccion-input" class="form-label">Dirección</label>
              <input type="text" class="form-control" id="direccion-input" maxlength="50" required />
            </div>

            <div class="mb-3">
              <label for="zona-input" class="form-label">Zona</label>
              <select class="form-select" id="zona-input" required>
                <option value="" disabled selected>Selecciona una zona</option>
                <option value="norte">Norte</option>
                <option value="centro">Centro</option>
                <option value="sur">Sur</option>
                <option value="este">Este</option>
                <option value="oeste">Oeste</option>
              </select>
            </div>

            <div class="mb-3">
              <label for="email-input" class="form-label">Correo</label>
              <input type="email" class="form-control" id="email-input" maxlength="30" required />
            </div>

            <div class="mb-3">
              <label for="password-input" class="form-label">Contraseña</label>
              <input type="password" class="form-control" id="password-input" maxlength="25" required />
            </div>

            <button type="submit" class="btn btn-success w-100">Actualizar</button>
          </form>

          <div class="text-center mt-3">
            <a href="venta.html">Ir a la página principal</a>
          </div>

        </div>
      </div>

    </div>
  </div>
</main>

<script src="perfil.js"></script>
<script>
  function logout() {
    localStorage.clear();
    window.location.href = "login.html";
  }
</script>
</body>
</html>
