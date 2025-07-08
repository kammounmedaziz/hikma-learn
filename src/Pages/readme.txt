after a research i found this code as a solution to get the data from the sensors
for the page airport weather data
after completing the hardware part we can test using this code 
and make the changes needed
























import React, { useState, useEffect, useRef } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Gauge, 
  Cloud, 
  Sun, 
  Activity,
  MapPin,
  Clock,
  RefreshCw,
  Sparkles,
  CloudRain,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const AnimatedBackground = () => {
  const blobRefs = useRef([])
  const initialPositions = [
    { x: -4, y: 0 },
    { x: -4, y: 0 },
    { x: 20, y: -8 },
    { x: 20, y: -8 },
  ]

  useEffect(() => {
    let requestId

    const handleScroll = () => {
      const newScroll = window.pageYOffset

      blobRefs.current.forEach((blob, index) => {
        const initialPos = initialPositions[index]

        const xOffset = Math.sin(newScroll / 100 + index * 0.5) * 340
        const yOffset = Math.cos(newScroll / 100 + index * 0.5) * 40

        const x = initialPos.x + xOffset
        const y = initialPos.y + yOffset

        blob.style.transform = `translate(${x}px, ${y}px)`
        blob.style.transition = "transform 1.4s ease-out"
      })

      requestId = requestAnimationFrame(handleScroll)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(requestId)
    }
  }, [])

  return (
    <div className="fixed inset-0 animated-bg">
      <div className="absolute inset-0">
        <div
          ref={(ref) => (blobRefs.current[0] = ref)}
          className="absolute top-0 -left-4 md:w-96 md:h-96 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 md:opacity-20 "></div>
        <div
          ref={(ref) => (blobRefs.current[1] = ref)}
          className="absolute top-0 -right-4 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 md:opacity-20 hidden sm:block"></div>
        <div
          ref={(ref) => (blobRefs.current[2] = ref)}
          className="absolute -bottom-8 left-[-40%] md:left-20 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 md:opacity-20 "></div>
          <div
          ref={(ref) => (blobRefs.current[3] = ref)}
          className="absolute -bottom-10 right-20 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 md:opacity-10 hidden sm:block"></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>
  )
}

