import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GeoLocation, Coordinates } from './types/location';
import { UserSettings, DEFAULT_SETTINGS, ThemeMode } from './types/settings';
import { useWeather, DEFAULT_INITIAL_LOCATION } from './hooks/useWeather';
import { useGeolocation } from './hooks/useGeolocation';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Header } from './components/Header';
import { CurrentWeather } from './components/CurrentWeather';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { AirQualityCard } from './components/AirQualityCard';
import { WeatherDetailsGrid } from './components/WeatherDetailsGrid';
import { SavedLocations } from './components/SavedLocations';
import { SkeletonLoader } from './components/SkeletonLoader';
import { ErrorState } from './components/ErrorState';
import { DynamicBackground } from './components/DynamicBackground';
import { Footer } from './components/Footer';
import { AlertCircle, X } from 'lucide-react';

export const App: React.FC = () => {
  // Settings & Preferences (persisted in localStorage)
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    'cloudify_user_settings',
    DEFAULT_SETTINGS
  );

  // Saved locations (favorites)
  const [savedLocations, setSavedLocations] = useLocalStorage<GeoLocation[]>(
    'cloudify_saved_locations',
    []
  );

  // Recent searches list (last 8)
  const [recentSearches, setRecentSearches] = useLocalStorage<GeoLocation[]>(
    'cloudify_recent_searches',
    []
  );

  // Saved locations drawer toggle
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);

  // Theme resolution
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDarkMode = useMemo(() => {
    if (settings.theme === 'system') return systemIsDark;
    return settings.theme === 'dark';
  }, [settings.theme, systemIsDark]);

  // Apply dark class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Weather Hook
  const {
    location,
    weather,
    isLoading,
    error,
    selectLocation,
    selectCoordinates,
    refresh,
  } = useWeather();

  // Geolocation Hook
  const {
    loading: geoLoading,
    error: geoError,
    requestLocation,
    clearError: clearGeoError,
  } = useGeolocation();

  // Handle location selection
  const handleSelectLocation = useCallback(
    (loc: GeoLocation) => {
      selectLocation(loc);
      // Add to recent searches (deduplicated by id, limit 8)
      setRecentSearches((prev) => {
        const filtered = prev.filter((item) => item.id !== loc.id);
        return [loc, ...filtered].slice(0, 8);
      });
    },
    [selectLocation, setRecentSearches]
  );

  // Handle Geolocation request
  const handleRequestGeolocation = useCallback(() => {
    clearGeoError();
    requestLocation((coords: Coordinates) => {
      selectCoordinates(coords);
    });
  }, [clearGeoError, requestLocation, selectCoordinates]);

  // Favorites toggle
  const isCurrentFavorite = useMemo(() => {
    return savedLocations.some((item) => item.id === location.id);
  }, [savedLocations, location.id]);

  const handleToggleFavorite = useCallback(() => {
    setSavedLocations((prev) => {
      if (prev.some((item) => item.id === location.id)) {
        return prev.filter((item) => item.id !== location.id);
      } else {
        return [location, ...prev];
      }
    });
  }, [location, setSavedLocations]);

  const handleRemoveFavorite = useCallback(
    (id: number) => {
      setSavedLocations((prev) => prev.filter((item) => item.id !== id));
    },
    [setSavedLocations]
  );

  const handleClearAllFavorites = useCallback(() => {
    setSavedLocations([]);
  }, [setSavedLocations]);

  const handleClearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, [setRecentSearches]);

  const handleUpdateSettings = useCallback(
    (newSettings: Partial<UserSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    },
    [setSettings]
  );

  const handleThemeChange = useCallback(
    (theme: ThemeMode) => {
      setSettings((prev) => ({ ...prev, theme }));
    },
    [setSettings]
  );

  // Dynamic visual background category
  const weatherCategory = weather?.condition.category || 'clear';
  const isDaytime = weather ? weather.current.isDay : true;

  return (
    <DynamicBackground category={weatherCategory} isDay={isDaytime} isDark={isDarkMode}>
      {/* Sticky Header */}
      <Header
        onSelectLocation={handleSelectLocation}
        onRequestGeolocation={handleRequestGeolocation}
        geoLoading={geoLoading}
        recentSearches={recentSearches}
        onClearRecentSearches={handleClearRecentSearches}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        theme={settings.theme}
        onThemeChange={handleThemeChange}
        onToggleSavedLocations={() => setIsSavedDrawerOpen(true)}
        savedCount={savedLocations.length}
        onRefresh={refresh}
        isRefreshing={isLoading}
      />

      {/* Geolocation Notice / Error Banner */}
      {geoError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 animate-slide-up">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>{geoError}</span>
            </div>
            <button
              type="button"
              onClick={clearGeoError}
              className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-700 dark:text-amber-300"
              aria-label="Dismiss location alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        {isLoading && !weather ? (
          <SkeletonLoader />
        ) : error && !weather ? (
          <ErrorState
            message={error}
            onRetry={refresh}
            onResetDefault={() => handleSelectLocation(DEFAULT_INITIAL_LOCATION)}
          />
        ) : weather ? (
          <>
            {/* Top Hero Current Weather Card */}
            <CurrentWeather
              current={weather.current}
              condition={weather.condition}
              location={location}
              locationTimezone={weather.locationTimezone}
              settings={settings}
              isFavorite={isCurrentFavorite}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Hourly Forecast: 24h Strip & Chart */}
            <HourlyForecast hourly={weather.hourlyNext24h} settings={settings} />

            {/* 7-Day Forecast & Air Quality in 2 columns on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: 7-Day Forecast with expandable rows */}
              <DailyForecast daily={weather.daily7Days} settings={settings} />

              {/* Right Column: Air Quality Card + Quick Tips */}
              <div className="space-y-6">
                <AirQualityCard airQuality={weather.airQuality} />
              </div>
            </div>

            {/* Current Conditions Detailed Metrics Grid */}
            <div className="space-y-3">
              <h2 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 px-1">
                Current Weather Details
              </h2>
              <WeatherDetailsGrid current={weather.current} settings={settings} />
            </div>
          </>
        ) : null}
      </main>

      {/* Saved Locations Slide-Over Drawer */}
      <SavedLocations
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedLocations={savedLocations}
        onSelectLocation={handleSelectLocation}
        onRemoveLocation={handleRemoveFavorite}
        onClearAll={handleClearAllFavorites}
      />

      {/* Footer */}
      <Footer />
    </DynamicBackground>
  );
};
