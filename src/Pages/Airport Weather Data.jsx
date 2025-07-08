import  { useState, useEffect, useRef } from 'react';
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
  CloudRain
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

        // Calculating movement in both X and Y direction
        const xOffset = Math.sin(newScroll / 100 + index * 0.5) * 340 // Horizontal movement
        const yOffset = Math.cos(newScroll / 100 + index * 0.5) * 40 // Vertical movement

        const x = initialPos.x + xOffset
        const y = initialPos.y + yOffset

        // Apply transformation with smooth transition
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
    temperature: 24.5,
    humidity: 68,
    pressure: 1013.2,
    windSpeed: 12.3,
    windDirection: 'NW',
    visibility: 8.5,
    uvIndex: 6,
    dewPoint: 18.2,
    precipitation: 0.0,
    cloudCover: 45,
    airQuality: 85,
    soilMoisture: 32
  });

  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWeatherData(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 0.5,
        humidity: Math.max(0, Math.min(100, prev.humidity + (Math.random() - 0.5) * 2)),
        pressure: prev.pressure + (Math.random() - 0.5) * 0.3,
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 1),
        visibility: Math.max(0, prev.visibility + (Math.random() - 0.5) * 0.2),
        uvIndex: Math.max(0, Math.min(11, prev.uvIndex + (Math.random() - 0.5) * 0.3)),
        dewPoint: prev.dewPoint + (Math.random() - 0.5) * 0.3,
        cloudCover: Math.max(0, Math.min(100, prev.cloudCover + (Math.random() - 0.5) * 3)),
        airQuality: Math.max(0, Math.min(100, prev.airQuality + (Math.random() - 0.5) * 2)),
        soilMoisture: Math.max(0, Math.min(100, prev.soilMoisture + (Math.random() - 0.5) * 1))
      }));
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setWeatherData(prev => ({
        ...prev,
        temperature: 20 + Math.random() * 15,
        humidity: 40 + Math.random() * 40,
        pressure: 1000 + Math.random() * 30,
        windSpeed: Math.random() * 25,
        visibility: 3 + Math.random() * 12,
        uvIndex: Math.random() * 11,
        dewPoint: 10 + Math.random() * 15,
        precipitation: Math.random() * 5,
        cloudCover: Math.random() * 100,
        airQuality: 60 + Math.random() * 40,
        soilMoisture: 20 + Math.random() * 40
      }));
      setLastUpdate(new Date());
      setIsLoading(false);
    }, 1000);
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
                style={{ width: `${progress}%` }}
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
              Live Meteorological Data Dashboard
              <Sparkles className="w-5 h-5 text-[#f1636f]" />
            </p>
            <p className="text-gray-400">
              Current Time: {currentTime.toLocaleTimeString()}
            </p>
          </div>

          {/* Action Bar */}
          <div className="mb-8 flex items-center justify-center">
            <div className="flex items-center gap-4">
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
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white">Weather Sensors: Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white">Data Transmission: Active</span>
                </div>
                <div className="text-sm text-gray-300">
                  Last Updated: {lastUpdate.toLocaleTimeString()}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>System Status:</span>
                <span className="px-3 py-1 bg-gradient-to-r from-red-400/20 to-red-500/20 text-red-400 rounded-full font-medium border border-red-400/30">
                  Operational
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