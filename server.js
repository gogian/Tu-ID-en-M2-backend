// server.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Variables desde entorno
const APP_ID = process.env.PODIO_APP_ID;
const APP_TOKEN = process.env.PODIO_APP_TOKEN;
const EMAIL_FIELD_ID = process.env.PODIO_EMAIL_FIELD_ID;

app.use(cors());
app.use(express.json());

app.post('/consultar-id', async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ error: 'Correo requerido' });
  }

  try {
    const podioResponse = await fetch(`https://api.podio.com/item/app/${APP_ID}/filter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `OAuth2 ${APP_TOKEN}`
      },
      body: JSON.stringify({
        filters: {
          [EMAIL_FIELD_ID]: correo.toLowerCase().trim()
        },
        limit: 1
      })
    });

    const data = await podioResponse.json();

    if (data.items && data.items.length > 0) {
      const idInterno = data.items[0].item_id;
      return res.json({ id: idInterno });
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
