import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Map OpenWeather icon codes to the user-downloaded Lottie JSON files
const animationMap = {
    '01d': require('../assets/lottie/sun.json'),
    '01n': require('../assets/lottie/moon.json'),
    '02d': require('../assets/lottie/partly-cloudy.json'),
    '02n': require('../assets/lottie/partly-cloudy.json'),
    '03d': require('../assets/lottie/clouds.json'),
    '03n': require('../assets/lottie/clouds.json'),
    '04d': require('../assets/lottie/clouds.json'),
    '04n': require('../assets/lottie/clouds.json'),
    '09d': require('../assets/lottie/drizzle.json'),
    '09n': require('../assets/lottie/drizzle.json'),
    '10d': require('../assets/lottie/rain.json'),
    '10n': require('../assets/lottie/rain.json'),
    '11d': require('../assets/lottie/thunderstorm.json'),
    '11n': require('../assets/lottie/thunderstorm.json'),
    '13d': require('../assets/lottie/snow.json'),
    '13n': require('../assets/lottie/snow.json'),
    '50d': require('../assets/lottie/fog.json'),
    '50n': require('../assets/lottie/fog.json'),
};

import t from '../services/i18n';

const WeatherCard = ({ weatherData, units = 'metric', toggleUnits = () => {}, isCached = false }) => {
    if (!weatherData) return null;

    const [LottieComp, setLottieComp] = useState(null);

    useEffect(() => {
        let mounted = true;
        // Try a synchronous require first (wrapped in try/catch so missing native module won't crash)
        try {
            // eslint-disable-next-line global-require
            const mod = require('lottie-react-native');
            if (mounted && mod) setLottieComp(() => (mod.default || mod));
        } catch (err) {
            // Fall back to dynamic import if available (still may fail in Expo Go)
            import('lottie-react-native')
                .then((mod) => {
                    if (mounted && mod) setLottieComp(() => (mod.default || mod));
                })
                .catch(() => {
                    // If lottie isn't available, keep LottieComp null and render fallback emoji
                });
        }
        return () => { mounted = false };
    }, []);

    // Map OpenWeatherMap icon codes to the existing Lottie JSON assets
    const getLottieAnimation = (iconCode) => {
        return animationMap[iconCode] || animationMap['01d'];
    };

    const timeOfDayText = weatherData.isDayTime ? 'Daytime' : 'Nighttime';
    
    // Get the icon code (supports both formats)
    const iconCode = weatherData.weatherIcon || weatherData.icon || '01d';
    const animationSource = getLottieAnimation(iconCode);
    
    // Capitalize weather description
    const capitalizedWeather = (weatherData.weatherText || '')
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <View style={styles.card}>
            {isCached && (
                <View style={styles.cacheBadge}>
                    <Text style={styles.cacheBadgeText}>Cached</Text>
                </View>
            )}
            {/* City Name + Units Toggle */}
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.cityName}>{weatherData.cityName || '—'}</Text>
                        <Text style={styles.country}>{weatherData.country || ''}</Text>
                    </View>
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel} accessibilityLabel="units">{units === 'metric' ? 'Metric' : 'Imperial'}</Text>
                        <Switch
                            value={units === 'imperial'}
                            onValueChange={toggleUnits}
                            thumbColor="#fff"
                            trackColor={{ false: 'rgba(0,0,0,0.06)', true: 'rgba(0,0,0,0.12)' }}
                            accessibilityRole="switch"
                            accessibilityLabel={units === 'metric' ? 'Metric units' : 'Imperial units'}
                        />
                    </View>
                </View>
            </View>
            
            {/* Temperature & Animation */}
            <View style={styles.temperatureContainer}>
                {LottieComp ? (
                    <LottieComp
                        source={animationSource}
                        autoPlay
                        loop
                        style={styles.lottie}
                    />
                ) : (
                    <Ionicons name="cloud-outline" size={40} color="#999" style={styles.lottieFallback} />
                )}
                <Text style={styles.temperature}>
                    {(weatherData.temperature ?? '--')}{(weatherData.temperatureUnit ?? '')}
                </Text>
            </View>
            
            {/* Weather Description */}
            <Text style={styles.weatherText}>{capitalizedWeather}</Text>
            
            {/* Feels Like */}
            <Text style={styles.feelsLike} accessibilityLabel={`${t('feels_like')} ${(weatherData.feelsLike ?? '--')}${(weatherData.temperatureUnit ?? '')}`}>
                {t('feels_like')} {(weatherData.feelsLike ?? '--')}{(weatherData.temperatureUnit ?? '')}
            </Text>
            
            {/* Day/Night Indicator */}
            <View style={styles.timeContainer}>
                <Ionicons name={weatherData.isDayTime ? 'sunny-outline' : 'moon-outline'} size={20} color="#666" style={styles.timeEmoji} />
                <Text style={styles.timeText}>{timeOfDayText}</Text>
            </View>
            
            {/* Weather Details Grid */}
            <View style={styles.detailsGrid}>
                <View style={styles.detailCard}>
                    <Ionicons name="water-outline" size={28} color="#666" style={styles.detailEmoji} />
                    <Text style={styles.detailLabel}>{t('humidity')}</Text>
                    <Text style={styles.detailValue}>{(weatherData.relativeHumidity ?? '--')}%</Text>
                </View>
                
                <View style={styles.detailCard}>
                    <Ionicons name="speedometer-outline" size={28} color="#666" style={styles.detailEmoji} />
                    <Text style={styles.detailLabel}>{t('wind_speed')}</Text>
                    <Text style={styles.detailValue}>{(weatherData.windSpeed ?? '--')} {units === 'metric' ? 'm/s' : 'mph'}</Text>
                </View>
                
                <View style={styles.detailCard}>
                    <Ionicons name="swap-vertical-outline" size={28} color="#666" style={styles.detailEmoji} />
                    <Text style={styles.detailLabel}>{t('pressure')}</Text>
                    <Text style={styles.detailValue}>{(weatherData.pressure ?? '--')} hPa</Text>
                </View>
                
                <View style={styles.detailCard}>
                    <Ionicons name="eye-outline" size={28} color="#666" style={styles.detailEmoji} />
                    <Text style={styles.detailLabel}>{t('visibility')}</Text>
                    <Text style={styles.detailValue}>{(weatherData.visibility ?? '--')} km</Text>
                </View>
            </View>
            
            {/* Sunrise/Sunset */}
            <View style={styles.sunContainer}>
                <View style={styles.sunItem}>
                    <Ionicons name="sunny-outline" size={24} color="#f39c12" style={styles.sunEmoji} />
                        <Text style={styles.sunLabel}>{t('sunrise')}</Text>
                    <Text style={styles.sunTime}>{weatherData.sunrise || '--'}</Text>
                </View>
                <View style={styles.sunItem}>
                    <Ionicons name="sunny-outline" size={24} color="#f39c12" style={styles.sunEmoji} />
                        <Text style={styles.sunLabel}>{t('sunset')}</Text>
                    <Text style={styles.sunTime}>{weatherData.sunset || '--'}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 20,
        margin: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 15,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    switchContainer: {
        alignItems: 'center',
    },
    switchLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 6,
    },
    cityName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    country: {
        fontSize: 16,
        color: '#999',
        marginTop: 5,
        textAlign: 'center',
    },
    temperatureContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    temperature: {
        fontSize: 72,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    lottie: {
        width: 80,
        height: 80,
        marginRight: 15,
    },
    lottieFallback: {
        fontSize: 40,
        marginRight: 15,
    },
    weatherText: {
        fontSize: 22,
        textAlign: 'center',
        color: '#666',
        marginBottom: 8,
    },
    feelsLike: {
        fontSize: 16,
        textAlign: 'center',
        color: '#999',
        marginBottom: 20,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
        paddingVertical: 10,
        backgroundColor: '#f8f8f8',
        borderRadius: 15,
    },
    timeEmoji: {
        fontSize: 20,
        marginRight: 8,
    },
    timeText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    detailCard: {
        width: '48%',
        backgroundColor: '#f8f8f8',
        borderRadius: 15,
        padding: 12,
        marginBottom: 10,
        alignItems: 'center',
    },
    detailEmoji: {
        fontSize: 28,
        marginBottom: 5,
    },
    detailLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 3,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    sunContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    sunItem: {
        alignItems: 'center',
    },
    sunEmoji: {
        fontSize: 24,
        marginBottom: 5,
    },
    sunLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 3,
    },
    sunTime: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    cacheBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.08)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 10,
    },
    cacheBadgeText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600',
    },
});

export default WeatherCard;