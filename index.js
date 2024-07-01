const express = require('express');
const axios = require('axios');
const app = express();


require("dotenv").config();
const port = process.env.PORT;




app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name;

    if (!visitorName) {
        return res.status(400).json({ error: 'visitor_name query parameter is required' });
    }

    try {
        const clientIp = req.ip === '::1' ? '127.0.0.1' : req.ip; // Handle local development
        const locationResponse = await axios.get(`https://ipapi.co/${clientIp}/json/`);

        let city = locationResponse.data.city;

        if (locationResponse.data.error || !city) {
            city = 'New York'; // Default city
        }

        const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.OPENWEATHERMAP_API_KEY}`);
        const { temp } = weatherResponse.data.main;

        const greeting = `Hello, ${visitorName}!, the temperature is ${temp} degrees Celsius in ${city}`;

        res.json({
            client_ip: clientIp,
            location: city,
            greeting
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});