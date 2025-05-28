<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Consulta tu ID interno - Brokers</title>
  <style>
    .form-container {
      background: rgba(255, 255, 255, 0.95);
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      max-width: 420px;
      margin: 3rem auto;
      font-family: sans-serif;
      border: 1px solid #ddd;
    }
    .form-container input,
    .form-container button {
      padding: 0.75rem;
      width: 100%;
      margin-top: 1rem;
      border-radius: 6px;
      border: 1px solid #ccc;
      font-size: 1rem;
    }
    .form-container button {
      background-color: #222;
      color: #fff;
      cursor: pointer;
    }
    .form-container button:hover {
      background-color: #444;
    }
    #resultado {
      margin-top: 1.5rem;
      font-weight: bold;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="form-container">
    <h2>Consulta tu ID interno</h2>
    <p>Ingresa el correo electrónico con el que estás registrado como broker:</p>
    <input type="email" id="correo" placeholder="correo@ejemplo.com">
    <button onclick="consultarID()">Consultar ID</button>
    <div id="resultado"></div>
  </div>

  <script>
    async function consultarID() {
      const correo = document.getElementById('correo').value.trim().toLowerCase();
      const resultado = document.getElementById('resultado');

      if (!correo) {
        resultado.textContent = "Por favor, ingresa un correo válido.";
        return;
      }

      resultado.textContent = "Buscando...";

      try {
        const response = await fetch("https://broker-id-api.onrender.com/consultar-id", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ correo })
        });

        const data = await response.json();

        if (response.ok && data.id) {
          resultado.textContent = `✅ Tu ID interno es: ${data.id}`;
        } else {
          resultado.textContent = `❌ ${data.error || 'No se encontró el broker.'}`;
        }
      } catch (error) {
        console.error(error);
        resultado.textContent = "❌ Error al conectar con el servidor.";
      }
    }
  </script>
</body>
</html>
