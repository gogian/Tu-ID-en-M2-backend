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
    const filtro = {
      filters: {
        [EMAIL_FIELD_ID]: { from: correo.toLowerCase().trim() }
      },
      limit: 1,
      app_id: APP_ID,
      app_token: APP_TOKEN
    };

    console.log('Filtro enviado a Podio:', filtro);

    const podioResponse = await axios.post(
      `https://api.podio.com/item/app/${APP_ID}/filter`,
      filtro,
      {
        headers: {
          'Content-Type': 'application/json'
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
    console.error(err.response?.data || err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
