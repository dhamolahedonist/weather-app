const express = require('express');
const axios = require('axios');
const requestIp = require('request-ip');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware to get client IP address
app.use(requestIp.mw());

app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name || "Guest";
  const ip = req.clientIp;

  // Check if IP is localhost or a bogon
  if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.') || ip.startsWith('172.31.')) {
    return res.json({
      client_ip: ip,
      location: "Unknown",
      greeting: `Hello, ${visitorName}!, we cannot determine your location as your IP address is local or reserved.`
    });
  }

  try {
    // Get geolocation data
    const geoResponse = await axios.get(`https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`);
    const city = geoResponse.data.city || "Unknown";

    if (geoResponse.data.bogon) {
      return res.json({
        client_ip: ip,
        location: "Unknown",
        greeting: `Hello, ${visitorName}!, we cannot determine your location as your IP address is reserved.`
      });
    }

    // Get weather data
    const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHERMAP_KEY}&units=metric`);
    const temperature = weatherResponse.data.main.temp;

    // Formulate the response
    const response = {
      client_ip: ip,
      location: city,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching data');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
