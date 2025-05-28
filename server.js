// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Variables desde entorno
const APP_ID = process.env.PODIO_APP_ID;
const APP_TOKEN = process.env.PODIO_APP_TOKEN;
const EMAIL_FIELD_ID = process.env.PODIO_EMAIL_FIELD_ID;

const corsOptions = {
  origin: 'https://gogian.github.io'
};

app.use(cors(corsOptions));
app.use(express.json());

app.post('/consultar-id', async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ error: 'Correo requerido' });
  }

  try {
    // Paso 1: Obtener access_token con app_id y app_token
    const authResponse = await axios.post('https://api.podio.com/oauth/token', {
      grant_type: 'app',
      app_id: APP_ID,
      app_token: APP_TOKEN
    });

    const accessToken = authResponse.data.access_token;

    // Paso 2: Armar filtro
    const filtro = {
      filters: {
        [EMAIL_FIELD_ID]: { from: correo.toLowerCase().trim() }
      },
      limit: 1
    };

    console.log('Filtro enviado a Podio:', filtro);

    // Paso 3: Consultar Podio con access_token
    const podioResponse = await axios.post(
      `https://api.podio.com/item/app/${APP_ID}/filter`,
      filtro,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `OAuth2 ${accessToken}`
        }
      }
    );

    const data = podioResponse.data;
    console.log('Respuesta de Podio:', data);

    if (data.items && data.items.length > 0) {
      const fields = data.items[0].fields;
      const campoTituloBDP = fields.find(f => f.external_id === 'titulo-bdp');

      if (campoTituloBDP && campoTituloBDP.values.length > 0) {
        const valorCompleto = campoTituloBDP.values[0].value;
        const match = valorCompleto.match(/^SV(\d+)/);

        if (match) {
          const soloNumero = match[1];
          return res.json({ id: soloNumero });
        } else {
          return res.status(500).json({ error: 'No se pudo extraer el ID interno del texto.' });
        }
      } else {
        return res.status(404).json({ error: 'No se encontró el campo de ID interna.' });
      }
    } else {
      return res.status(404).json({ error: 'No se encontró un broker con ese correo.' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
