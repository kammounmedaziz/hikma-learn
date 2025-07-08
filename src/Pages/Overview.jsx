import React, { useState, useEffect, useRef } from 'react';
import { Cloud, CloudRain, Sun, Wind, Navigation, Clock, Gauge, Mountain, Sparkles } from 'lucide-react';
import SearchBar from '../Components/SearchBar/SearchBar'; // Import the SearchBar component

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

const FlightOverviewPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [flightData, setFlightData] = useState({
    destination: 'LAX - Los Angeles',
    altitude: 35000,
    groundSpeed: 485,
    eta: '14:30',
    weather: {
      temperature: 22,
      condition: 'partly-cloudy',
      windSpeed: 12,
      visibility: 8.5
    }
  });
  
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Sample flight data for demonstration
  const sampleFlights = [
    { id: 1, code: 'LAX', name: 'Los Angeles International Airport' },
    { id: 2, code: 'JFK', name: 'John F. Kennedy International Airport' },
    { id: 3, code: 'LHR', name: 'London Heathrow Airport' },
    { id: 4, code: 'CDG', name: 'Charles de Gaulle Airport' },
    { id: 5, code: 'DXB', name: 'Dubai International Airport' },
    { id: 6, code: 'SIN', name: 'Singapore Changi Airport' },
    { id: 7, code: 'HND', name: 'Haneda Airport' },
    { id: 8, code: 'FRA', name: 'Frankfurt Airport' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Simulate real-time flight data updates
    const dataTimer = setInterval(() => {
      setFlightData(prev => ({
        ...prev,
        altitude: prev.altitude + (Math.random() - 0.5) * 100,
        groundSpeed: prev.groundSpeed + (Math.random() - 0.5) * 10,
        weather: {
          ...prev.weather,
          windSpeed: prev.weather.windSpeed + (Math.random() - 0.5) * 2
        }
      }));
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(dataTimer);
    };
  }, []);

  // Handle search functionality
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredFlights([]);
      setShowSearchResults(false);
      return;
    }
    
    const filtered = sampleFlights.filter(flight => 
      flight.code.toLowerCase().includes(term.toLowerCase()) || 
      flight.name.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredFlights(filtered);
    setShowSearchResults(true);
  };

  // Handle flight selection
  const handleFlightSelect = (flight) => {
    setFlightData({
      ...flightData,
      destination: `${flight.code} - ${flight.name.split(' ')[0]}`
    });
    setShowSearchResults(false);
    setSearchTerm('');
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-8 h-8 text-yellow-400" />;
      case 'rainy': return <CloudRain className="w-8 h-8 text-blue-400" />;
      case 'partly-cloudy': return <Cloud className="w-8 h-8 text-gray-300" />;
      default: return <Sun className="w-8 h-8 text-yellow-400" />;
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
              FLIGHT{' '}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                OVERVIEW
              </span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#f1636f]" />
              Live Flight Data Dashboard edited
              <Sparkles className="w-5 h-5 text-[#f1636f]" />
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <SearchBar onSearch={handleSearch} />
              
              {/* Search Results Dropdown */}
              {showSearchResults && filteredFlights.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 z-20">
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg overflow-hidden">
                    {filteredFlights.map(flight => (
                      <div 
                        key={flight.id}
                        className="p-4 hover:bg-white/20 cursor-pointer transition-colors duration-200 flex items-center gap-3"
                        onClick={() => handleFlightSelect(flight)}
                      >
                        <div className="bg-gradient-to-r from-red-400 to-red-600 w-10 h-10 rounded-lg flex items-center justify-center">
                          <span className="font-bold text-white">{flight.code}</span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{flight.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-gray-400 mt-4">
              Current Time: {currentTime.toLocaleTimeString()}
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Weather Widget */}
            <Widget 
              title="Weather Conditions"
              className="lg:col-span-2"
              icon={<Cloud className="w-5 h-5 text-red-400" />}
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {getWeatherIcon(flightData.weather.condition)}
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {flightData.weather.temperature}°C
                      </p>
                      <p className="text-gray-300 capitalize">
                        {flightData.weather.condition.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">Wind Speed:</span>
                    <span className="font-semibold text-white">{flightData.weather.windSpeed.toFixed(1)} kt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-sm text-gray-300">Visibility:</span>
                    <span className="font-semibold text-white">{flightData.weather.visibility} km</span>
                  </div>
                </div>
              </div>
            </Widget>

            {/* Destination Widget */}
            <Widget 
              title="Destination"
              icon={<Navigation className="w-5 h-5 text-red-400" />}
            >
              <div className="text-center space-y-3">
                <div className="bg-gradient-to-r from-red-400/20 to-red-500/20 rounded-lg p-4 border border-red-400/30">
                  <p className="text-2xl font-bold text-red-400">
                    {flightData.destination.split(' - ')[0]}
                  </p>
                  <p className="text-red-300">
                    {flightData.destination.split(' - ')[1]}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  On Course
                </div>
              </div>
            </Widget>

            {/* Altitude Widget */}
            <Widget 
              title="Altitude"
              icon={<Mountain className="w-5 h-5 text-red-400" />}
            >
              <div className="text-center space-y-3">
                <p className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                  {Math.round(flightData.altitude).toLocaleString()}
                </p>
                <p className="text-red-300 font-medium">feet</p>
                <div className="bg-red-400/20 rounded-lg p-3 border border-red-400/30">
                  <div className="w-full bg-red-400/30 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(flightData.altitude / 40000) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-red-300 mt-1">Cruise Altitude</p>
                </div>
              </div>
            </Widget>

            {/* Ground Speed Widget */}
            <Widget 
              title="Ground Speed"
              icon={<Gauge className="w-5 h-5 text-red-400" />}
            >
              <div className="text-center space-y-3">
                <p className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                  {Math.round(flightData.groundSpeed)}
                </p>
                <p className="text-red-300 font-medium">knots</p>
                <div className="bg-red-400/20 rounded-lg p-3 border border-red-400/30">
                  <div className="flex items-center justify-between text-xs text-red-300">
                    <span>0</span>
                    <span>500</span>
                  </div>
                  <div className="w-full bg-red-400/30 rounded-full h-2 mt-1">
                    <div 
                      className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(flightData.groundSpeed / 500) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Widget>

            {/* ETA Widget */}
            <Widget 
              title="Estimated Arrival"
              icon={<Clock className="w-5 h-5 text-red-400" />}
            >
              <div className="text-center space-y-3">
                <p className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                  {flightData.eta}
                </p>
                <p className="text-red-300 font-medium">Local Time</p>
                <div className="bg-red-400/20 rounded-lg p-3 border border-red-400/30">
                  <p className="text-sm text-red-300">
                    Time Remaining
                  </p>
                  <p className="text-lg font-semibold text-red-400">
                    2h 45m
                  </p>
                </div>
              </div>
            </Widget>
          </div>

          {/* Status Bar */}
          <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-4 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white">Systems Normal</span>
                </div>
                <div className="text-sm text-gray-300">
                  Last Updated: {currentTime.toLocaleTimeString()}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>Flight Status:</span>
                <span className="px-3 py-1 bg-gradient-to-r from-red-400/20 to-red-500/20 text-red-400 rounded-full font-medium border border-red-400/30">
                  En Route
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

export default FlightOverviewPage;