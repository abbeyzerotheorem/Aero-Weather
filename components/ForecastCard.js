import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ForecastCard = ({ forecastData, isCached = false }) => {
    if (!forecastData || !forecastData.forecast) return null;

    const [LottieComp, setLottieComp] = useState(null);

    useEffect(() => {
        let mounted = true;
        import('lottie-react-native')
            .then((mod) => {
                if (mounted && mod && mod.default) setLottieComp(() => mod.default);
            })
            .catch(() => {});
        return () => { mounted = false };
    }, []);

    const days = Object.keys(forecastData.forecast);
    
    // Convert to array for FlatList
    const forecastArray = days.map((day, index) => ({
        id: index,
        day: day,
        data: forecastData.forecast[day]
    }));

    // Map icon codes to available Lottie animations (use same assets as WeatherCard)
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

    const renderForecastItem = ({ item }) => {
        const dayData = item.data;
        const iconCode = dayData.weatherIcon || '01d';
        const animationSource = animationMap[iconCode];

        return (
            <View style={styles.forecastDay}>
                <Text style={styles.dayName}>{item.day}</Text>
                {animationSource && LottieComp ? (
                    <LottieComp source={animationSource} autoPlay loop style={styles.smallLottie} />
                ) : (
                    <Ionicons name="cloud-outline" size={40} color="#999" style={styles.weatherEmoji} />
                )}
                <Text style={styles.temperature}>
                    {dayData.temperature}{forecastData.units === 'imperial' ? '°F' : '°C'}
                </Text>
                <Text style={styles.weatherText} numberOfLines={1}>
                    {dayData.weatherText}
                </Text>
                <View style={styles.detailRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="water-outline" size={14} color="#999" style={{ marginRight: 6 }} />
                        <Text style={styles.detailText}>{dayData.humidity}%</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="speedometer-outline" size={14} color="#999" style={{ marginRight: 6 }} />
                        <Text style={styles.detailText}>{dayData.windSpeed} m/s</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <Ionicons name="calendar-outline" size={18} color="#333" style={{ marginRight: 8 }} />
                <Text style={styles.title}>5-Day Forecast</Text>
                {isCached && <Text style={styles.cachedLabel}>cached</Text>}
            </View>
            <FlatList
                data={forecastArray}
                renderItem={renderForecastItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 20,
        margin: 20,
        marginTop: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    cachedLabel: {
        fontSize: 12,
        color: '#999',
        marginLeft: 8,
    },
    flatListContent: {
        paddingLeft: 18,
        paddingRight: 18,
        alignItems: 'center',
    },
    forecastDay: {
        backgroundColor: '#f8f8f8',
        borderRadius: 15,
        paddingVertical: 16,
        paddingHorizontal: 12,
        marginRight: 12,
        width: 140,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    weatherEmoji: {
        marginBottom: 8,
    },
    smallLottie: {
        width: 56,
        height: 56,
        marginBottom: 8,
    },
    temperature: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    weatherText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
        width: '100%',
        flexShrink: 1,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 8,
    },
    detailText: {
        fontSize: 11,
        color: '#999',
    },
});

export default ForecastCard;