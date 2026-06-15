import React from 'react';
import { render } from '@testing-library/react-native';
import WeatherCard from '../components/WeatherCard';

describe('WeatherCard', () => {
  const mockData = {
    cityName: 'Testville',
    country: 'TS',
    isDayTime: true,
    weatherIcon: '01d',
    weatherText: 'clear sky',
    temperature: 21,
    temperatureUnit: '°C',
    feelsLike: 20,
    relativeHumidity: 50,
    windSpeed: 3.2,
    pressure: 1013,
    visibility: 10,
    sunrise: '06:00',
    sunset: '19:30'
  };

  it('renders city name and temperature', () => {
    const { getByText } = render(<WeatherCard weatherData={mockData} units="metric" />);

    expect(getByText('Testville')).toBeTruthy();
    expect(getByText('21°C')).toBeTruthy();
    expect(getByText(/Clear Sky/i)).toBeTruthy();
  });
});
