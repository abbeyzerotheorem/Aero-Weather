import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    ActivityIndicator,
    Keyboard,
    Alert,
    FlatList,
    Switch,
    ScrollView,
    RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentWeather, getForecast } from './services/weatherService';
import AutocompleteInput from './components/AutocompleteInput';
import WeatherCard from './components/WeatherCard';
import ForecastCard from './components/ForecastCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';



export default function App() {
    const [city, setCity] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [units, setUnits] = useState('metric'); // 'metric' or 'imperial'
    const [recentSearches, setRecentSearches] = useState([]);

    useEffect(() => {
        loadLastCity();
        loadRecentCities();
    }, []);

    const loadRecentCities = async () => {
        try {
            const raw = await AsyncStorage.getItem('recentCities');
            if (raw) {
                const parsed = JSON.parse(raw);
                setRecentSearches(Array.isArray(parsed) ? parsed : []);
            }
        } catch (e) {
            console.error('Error loading recent cities:', e);
        }
    };

    const saveRecentCities = async (cities) => {
        try {
            await AsyncStorage.setItem('recentCities', JSON.stringify(cities));
        } catch (e) {
            console.error('Error saving recent cities:', e);
        }
    };

    const clearRecentCities = async () => {
        try {
            await AsyncStorage.removeItem('recentCities');
            setRecentSearches([]);
        } catch (e) {
            console.error('Error clearing recent cities:', e);
        }
    };

    const confirmClearRecentCities = () => {
        Alert.alert(
            'Clear recent searches',
            'Are you sure you want to clear recent searches?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearRecentCities }
            ]
        );
    };

    const loadLastCity = async () => {
        try {
            const lastCity = await AsyncStorage.getItem('lastCity');
            if (lastCity) {
                setCity(lastCity);
                await fetchWeatherData(lastCity);
            }
        } catch (error) {
            console.error('Error loading last city:', error);
        }
    };

    const saveLastCity = async (cityName) => {
        try {
            await AsyncStorage.setItem('lastCity', cityName);
        } catch (error) {
            console.error('Error saving last city:', error);
        }
    };

    const fetchWeatherData = async (cityName, showLoading = true, unitsArg) => {
        if (!cityName || !cityName.trim()) {
            Alert.alert('⚠️ Error', 'Please select or enter a city name');
            return;
        }

        // Extract just the city name (remove country/state if present)
        const cleanCityName = cityName.split(',')[0].trim();

        if (showLoading) {
            setLoading(true);
        }
        setError('');
        Keyboard.dismiss();

        try {
            const usedUnits = unitsArg || units;
            // Fetch both current weather and forecast
            const [current, forecast] = await Promise.all([
                getCurrentWeather(cleanCityName, usedUnits),
                getForecast(cleanCityName, usedUnits)
            ]);
            
            setWeatherData(current);
            setForecastData(forecast);
            await saveLastCity(cityName);

            // Update recent searches (most recent first, unique, max 5)
            try {
                const newList = [cityName, ...recentSearches.filter(c => c !== cityName)].slice(0, 5);
                setRecentSearches(newList);
                await saveRecentCities(newList);
            } catch (e) {
                console.error('Error updating recent searches:', e);
            }
            
        } catch (error) {
            setError(error.message);
            setWeatherData(null);
            setForecastData(null);
            Alert.alert('❌ Error', error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSelectCity = (selectedCity) => {
        fetchWeatherData(selectedCity, true);
    };

    const handleRefresh = () => {
        if (city) {
            setRefreshing(true);
            fetchWeatherData(city, false);
        }
    };

    const handleClear = () => {
        setCity('');
        setWeatherData(null);
        setForecastData(null);
        setError('');
    };

    const getCurrentLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            // Use coordinates to get weather
            // Optionally: fetch weather by coordinates: getWeatherByCoordinates
        }
    };

    const toggleUnits = () => {
        const newUnits = units === 'metric' ? 'imperial' : 'metric';
        setUnits(newUnits);
        if (city) {
            // refetch with the new units
            fetchWeatherData(city, true, newUnits);
        }
    };

    const renderSections = () => {
        const sections = [];

        sections.push({ type: 'header', id: 'header' });
        sections.push({ type: 'search', id: 'search' });

        if (loading) {
            sections.push({ type: 'loading', id: 'loading' });
        } else if (error && !loading) {
            sections.push({ type: 'error', id: 'error' });
        } else if (weatherData && !loading) {
            sections.push({ type: 'weather', id: 'weather' });
            if (forecastData) {
                sections.push({ type: 'forecast', id: 'forecast' });
            }
        }

        sections.push({ type: 'footer', id: 'footer' });
        return sections;
    };

    const renderItem = ({ item }) => {
        switch (item.type) {
            case 'header':
                return (
                    <View style={styles.header}>
                        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.title}>🌤️ Weather App</Text>
                            <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                                <Text style={{ color: '#fff', marginRight: 8 }}>{units === 'metric' ? 'Metric' : 'Imperial'}</Text>
                                <Switch
                                    value={units === 'imperial'}
                                    onValueChange={toggleUnits}
                                    thumbColor={units === 'imperial' ? '#fff' : '#fff'}
                                    trackColor={{ false: 'rgba(255,255,255,0.3)', true: 'rgba(255,255,255,0.6)' }}
                                />
                            </View>
                        </View>
                        <Text style={styles.subtitle}>
                            Search with autocomplete suggestions
                        </Text>
                        {weatherData && (
                            <View style={styles.apiInfo}>
                                <Text style={styles.apiInfoText}>
                                    ✅ Free Plan: 60 calls/minute available
                                </Text>
                            </View>
                        )}
                    </View>
                );
            case 'search':
                return (
                    <View style={styles.searchSection}>
                        <Text style={styles.label}>Search for a City</Text>
                        
                        <AutocompleteInput
                            value={city}
                            onChangeText={setCity}
                            onSelectCity={handleSelectCity}
                            placeholder="Type city name (e.g., London, Paris, Tokyo)..."
                        />
                        
                        {city.length > 0 && (
                            <TouchableOpacity 
                                style={styles.clearButton}
                                onPress={handleClear}
                            >
                                <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity>
                        )}
                        
                        <View style={styles.tipContainer}>
                            <Text style={styles.tipText}>
                                💡 Tip: Start typing to see city suggestions
                            </Text>
                        </View>
                        {recentSearches.length > 0 && (
                            <View style={styles.recentContainer}>
                                <View style={styles.recentHeader}>
                                    <Text style={styles.recentTitle}>Recent Searches</Text>
                                    <TouchableOpacity style={styles.clearRecentButton} onPress={confirmClearRecentCities}>
                                        <Text style={styles.clearRecentText}>Clear</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.chipsRow}>
                                    {recentSearches.map((c) => (
                                        <TouchableOpacity
                                            key={c}
                                            style={styles.chip}
                                            onPress={() => {
                                                setCity(c);
                                                handleSelectCity(c);
                                            }}
                                        >
                                            <Text style={styles.chipText}>{c}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                );
            case 'loading':
                return (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>
                            Fetching current weather and 5-day forecast...
                        </Text>
                        <Text style={styles.loadingSubtext}>
                            Using OpenWeatherMap API (60 calls/minute)
                        </Text>
                    </View>
                );
            case 'error':
                return (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorEmoji}>😕</Text>
                        <Text style={styles.errorText}>{error}</Text>
                        <Text style={styles.errorHint}>
                            Try selecting a city from the suggestions
                        </Text>
                    </View>
                );
            case 'weather':
                return <WeatherCard weatherData={weatherData} />;
            case 'forecast':
                return <ForecastCard forecastData={forecastData} />;
            case 'footer':
                return (
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Data provided by OpenWeatherMap
                        </Text>
                        <Text style={styles.footerSubtext}>
                            Free Plan • 60 calls/minute • 5-day forecast • Autocomplete
                        </Text>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={renderSections()}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.scrollContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={["#007AFF"]}
                    />
                }
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    header: {
        backgroundColor: '#007AFF',
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        textAlign: 'center',
    },
    apiInfo: {
        marginTop: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    apiInfoText: {
        fontSize: 11,
        color: '#fff',
    },
    searchSection: {
        padding: 20,
        zIndex: 1000,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    clearButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    clearButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    tipContainer: {
        marginTop: 12,
        padding: 10,
        backgroundColor: '#fff9e6',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#FFD700',
    },
    tipText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    loadingSubtext: {
        marginTop: 8,
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    errorContainer: {
        backgroundColor: '#fff3f3',
        padding: 20,
        margin: 20,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ffcdd2',
    },
    errorEmoji: {
        fontSize: 48,
        marginBottom: 10,
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '600',
    },
    errorHint: {
        color: '#999',
        fontSize: 14,
        textAlign: 'center',
    },
    footer: {
        padding: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    footerSubtext: {
        fontSize: 10,
        color: '#bbb',
        textAlign: 'center',
        marginTop: 4,
    },
    recentContainer: {
        marginTop: 12,
    },
    recentTitle: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
        fontWeight: '600',
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    chipText: {
        fontSize: 13,
        color: '#333',
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    clearRecentButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: 'rgba(0,0,0,0.08)',
        borderRadius: 12,
    },
    clearRecentText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600',
    },
});