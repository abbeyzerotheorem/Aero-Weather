import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { retryRequest } from './retry';

// IMPORTANT: Do NOT commit API keys. Prefer environment variables or secure storage.
// Read from multiple places for compatibility: process.env, Expo app config (`expoConfig.extra`), or older `manifest.extra`.
const API_KEY = (
    (typeof process !== 'undefined' && process.env && process.env.OPENWEATHER_API_KEY) ||
    (Constants?.expoConfig?.extra?.OPENWEATHER_API_KEY) ||
    (Constants?.manifest?.extra?.OPENWEATHER_API_KEY) ||
    '<REPLACE_WITH_YOUR_OPENWEATHERMAP_API_KEY>'
);

// Debug logging removed.
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Helper function to determine if it's day or night
const isDayTime = (currentTime, sunriseTime, sunsetTime) => {
    return currentTime > sunriseTime && currentTime < sunsetTime;
};

// Get weather emoji based on condition
const getWeatherEmoji = (iconCode) => {
    // Return a simple textual fallback label instead of emoji glyphs
    const iconMap = {
        '01d': 'Clear',  // clear sky day
        '01n': 'Clear',  // clear sky night
        '02d': 'Partly cloudy',
        '02n': 'Partly cloudy',
        '03d': 'Cloudy',  // scattered clouds
        '03n': 'Cloudy',
        '04d': 'Cloudy',  // broken clouds
        '04n': 'Cloudy',
        '09d': 'Shower rain',  // shower rain
        '09n': 'Shower rain',
        '10d': 'Rain',  // rain day
        '10n': 'Rain',  // rain night
        '11d': 'Thunderstorm',  // thunderstorm
        '11n': 'Thunderstorm',
        '13d': 'Snow',  // snow
        '13n': 'Snow',
        '50d': 'Mist',  // mist
        '50n': 'Mist'
    };
    
    return iconMap[iconCode] || '';
};

// Get current weather data
export const getCurrentWeather = async (cityName, units = 'metric') => {
    const cacheKey = `cache:current:${cityName}:${units}`;
    const cacheTTL = 10 * 60 * 1000; // 10 minutes

    const fetchFn = async () => {
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
        
        // cache successful response
        try {
            await AsyncStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: weatherData }));
        } catch (e) {
            // ignore cache write errors
        }

        return weatherData;
    };

    // Try network with retries, fallback to cache if available
    try {
        return await retryRequest(fetchFn, 3, 500);
    } catch (error) {
        // attempt to read from cache
        try {
            const raw = await AsyncStorage.getItem(cacheKey);
            if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Date.now() - parsed.ts < cacheTTL) {
                        // mark as from cache
                        try { parsed.data._fromCache = true; } catch (e) {}
                        return parsed.data;
                    }
                }
        } catch (e) {
            // ignore
        }

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
    const cacheKey = `cache:forecast:${cityName}:${units}`;
    const cacheTTL = 60 * 60 * 1000; // 60 minutes

    const fetchFn = async () => {
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
        
        const result = {
            cityName: data.city.name,
            country: data.city.country,
            units: units,
            forecast: processedForecast,
            fullForecast: forecastByDay // Detailed forecast by day
        };

        try {
            await AsyncStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: result }));
        } catch (e) {
            // ignore cache write errors
        }

        return result;
    };

    try {
        return await retryRequest(fetchFn, 3, 500);
    } catch (error) {
        try {
            const raw = await AsyncStorage.getItem(cacheKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Date.now() - parsed.ts < cacheTTL) {
                    try { parsed.data._fromCache = true; } catch (e) {}
                    return parsed.data;
                }
            }
        } catch (e) {
            // ignore
        }

        console.error('Forecast API Error:', error);
        return null;
    }
};

// NEW: Get weather by coordinates (bonus feature)
export const getWeatherByCoordinates = async (lat, lon, units = 'metric') => {
    const cacheKey = `cache:coords:${lat}:${lon}:${units}`;
    const cacheTTL = 10 * 60 * 1000; // 10 minutes

    const fetchFn = async () => {
        const response = await axios.get(`${BASE_URL}/weather`, {
            params: {
                lat: lat,
                lon: lon,
                appid: API_KEY,
                units: units
            }
        });
        const data = response.data;
        const result = {
            cityName: data.name,
            country: data.sys.country,
            temperature: Math.round(data.main.temp),
            temperatureUnit: units === 'metric' ? '°C' : '°F',
            weatherText: data.weather[0].description,
            weatherEmoji: getWeatherEmoji(data.weather[0].icon)
        };

        try {
            await AsyncStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: result }));
        } catch (e) {}

        return result;
    };

    try {
        return await retryRequest(fetchFn, 3, 500);
    } catch (error) {
        try {
            const raw = await AsyncStorage.getItem(cacheKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Date.now() - parsed.ts < cacheTTL) {
                    try { parsed.data._fromCache = true; } catch (e) {}
                    return parsed.data;
                }
            }
        } catch (e) {}
        console.error('Error fetching weather by coordinates:', error);
        throw error;
    }
};