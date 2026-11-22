# Cloudify Weather

Cloudify is a browser-based weather dashboard built with React and TypeScript. It combines current conditions, hourly and daily forecasts, and air-quality data for a searched or current location. Weather data comes from public APIs; the app does not require a Cloudify account or API key.

## Features

- Search cities and regions with debounced autocomplete, keyboard navigation, and recent searches.
- Use browser geolocation and reverse geocoding to resolve a nearby place.
- View current conditions, a 24-hour forecast, a seven-day forecast, and weather details.
- Inspect a temperature trend chart and hourly precipitation chances.
- View US AQI and common pollutant readings when the air-quality service responds.
- Save favorite locations and customize temperature, wind, pressure, time, and theme preferences.
- Keep settings, favorites, recent searches, last location, and cached API responses in browser storage.
- Responsive layout, loading and error states, and a top-level React error boundary.

## Tech stack

- React 18, TypeScript 5, and Vite 5
- Tailwind CSS 3
- Recharts and Lucide React
- Vitest for utility unit tests

## Requirements

- Node.js 18 or newer
- npm
- A modern browser with JavaScript enabled

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (the configured default is `http://localhost:5173`). On Windows, `run.bat` also checks for Node.js, installs dependencies if `node_modules` is absent, opens the browser, and starts the development server.

## Commands

```bash
npm run dev      # Start the Vite development server
npm test         # Run Vitest unit tests
npm run build    # Type-check and create a production build in dist/
npm run preview  # Preview the production build locally
```

## Data providers

- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) for place search
- [Open-Meteo Forecast API](https://open-meteo.com/en/docs) for current, hourly, and daily weather
- [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) for AQI and pollutant values
- [BigDataCloud reverse geocoding](https://www.bigdatacloud.com/free-reverse-geocode-to-city-api) for resolving coordinates to a place name

These are called directly from the browser. An internet connection is required. The weather request is required for the dashboard; the air-quality request is optional and handled separately. Provider availability, coverage, terms, and attribution requirements apply. Review the providers' current terms before public or commercial deployment.

## Repository layout

```text
src/
  components/   Dashboard, search, forecast, settings, and state components
  hooks/        Weather orchestration, geolocation, debounce, local storage
  services/     API clients and browser cache
  types/        Location, settings, and weather data types
  utils/        Formatting, unit conversions, AQI, and weather-code mappings
  App.tsx       App state and dashboard composition
  main.tsx      React entry point
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the component structure, data flow, persistence, and operational notes.

## Tests

The repository includes Vitest unit tests for AQI interpretation, unit conversion, and weather-code mapping. Run them with `npm test`; this README does not assume a test count or test result.

## License

No license file is currently included. Add a `LICENSE` file before describing this repository as open source or granting reuse rights.
