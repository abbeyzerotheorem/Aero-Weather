import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import LottieView from 'lottie-react-native';

const ForecastCard = ({ forecastData }) => {
    if (!forecastData || !forecastData.forecast) return null;

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
                {animationSource ? (
                    <LottieView source={animationSource} autoPlay loop style={styles.smallLottie} />
                ) : (
                    <Text style={styles.weatherEmoji}>{dayData.weatherEmoji}</Text>
                )}
                <Text style={styles.temperature}>
                    {dayData.temperature}{forecastData.units === 'imperial' ? '°F' : '°C'}
                </Text>
                <Text style={styles.weatherText} numberOfLines={1}>
                    {dayData.weatherText}
                </Text>
                <View style={styles.detailRow}>
                    <Text style={styles.detailText}>💧 {dayData.humidity}%</Text>
                    <Text style={styles.detailText}>💨 {dayData.windSpeed} m/s</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📅 5-Day Forecast</Text>
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
    flatListContent: {
        paddingRight: 10,
    },
    forecastDay: {
        backgroundColor: '#f8f8f8',
        borderRadius: 15,
        padding: 15,
        marginRight: 12,
        minWidth: 120,
        alignItems: 'center',
    },
    dayName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 10,
    },
    weatherEmoji: {
        fontSize: 40,
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
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 5,
    },
    detailText: {
        fontSize: 11,
        color: '#999',
    },
});

export default ForecastCard;