const WeatherStatsDashboard = () => {
  const [weatherData, setWeatherData] = useState({
    temperature: 0,
    humidity: 0,
    pressure: 0,
    windSpeed: 0,
    windDirection: 'N',
    visibility: 0,
    uvIndex: 0,
    dewPoint: 0,
    precipitation: 0,
    cloudCover: 0,
    airQuality: 0,
    soilMoisture: 0
  });

  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connected', 'error', 'connecting'
  const [error, setError] = useState(null);

  // Configuration - Update these URLs to match your sensor endpoints
  const SENSOR_CONFIG = {
    // Option 1: Single endpoint that returns all sensor data
    singleEndpoint: 'http://192.168.1.100/api/weather', // Replace with your sensor IP
    
    // Option 2: Multiple endpoints for different sensors
    endpoints: {
      temperature: 'http://192.168.1.100/api/temperature',
      humidity: 'http://192.168.1.100/api/humidity',
      pressure: 'http://192.168.1.100/api/pressure',
      wind: 'http://192.168.1.100/api/wind',
      // Add more endpoints as needed
    },
    
    // Option 3: Serial/WebSocket connection
    websocketUrl: 'ws://192.168.1.100:8080',
    
    // Update interval in milliseconds
    updateInterval: 5000
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch data from sensors
  const fetchSensorData = async () => {
    try {
      setError(null);
      
      // METHOD 1: Single API endpoint
      const response = await fetch(SENSOR_CONFIG.singleEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Map the sensor data to your state structure
      // Adjust these mappings based on your sensor data format
      setWeatherData({
        temperature: data.temperature || 0,
        humidity: data.humidity || 0,
        pressure: data.pressure || 0,
        windSpeed: data.windSpeed || data.wind_speed || 0,
        windDirection: data.windDirection || data.wind_direction || 'N',
        visibility: data.visibility || 0,
        uvIndex: data.uvIndex || data.uv_index || 0,
        dewPoint: data.dewPoint || data.dew_point || 0,
        precipitation: data.precipitation || data.rain || 0,
        cloudCover: data.cloudCover || data.cloud_cover || 0,
        airQuality: data.airQuality || data.air_quality || 0,
        soilMoisture: data.soilMoisture || data.soil_moisture || 0
      });

      setLastUpdate(new Date());
      setConnectionStatus('connected');
      
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError(err.message);
      setConnectionStatus('error');
    }
  };

  // Alternative method: Fetch from multiple endpoints
  const fetchMultipleEndpoints = async () => {
    try {
      setError(null);
      
      const promises = Object.entries(SENSOR_CONFIG.endpoints).map(async ([key, url]) => {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(5000)
        });
        const data = await response.json();
        return { [key]: data.value || data[key] || 0 };
      });

      const results = await Promise.all(promises);
      const combinedData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      
      setWeatherData(prev => ({ ...prev, ...combinedData }));
      setLastUpdate(new Date());
      setConnectionStatus('connected');
      
    } catch (err) {
      console.error('Error fetching multiple endpoints:', err);
      setError(err.message);
      setConnectionStatus('error');
    }
  };

  // WebSocket connection (for real-time streaming)
  const setupWebSocket = () => {
    try {
      const ws = new WebSocket(SENSOR_CONFIG.websocketUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setConnectionStatus('connected');
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setWeatherData(prev => ({ ...prev, ...data }));
        setLastUpdate(new Date());
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        setError('WebSocket connection failed');
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setConnectionStatus('error');
        // Attempt to reconnect after 5 seconds
        setTimeout(setupWebSocket, 5000);
      };
      
      return ws;
    } catch (err) {
      console.error('WebSocket setup error:', err);
      setConnectionStatus('error');
      setError('Failed to establish WebSocket connection');
    }
  };

  // Set up automatic data fetching
  useEffect(() => {
    // Initial fetch
    fetchSensorData();
    
    // Set up interval for periodic updates
    const interval = setInterval(() => {
      fetchSensorData();
    }, SENSOR_CONFIG.updateInterval);

    // Uncomment the line below if you want to use WebSocket instead
    // const ws = setupWebSocket();

    return () => {
      clearInterval(interval);
      // if (ws) ws.close();
    };
  }, []);

  // Manual refresh function
  const refreshData = async () => {
    setIsLoading(true);
    await fetchSensorData();
    setIsLoading(false);
  };

  // Connection status indicator
  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'connecting':
        return <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const Widget = ({ title, children, className = "", icon }) => (
    <div className={`bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, unit, description, progress }) => (
    <Widget 
      title={title}
      icon={<Icon className="w-5 h-5 text-red-400" />}
    >
      <div className="text-center space-y-3">
        <p className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
          {typeof value === 'number' ? value.toFixed(1) : value}
        </p>
        <p className="text-red-300 font-medium">{unit}</p>
        <div className="bg-red-400/20 rounded-lg p-3 border border-red-400/30">
          {progress && (
            <div className="w-full bg-red-400/30 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
          )}
          <p className="text-sm text-red-300">{description}</p>
        </div>
      </div>
    </Widget>
  );

  const getAirQualityStatus = (aqi) => {
    if (aqi >= 80) return { status: 'Good', color: 'text-green-400' };
    if (aqi >= 60) return { status: 'Moderate', color: 'text-yellow-400' };
    if (aqi >= 40) return { status: 'Poor', color: 'text-orange-400' };
    return { status: 'Hazardous', color: 'text-red-400' };
  };

  const getWindDirectionDegrees = (direction) => {
    const directions = {
      'N': 0, 'NE': 45, 'E': 90, 'SE': 135,
      'S': 180, 'SW': 225, 'W': 270, 'NW': 315
    };
    return directions[direction] || 0;
  };

  const getWeatherCondition = () => {
    if (weatherData.precipitation > 0.5) return 'rainy';
    if (weatherData.cloudCover > 70) return 'cloudy';
    if (weatherData.cloudCover > 30) return 'partly-cloudy';
    return 'sunny';
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-8 h-8 text-yellow-400" />;
      case 'rainy': return <CloudRain className="w-8 h-8 text-blue-400" />;
      case 'cloudy': 
      case 'partly-cloudy': return <Cloud className="w-8 h-8 text-gray-300" />;
      default: return <Sun className="w-8 h-8 text-yellow-400" />;
    }
  };

  const airQuality = getAirQualityStatus(weatherData.airQuality);
  const weatherCondition = getWeatherCondition();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f1636f] to-[#a855f7] leading-tight mb-4"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              WEATHER{' '}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                STATION
              </span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#f1636f]" />
              Live Sensor Data Dashboard
              <Sparkles className="w-5 h-5 text-[#f1636f]" />
            </p>
            <p className="text-gray-400">
              Current Time: {currentTime.toLocaleTimeString()}
            </p>
          </div>

          {/* Connection Status and Error Display */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Connection Error: {error}</span>
              </div>
              <p className="text-sm text-red-300 mt-2">
                Check your sensor connection and network settings
              </p>
            </div>
          )}

          {/* Action Bar */}
          <div className="mb-8 flex items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-gray-300 gap-2">
                {getConnectionStatusIcon()}
                <span>Status: {connectionStatus}</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Clock className="w-4 h-4 mr-1" />
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-xl hover:from-red-500 hover:to-red-600 disabled:opacity-50 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>
          </div>

          {/* Current Weather Overview */}
          <Widget 
            title="Current Weather Conditions"
            className="mb-8 lg:col-span-2"
            icon={<Cloud className="w-5 h-5 text-red-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {getWeatherIcon(weatherCondition)}
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {weatherData.temperature.toFixed(1)}°C
                    </p>
                    <p className="text-gray-300 capitalize">
                      {weatherCondition.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Wind Speed:</span>
                  <span className="font-semibold text-white">{weatherData.windSpeed.toFixed(1)} km/h</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-400 animate-pulse"></div>
                  <span className="text-sm text-gray-300">Visibility:</span>
                  <span className="font-semibold text-white">{weatherData.visibility.toFixed(1)} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Air Quality:</span>
                  <span className={`font-semibold ${airQuality.color}`}>{airQuality.status}</span>
                </div>
              </div>
            </div>
          </Widget>

          {/* Main Weather Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Thermometer}
              title="Temperature"
              value={weatherData.temperature}
              unit="°C"
              description="Current air temperature"
              progress={(weatherData.temperature + 10) / 50 * 100}
            />
            
            <StatCard
              icon={Droplets}
              title="Humidity"
              value={weatherData.humidity}
              unit="%"
              description="Relative humidity"
              progress={weatherData.humidity}
            />
            
            <StatCard
              icon={Gauge}
              title="Pressure"
              value={weatherData.pressure}
              unit="hPa"
              description="Atmospheric pressure"
              progress={(weatherData.pressure - 980) / 60 * 100}
            />
            
            <StatCard
              icon={Wind}
              title="Wind Speed"
              value={weatherData.windSpeed}
              unit="km/h"
              description={`Direction: ${weatherData.windDirection}`}
              progress={weatherData.windSpeed / 50 * 100}
            />
            
            <StatCard
              icon={Eye}
              title="Visibility"
              value={weatherData.visibility}
              unit="km"
              description="Horizontal visibility"
              progress={weatherData.visibility / 15 * 100}
            />
            
            <StatCard
              icon={Sun}
              title="UV Index"
              value={weatherData.uvIndex}
              unit=""
              description="Ultraviolet radiation"
              progress={weatherData.uvIndex / 11 * 100}
            />
            
            <StatCard
              icon={Droplets}
              title="Dew Point"
              value={weatherData.dewPoint}
              unit="°C"
              description="Dew point temperature"
              progress={(weatherData.dewPoint + 10) / 40 * 100}
            />
            
            <StatCard
              icon={Cloud}
              title="Cloud Cover"
              value={weatherData.cloudCover}
              unit="%"
              description="Sky coverage"
              progress={weatherData.cloudCover}
            />
          </div>

          {/* Additional Environmental Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Activity}
              title="Air Quality"
              value={weatherData.airQuality}
              unit="AQI"
              description={`Status: ${airQuality.status}`}
              progress={weatherData.airQuality}
            />
            
            <StatCard
              icon={Droplets}
              title="Precipitation"
              value={weatherData.precipitation}
              unit="mm/h"
              description="Current rainfall rate"
              progress={weatherData.precipitation / 10 * 100}
            />
            
            <StatCard
              icon={Activity}
              title="Soil Moisture"
              value={weatherData.soilMoisture}
              unit="%"
              description="Ground sensor reading"
              progress={weatherData.soilMoisture}
            />
            
            {/* Wind Direction Compass */}
            <Widget 
              title="Wind Direction"
              icon={<Wind className="w-5 h-5 text-red-400" />}
            >
              <div className="flex items-center justify-center">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-2 border-red-400/30 bg-red-400/10"></div>
                  <div className="absolute inset-2 rounded-full bg-red-400/20 flex items-center justify-center">
                    <div 
                      className="w-1 h-8 bg-gradient-to-t from-red-400 to-red-500 rounded-full transform origin-bottom transition-transform duration-300"
                      style={{ transform: `rotate(${getWindDirectionDegrees(weatherData.windDirection)}deg)` }}
                    ></div>
                  </div>
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs font-medium text-red-400">N</div>
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-medium text-red-400">S</div>
                  <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-xs font-medium text-red-400">W</div>
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs font-medium text-red-400">E</div>
                </div>
              </div>
              <p className="text-center text-2xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent mt-2">{weatherData.windDirection}</p>
              <p className="text-center text-sm text-red-300">Current direction</p>
            </Widget>
          </div>

          {/* Status Bar */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-4 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getConnectionStatusIcon()}
                  <span className="text-sm font-medium text-white">
                    Sensors: {connectionStatus === 'connected' ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                  <span className="text-sm font-medium text-white">
                    Data Transmission: {connectionStatus === 'connected' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-sm text-gray-300">
                  Last Updated: {lastUpdate.toLocaleTimeString()}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>System Status:</span>
                <span className={`px-3 py-1 rounded-full font-medium border ${
                  connectionStatus === 'connected' 
                    ? 'bg-gradient-to-r from-green-400/20 to-green-500/20 text-green-400 border-green-400/30'
                    : 'bg-gradient-to-r from-red-400/20 to-red-500/20 text-red-400 border-red-400/30'
                }`}>
                  {connectionStatus === 'connected' ? 'Operational' : 'Error'}
                </span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center justify-center gap-8 text-gray-500">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#f1636f]"></div>
              <div className="w-2 h-2 bg-[#f1636f] rounded-full animate-pulse"></div>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#a855f7]"></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin-slower {
          to { transform: rotate(360deg); }
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s infinite;
        }
        .animate-spin-slower {
          animation: spin-slower 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default WeatherStatsDashboard;