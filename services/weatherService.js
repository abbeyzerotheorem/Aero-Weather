import axios from 'axios';

// Replace with your actual OpenWeatherMap API key
const API_KEY = 'edeb15f9490156ee9157f2953120af25';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Helper function to determine if it's day or night
const isDayTime = (currentTime, sunriseTime, sunsetTime) => {
    return currentTime > sunriseTime && currentTime < sunsetTime;
};

// Get weather emoji based on condition
const getWeatherEmoji = (iconCode) => {
    const iconMap = {
        '01d': '☀️',  // clear sky day
        '01n': '🌙',  // clear sky night
        '02d': '⛅',  // few clouds day
        '02n': '☁️',  // few clouds night
        '03d': '☁️',  // scattered clouds
        '03n': '☁️',
        '04d': '☁️',  // broken clouds
        '04n': '☁️',
        '09d': '🌧️',  // shower rain
        '09n': '🌧️',
        '10d': '🌦️',  // rain day
        '10n': '🌧️',  // rain night
        '11d': '⛈️',  // thunderstorm
        '11n': '⛈️',
        '13d': '❄️',  // snow
        '13n': '❄️',
        '50d': '🌫️',  // mist
        '50n': '🌫️'
    };
    
    return iconMap[iconCode] || '🌡️';
};

// Get current weather data
export const getCurrentWeather = async (cityName, units = 'metric') => {
    try {
        const response = await axios.get(`${BASE_URL}/weather`, {
            params: {
                q: cityName,
                appid: API_KEY,
                units: units  // 'metric' or 'imperial'
            }
        });
        
        const data = response.data;
        
        // Convert timestamps to Date objects
        const currentTime = new Date();
        const sunriseTime = new Date(data.sys.sunrise * 1000);
        const sunsetTime = new Date(data.sys.sunset * 1000);
        
        // Determine if it's day or night
        const isDay = isDayTime(currentTime, sunriseTime, sunsetTime);
        
        // Format the weather data
        const weatherData = {
            type: 'current',
            cityName: data.name,
            country: data.sys.country,
            temperature: Math.round(data.main.temp),
            temperatureUnit: units === 'metric' ? '°C' : '°F',
            feelsLike: Math.round(data.main.feels_like),
            weatherText: data.weather[0].description,
            weatherIcon: data.weather[0].icon,
            weatherEmoji: getWeatherEmoji(data.weather[0].icon),
            isDayTime: isDay,
            relativeHumidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed),
            pressure: data.main.pressure,
            visibility: (data.visibility / 1000).toFixed(1),
            sunrise: sunriseTime.toLocaleTimeString(),
            sunset: sunsetTime.toLocaleTimeString(),
            tempMin: Math.round(data.main.temp_min),
            tempMax: Math.round(data.main.temp_max)
        };
        
        return weatherData;
        
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        
        if (error.response?.data?.cod === '404') {
            throw new Error('City not found. Please check the spelling.');
        } else if (error.response?.data?.cod === '401') {
            throw new Error('Invalid API key. Please check your configuration.');
        } else if (error.response?.data?.cod === '429') {
            throw new Error('Too many requests. Please wait a moment.');
        } else {
            throw new Error('Network error. Check your connection.');
        }
    }
};

// NEW: Get 5-day forecast (every 3 hours)
export const getForecast = async (cityName, units = 'metric') => {
    try {
        const response = await axios.get(`${BASE_URL}/forecast`, {
            params: {
                q: cityName,
                appid: API_KEY,
                units: units
            }
        });
        
        const data = response.data;
        
        // Process forecast data - group by day and get relevant info
        const forecastByDay = {};
        
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            const hour = date.getHours();
            
            if (!forecastByDay[day]) {
                forecastByDay[day] = [];
            }
            
            forecastByDay[day].push({
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                hour: hour,
                temperature: Math.round(item.main.temp),
                feelsLike: Math.round(item.main.feels_like),
                weatherText: item.weather[0].description,
                weatherEmoji: getWeatherEmoji(item.weather[0].icon),
                weatherIcon: item.weather[0].icon,
                humidity: item.main.humidity,
                windSpeed: Math.round(item.wind.speed),
                rain: item.rain ? item.rain['3h'] : 0
            });
        });
        
        // Get the forecast for the next 5 days (excluding current day's future hours)
        const forecastDays = Object.keys(forecastByDay).slice(0, 5);
        const processedForecast = {};
        
        forecastDays.forEach(day => {
            const dayData = forecastByDay[day];
            // Get the forecast for noon (or closest to noon) for each day
            const noonForecast = dayData.reduce((prev, curr) => {
                const prevDiff = Math.abs(prev.hour - 12);
                const currDiff = Math.abs(curr.hour - 12);
                return currDiff < prevDiff ? curr : prev;
            });
            
            processedForecast[day] = {
                temperature: noonForecast.temperature,
                weatherText: noonForecast.weatherText,
                weatherEmoji: noonForecast.weatherEmoji,
                weatherIcon: noonForecast.weatherIcon,
                humidity: noonForecast.humidity,
                windSpeed: noonForecast.windSpeed,
                allForecasts: dayData // Keep all 3-hour intervals if needed
            };
        });
        
        return {
            cityName: data.city.name,
            country: data.city.country,
            units: units,
            forecast: processedForecast,
            fullForecast: forecastByDay // Detailed forecast by day
        };
        
    } catch (error) {
        console.error('Forecast API Error:', error);
        return null;
    }
};

// NEW: Get weather by coordinates (bonus feature)
export const getWeatherByCoordinates = async (lat, lon, units = 'metric') => {
    try {
        const response = await axios.get(`${BASE_URL}/weather`, {
            params: {
                lat: lat,
                lon: lon,
                appid: API_KEY,
                units: units
            }
        });
        
        const data = response.data;
        
        return {
            cityName: data.name,
            country: data.sys.country,
            temperature: Math.round(data.main.temp),
            temperatureUnit: units === 'metric' ? '°C' : '°F',
            weatherText: data.weather[0].description,
            weatherEmoji: getWeatherEmoji(data.weather[0].icon)
        };
        
    } catch (error) {
        console.error('Error fetching weather by coordinates:', error);
        throw error;
    }
};