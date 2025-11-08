import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// Get today weather
export const goToHome = async (req, res) => {
    try {
        const city = "College Station";
        const apiKey = process.env.WEATHER_API_KEY;
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=imperial&appid=${apiKey}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            return res.status(response.status).send("Weather API error");
        }
        const data = await response.json();
        const temp = data.main.temp;
        const desc = data.weather[0].description;
        const name = data.name;

        // send json request to frontend
        res.json({
            city: name,
            temperature: temp,
            description: desc,
        });
    }catch(err){
        console.error("Error: ", err);
        res.status(500).send("Server error retrieving weather");
    }
};

