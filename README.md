# Aero — Weather App

Aero is a **React Native (Expo)** weather application that provides current conditions and a 5-day forecast powered by the [OpenWeatherMap API](https://openweathermap.org/api). It features city autocomplete, Lottie weather animations, unit toggling (metric/imperial), offline caching, and bilingual support (English & Spanish).

## Features

- **Current Weather** — Temperature, "Feels Like", humidity, wind speed, pressure, visibility, sunrise/sunset times, and day/night indicator.
- **5-Day Forecast** — Horizontal scrollable cards showing temperature, weather description, humidity, and wind speed for each day (noon snapshot).
- **Autocomplete Search** — Type-ahead city suggestions powered by the OpenWeatherMap Geocoding API.
- **Unit Toggle** — Switch between Metric (°C, m/s) and Imperial (°F, mph) with a single switch.
- **Lottie Animations** — Animated weather icons (sun, clouds, rain, snow, thunderstorm, fog) that match current conditions.
- **Offline Caching** — Weather data is cached locally via `@react-native-async-storage/async-storage`; cached results are clearly labeled.
- **Recent Searches** — Quickly revisit the last 5 searched cities; clear all recent searches with one tap.
- **Pull-to-Refresh** — Swipe down to re-fetch the latest weather data.
- **Retry with Exponential Backoff** — Network requests automatically retry up to 3 times on transient failures.
- **Internationalization (i18n)** — Full translations for English and Spanish. Easily extensible with additional locale JSON files.
- **Cross-Platform** — Built with Expo; runs on iOS, Android, and Web.

## Screenshots

> _Add screenshots here. For example:_
> 
> | Current Weather | Forecast | City Search |
> |---|---|---|
> | ![Current Weather](screenshots/current.png) | ![Forecast](screenshots/forecast.png) | ![Search](screenshots/search.png) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (included as a dependency, run via `npx expo`)
- An **OpenWeatherMap API key** (free tier available at [openweathermap.org](https://openweathermap.org/api))

### 1. Clone & Install

```bash
git clone <repository-url> aero
cd aero
npm install
```

### 2. Configure API Key

Create a `.env` file in the project root:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

> ⚠️ The file `.env` is listed in `.gitignore` and will **not** be committed.  
> For production builds via **EAS Build**, set the same environment variable as a [secret](https://docs.expo.dev/build-reference/variables/).

### 3. Run the App

```bash
# Start the Expo development server
npx expo start

# Or run directly on a specific platform
npm run ios       # iOS simulator
npm run android   # Android emulator/device
npm run web       # Web browser
```

## Project Structure

```
Aero/
├── App.js                    # Main application component
├── index.js                  # Expo entry point
├── app.json                  # Expo configuration
├── app.config.js             # Dynamic config (injects API key)
├── components/
│   ├── AutocompleteInput.js  # City search with suggestions dropdown
│   ├── WeatherCard.js        # Current weather display card
│   └── ForecastCard.js       # 5-day forecast horizontal carousel
├── services/
│   ├── weatherService.js     # OpenWeatherMap API calls + caching
│   ├── locationService.js    # Geocoding and city search
│   ├── i18n.js               # Translation engine
│   └── retry.js              # Exponential backoff retry helper
├── locales/
│   ├── en.json               # English translations
│   └── es.json               # Spanish translations
├── assets/
│   ├── Aero.png              # App logo
│   ├── icon.png              # App icon
│   ├── splash-icon.png       # Splash screen
│   ├── lottie/               # Lottie JSON animation assets
│   └── ...                   # Android adaptive icons, favicon
├── __tests__/                # Jest test files
├── package.json
├── metro.config.js
└── README.md
```

## Scripts

| Command           | Description                        |
|-------------------|------------------------------------|
| `npm start`       | Start the Expo dev server          |
| `npm run ios`     | Run on iOS simulator               |
| `npm run android` | Run on Android emulator/device     |
| `npm run web`     | Run in web browser                 |
| `npm test`        | Run Jest test suite (`--runInBand`)|

## Configuration

### Adding a New Locale

1. Create a new JSON file in `locales/` (e.g., `fr.json`) with the same keys as `en.json`.
2. Import it in `services/i18n.js`:
   ```js
   import fr from '../locales/fr.json';
   let LOCALES = { en, es, fr };
   ```
3. Call `setLocale('fr')` at runtime to switch.

### Adding New Lottie Animations

Place a `.json` Lottie file in `assets/lottie/` and add its icon-code mapping in both `WeatherCard.js` and `ForecastCard.js`.

## Architecture Notes

- **Caching** — Current weather is cached for 10 minutes; forecast data for 60 minutes. The cache is read as a fallback when the network is unavailable. Cached data is marked with a "Cached" badge in the UI.
- **Retry Logic** — Network requests use exponential backoff (500ms → 1000ms → 2000ms). 4xx errors (except 429) are not retried.
- **API Key Injection** — The API key is read from `expo-constants` (via `app.config.js`), which sources it from environment variables or EAS Secrets. This avoids hardcoding secrets.

## Tech Stack

- **Framework** — [React Native](https://reactnative.dev/) + [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/)
- **Navigation** — None needed (single-screen app with FlatList sections)
- **State** — React `useState` / `useEffect`
- **Animations** — [lottie-react-native](https://github.com/lottie-react-native/lottie-react-native)
- **HTTP** — [axios](https://axios-http.com/)
- **Storage** — [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- **Icons** — [@expo/vector-icons](https://docs.expo.dev/guides/icons/) (Ionicons)
- **Geo** — [expo-location](https://docs.expo.dev/versions/latest/sdk/location/)
- **Testing** — [Jest](https://jestjs.io/) + [@testing-library/react-native](https://callstack.github.io/react-native-testing-library/)

## License

[MIT](LICENSE)