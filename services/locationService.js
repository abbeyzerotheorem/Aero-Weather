import axios from 'axios';
import Constants from 'expo-constants';

// OpenWeatherMap Geocoding API
const GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0';
const API_KEY = (
    (typeof process !== 'undefined' && process.env && process.env.OPENWEATHER_API_KEY) ||
    (Constants?.expoConfig?.extra?.OPENWEATHER_API_KEY) ||
    (Constants?.manifest?.extra?.OPENWEATHER_API_KEY) ||
    '<REPLACE_WITH_YOUR_OPENWEATHERMAP_API_KEY>'
); // Use same API key

// Debug logging removed.

// Search for cities by name (autocomplete)
export const searchCities = async (query) => {
    if (!query || query.length < 2) {
        return [];
    }
    
    try {
        const response = await axios.get(`${GEOCODING_URL}/direct`, {
            params: {
                q: query,
                limit: 10, // Max 10 suggestions
                appid: API_KEY
            }
        });
        
        // Format the results
        const cities = response.data.map(city => ({
            name: city.name,
            country: city.country,
            state: city.state || '',
            fullName: city.state 
                ? `${city.name}, ${city.state}, ${city.country}`
                : `${city.name}, ${city.country}`,
            lat: city.lat,
            lon: city.lon
        }));
        
        return cities;
        
    } catch (error) {
        console.error('Geocoding API Error:', error);
        return [];
    }
};

// Reverse geocoding (get city name from coordinates)
export const getCityFromCoordinates = async (lat, lon) => {
    try {
        const response = await axios.get(`${GEOCODING_URL}/reverse`, {
            params: {
                lat: lat,
                lon: lon,
                limit: 1,
                appid: API_KEY
            }
        });
        
        if (response.data && response.data[0]) {
            const city = response.data[0];
            return {
                name: city.name,
                country: city.country,
                fullName: `${city.name}, ${city.country}`
            };
        }
        return null;
        
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
};