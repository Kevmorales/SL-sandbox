const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

//  CORS-hantering så att frontend kan prata med backend.
const cors = require('cors');
app.use(cors({
    origin: 'https://sl-sandbox.surge.sh'
  }));

app.get('/service-alerts', async (req, res) => {
    const API_KEY = process.env.API_KEY;
    let apiUrl = `https://api.sl.se/api2/deviations.json?key=${API_KEY}`;
    res.setHeader('Cache-Control', 'no-store'); // förhindra cachning.

    // Lägg till transportmedel och linjenummer till URL om de skickas som parametrar.
    if (req.query.transportMode) {
        apiUrl += `&transportMode=${req.query.transportMode}`;
    }

    if (req.query.lineNumber) {
        apiUrl += `&lineNumber=${req.query.lineNumber}`;
    }
    try {
        // SL API returnera datan.
        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        console.error("Fel vid hämtning från SL-tjänst:", error);
        res.status(500).send('Fel vid hämtning från SL-tjänst');
    }
});

app.get('/traffic-status', async (req, res) => {
    const API_TRAFFIC = process.env.API_TRAFFIC;
    let apiUrl = `https://api.sl.se/api2/trafficsituation.json?key=${API_TRAFFIC}`;
    try {
        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        console.error("Fel vid hämtning från SL Trafikstatus:", error);
        res.status(500).send('Fel vid hämtning från SL Trafikstatus');
    }
});

// Starta servern på angiven port.
app.listen(PORT, () => {
    console.log(`Servern körs på port ${PORT}`);
});