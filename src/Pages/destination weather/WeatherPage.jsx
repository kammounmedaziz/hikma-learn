import weatherApi from "../../utils/weatherApi";
import React, { useState } from 'react';
import { 
  Droplets,
  Wind,
  Eye,
  Thermometer
} from 'lucide-react';

// Card component (inline)
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// GetGraph component
const GetGraph = ({ forecast3hrs }) => {
  if (!forecast3hrs || forecast3hrs.length === 0) return null;

  // Transform the data for the chart - take every 3 hours for 24 hours (8 data points)
  const chartData = forecast3hrs.slice(0, 8).map((item, index) => ({
    time: item.time || `${index * 3}h`,
    temp: item.temp || item.main?.temp || 20
  }));

  return (
    <div className="w-full h-48 mt-4">
      <div className="text-sm text-gray-400 mb-2">Temperature Trend (Next 24 Hours)</div>
      <div className="w-full h-full bg-gray-800/30 rounded-lg p-4 flex items-end justify-between gap-2">
        {chartData.map((point, index) => (
          <div key={index} className="flex flex-col items-center gap-2 flex-1">
            <div className="text-xs text-white font-medium">{point.temp}°</div>
            <div 
              className="w-full bg-gradient-to-t from-cyan-500 to-blue-400 rounded-t-sm min-h-[20px]"
              style={{ 
                height: `${Math.max(20, (point.temp / Math.max(...chartData.map(d => d.temp))) * 80)}px` 
              }}
            ></div>
            <div className="text-xs text-gray-400">{point.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// WeeklyData component
const WeeklyData = ({ forecastWeekly }) => {
  if (!forecastWeekly || forecastWeekly.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-white mb-4">7-Day Forecast</h3>
      <div className="space-y-3">
        {forecastWeekly.map((forecast, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-600/50 hover:bg-gray-800/50 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="text-2xl">{forecast.icon || '🌤️'}</div>
              <div>
                <p className="text-white font-semibold">{forecast.weekday || forecast.day}</p>
                <p className="text-sm text-gray-400">{forecast.date}</p>
              </div>
              <p className="text-sm text-gray-300 capitalize ml-4">{forecast.condition || forecast.description}</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-white font-semibold">{forecast.max || forecast.highTemp}° | {forecast.min || forecast.lowTemp}°</p>
              </div>
              {(forecast.humidity || forecast.windSpeed) && (
                <div className="text-right text-xs text-gray-400">
                  {forecast.humidity && <p>💧 {forecast.humidity}%</p>}
                  {forecast.windSpeed && <p>💨 {forecast.windSpeed}km/h</p>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// TodayData component
const TodayData = ({ 
  city, 
  country, 
  weekday, 
  time, 
  weatherDescription, 
  temp, 
  weatherIcon,
  humidity,
  windSpeed,
  visibility,
  feelsLike,
  forecast3hrs,
  forecastWeekly 
}) => {
  const getWeatherIcon = (condition) => {
    const iconMap = {
      'sunny': '☀️',
      'clear sky': '🌤️',
      'partly cloudy': '⛅',
      'cloudy': '☁️',
      'light rain': '🌦️',
      'rain': '🌧️',
      'thunderstorm': '⛈️',
      'snow': '❄️'
    };
    return iconMap[condition?.toLowerCase()] || '🌤️';
  };

  return (
    <Card className="p-6 bg-gray-900/50 backdrop-blur-lg border-gray-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Weather Info */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {city}, {country}
            </h2>
            <p className="text-gray-400 capitalize">{weatherDescription}</p>
            <p className="text-sm text-gray-500">{weekday} • {time}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-6xl">
              {getWeatherIcon(weatherDescription)}
            </div>
            <div>
              <span className="text-5xl font-bold text-white">{temp}°C</span>
              {feelsLike && <p className="text-gray-400">Feels like {feelsLike}°C</p>}
            </div>
          </div>

          {/* Graph Component */}
          <GetGraph forecast3hrs={forecast3hrs} />
        </div>

        {/* Weather Details */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Details</h3>
          <div className="grid grid-cols-1 gap-3 text-sm">
            {humidity && (
              <div className="p-3 bg-gray-800/50 rounded-lg flex items-center gap-2">
                <Droplets size={16} className="text-cyan-400" />
                <div>
                  <p className="text-gray-400">Humidity</p>
                  <p className="text-white font-semibold">{humidity}%</p>
                </div>
              </div>
            )}
            {windSpeed && (
              <div className="p-3 bg-gray-800/50 rounded-lg flex items-center gap-2">
                <Wind size={16} className="text-green-400" />
                <div>
                  <p className="text-gray-400">Wind</p>
                  <p className="text-white font-semibold">{windSpeed} km/h</p>
                </div>
              </div>
            )}
            {visibility && (
              <div className="p-3 bg-gray-800/50 rounded-lg flex items-center gap-2">
                <Eye size={16} className="text-purple-400" />
                <div>
                  <p className="text-gray-400">Visibility</p>
                  <p className="text-white font-semibold">{visibility} km</p>
                </div>
              </div>
            )}
            {feelsLike && (
              <div className="p-3 bg-gray-800/50 rounded-lg flex items-center gap-2">
                <Thermometer size={16} className="text-orange-400" />
                <div>
                  <p className="text-gray-400">Feels Like</p>
                  <p className="text-white font-semibold">{feelsLike}°C</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Forecast */}
      <WeeklyData forecastWeekly={forecastWeekly} />
    </Card>
  );
};

// Main WeatherPage component
const WeatherPage = () => {
  const [state, setState] = useState({
    firstTime: true,
    city: "",
    weekday: "",
    temp: "",
    weatherDescription: "",
    weatherIcon: "",
    country: "",
    timezone: "",
    time: "",
    forecast3hrs: [],
    forecastWeekly: [],
    loading: false,
    error: null,
    humidity: "",
    windSpeed: "",
    visibility: "",
    feelsLike: ""
  });

  const [searchInput, setSearchInput] = useState('');

  // You'll need to import your weatherApi utility here
  // import weatherApi from "../../utils/weatherApi";

  // Real weather API call function
  const fetchWeatherData = async (city) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!city || city.trim().length === 0) {
        throw new Error('Please enter a city name');
      }

      // Replace the throw error with:
      const currentWeatherData = await weatherApi.getCurrentWeather(city);
      const hourlyForecastData = await weatherApi.getHourlyForecast(city);  
      const weeklyForecastData = await weatherApi.getWeeklyForecast(city);

// Then uncomment and use the setState block that's already prepared
      // For now, throwing an error to show you need to implement the real API calls
      throw new Error('Please implement your actual weatherApi calls in fetchWeatherData function');

      // Once you have real API data, update the state like this:
      
      setState(prev => ({
        ...prev,
        firstTime: false,
        city: currentWeatherData.name,
        country: currentWeatherData.sys.country,
        temp: Math.round(currentWeatherData.main.temp),
        feelsLike: Math.round(currentWeatherData.main.feels_like),
        humidity: currentWeatherData.main.humidity,
        windSpeed: Math.round(currentWeatherData.wind.speed),
        visibility: currentWeatherData.visibility ? Math.round(currentWeatherData.visibility / 1000) : null,
        weatherDescription: currentWeatherData.weather[0].description,
        weatherIcon: currentWeatherData.weather[0].icon,
        loading: false,
        time: new Date().toLocaleTimeString(),
        weekday: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        forecast3hrs: hourlyForecastData,
        forecastWeekly: weeklyForecastData
      }));
      */
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        firstTime: false
      }));
    }
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      fetchWeatherData(searchInput.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
          Weather Forecast
        </h1>
        <p className="text-gray-400">Get current weather information and forecasts for any city</p>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter city name..."
            className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
            disabled={state.loading}
          />
          <button
            onClick={handleSearch}
            disabled={state.loading || !searchInput.trim()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg backdrop-blur-sm">
          <p className="text-red-400">⚠️ {state.error}</p>
          <p className="text-sm text-gray-400 mt-1">
            Try searching for cities like: London, Paris, Tokyo, New York, Sydney
          </p>
        </div>
      )}

      {/* Weather Display using TodayData component */}
      {!state.firstTime && !state.error && state.city && (
        <TodayData
          city={state.city}
          country={state.country}
          weekday={state.weekday}
          time={state.time}
          weatherDescription={state.weatherDescription}
          temp={state.temp}
          weatherIcon={state.weatherIcon}
          humidity={state.humidity}
          windSpeed={state.windSpeed}
          visibility={state.visibility}
          feelsLike={state.feelsLike}
          forecast3hrs={state.forecast3hrs}
          forecastWeekly={state.forecastWeekly}
        />
      )}

      {/* First Time Display */}
      {state.firstTime && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌤️</div>
          <h3 className="text-xl font-semibold text-white mb-2">Search for Weather</h3>
          <p className="text-gray-400 mb-4">Enter a city name to get current weather information and forecasts</p>
          <div className="text-sm text-gray-500">
            <p>Try: London, Paris, Tokyo, New York, Sydney, Mumbai, Cairo</p>
            <p className="mt-2">Import your weatherApi and implement the API calls in fetchWeatherData function</p>
          </div>
        </div>
      )}

      {/* Loading Display */}
      {state.loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-300">Loading weather data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherPage;