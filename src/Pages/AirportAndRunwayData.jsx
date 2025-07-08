import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Plane, 
  Navigation, 
  ArrowRight,
  RefreshCw,
  Clock,
  MapPin,
  Search,
  Globe
} from 'lucide-react';

// AirportMap Component (Leaflet Implementation)
const AirportMap = ({ airportLocation }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      // Initialize map
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([airportLocation.lat, airportLocation.lng], 13);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);
      
      // Add marker
      markerRef.current = L.marker([airportLocation.lat, airportLocation.lng])
        .addTo(mapInstance.current)
        .bindPopup(`${airportLocation.name} (${airportLocation.code})`)
        .openPopup();
      
      // Add zoom control with custom position
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
    }
    
    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);
  
  // Update map when airport location changes
  useEffect(() => {
    if (mapInstance.current && markerRef.current) {
      mapInstance.current.setView([airportLocation.lat, airportLocation.lng], 13);
      markerRef.current.setLatLng([airportLocation.lat, airportLocation.lng])
        .setPopupContent(`${airportLocation.name} (${airportLocation.code})`)
        .openPopup();
    }
  }, [airportLocation]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg overflow-hidden"
      style={{ minHeight: '256px' }}
    />
  );
};

// SearchBar Component
const SearchBar = ({ onSearch }) => {
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(term);
    setShowSuggestions(false);
  };

  const handleTermChange = (event) => {
    const value = event.target.value;
    setTerm(value);
    
    if (value.length > 1) {
      const filtered = Object.keys(airportDatabase)
        .filter(key => 
          key.includes(value.toLowerCase()) || 
          airportDatabase[key].name.toLowerCase().includes(value.toLowerCase()) ||
          airportDatabase[key].city.toLowerCase().includes(value.toLowerCase()) ||
          airportDatabase[key].code.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setTerm(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
   <div className="flex justify-center my-6 relative">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl shadow-md border border-white/20 z-20"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search airport (e.g., JFK, London, LAX)..."
            className="pl-10 pr-4 py-2 rounded-xl text-white bg-white/10 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 w-80 transition-all duration-300 border border-white/20"
            value={term}
            onChange={handleTermChange}
            onFocus={() => term.length > 1 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-gray-800/90 backdrop-blur-lg rounded-xl overflow-hidden shadow-lg z-30 border border-white/20">
              {suggestions.map((key, index) => (
                <div 
                  key={index}
                  className="px-4 py-3 hover:bg-gray-700/80 cursor-pointer flex items-center gap-3 transition-colors"
                  onClick={() => handleSuggestionClick(key)}
                >
                  <Plane className="w-4 h-4 text-red-400" />
                  <div>
                    <div className="text-white font-medium">{airportDatabase[key].name}</div>
                    <div className="text-gray-400 text-sm">{airportDatabase[key].city}, {airportDatabase[key].country} ({airportDatabase[key].code})</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-6 py-2 rounded-xl transition-all duration-300 shadow-md hover:shadow-red-400/50 hover:scale-[1.02] flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </form>
    </div>
  );
};


// Sample airport database
const airportDatabase = {
  // Major US airports
  'jfk': { name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', code: 'JFK', lat: 40.6413, lng: -73.7781, elevation: 13, timezone: 'UTC-5' },
  'lax': { name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', code: 'LAX', lat: 34.0522, lng: -118.2437, elevation: 125, timezone: 'UTC-8' },
  'ord': { name: "O'Hare International Airport", city: 'Chicago', country: 'USA', code: 'ORD', lat: 41.9742, lng: -87.9073, elevation: 672, timezone: 'UTC-6' },
  'atl': { name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'USA', code: 'ATL', lat: 33.6407, lng: -84.4277, elevation: 1026, timezone: 'UTC-5' },
  'dfw': { name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'USA', code: 'DFW', lat: 32.8998, lng: -97.0403, elevation: 607, timezone: 'UTC-6' },
  'den': { name: 'Denver International Airport', city: 'Denver', country: 'USA', code: 'DEN', lat: 39.8561, lng: -104.6737, elevation: 5431, timezone: 'UTC-7' },
  'sfo': { name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA', code: 'SFO', lat: 37.6213, lng: -122.3790, elevation: 13, timezone: 'UTC-8' },
  'sea': { name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'USA', code: 'SEA', lat: 47.4502, lng: -122.3088, elevation: 433, timezone: 'UTC-8' },
  'mia': { name: 'Miami International Airport', city: 'Miami', country: 'USA', code: 'MIA', lat: 25.7959, lng: -80.2870, elevation: 8, timezone: 'UTC-5' },
  'lga': { name: 'LaGuardia Airport', city: 'New York', country: 'USA', code: 'LGA', lat: 40.7769, lng: -73.8740, elevation: 21, timezone: 'UTC-5' },
  
  // International airports
  'lhr': { name: 'Heathrow Airport', city: 'London', country: 'UK', code: 'LHR', lat: 51.4700, lng: -0.4543, elevation: 83, timezone: 'UTC+0' },
  'cdg': { name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', code: 'CDG', lat: 48.8566, lng: 2.3522, elevation: 392, timezone: 'UTC+1' },
  'nrt': { name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', code: 'NRT', lat: 35.7720, lng: 140.3929, elevation: 141, timezone: 'UTC+9' },
  'dxb': { name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', code: 'DXB', lat: 25.2532, lng: 55.3657, elevation: 62, timezone: 'UTC+4' },
  'sin': { name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', code: 'SIN', lat: 1.3644, lng: 103.9915, elevation: 22, timezone: 'UTC+8' },
  'fra': { name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', code: 'FRA', lat: 50.0379, lng: 8.5622, elevation: 364, timezone: 'UTC+1' },
  'ams': { name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', code: 'AMS', lat: 52.3105, lng: 4.7683, elevation: -11, timezone: 'UTC+1' },
  'mad': { name: 'Madrid-Barajas Airport', city: 'Madrid', country: 'Spain', code: 'MAD', lat: 40.4983, lng: -3.5676, elevation: 2001, timezone: 'UTC+1' },
  
  // City name mappings
  'new york': { name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', code: 'JFK', lat: 40.6413, lng: -73.7781, elevation: 13, timezone: 'UTC-5' },
  'los angeles': { name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', code: 'LAX', lat: 34.0522, lng: -118.2437, elevation: 125, timezone: 'UTC-8' },
  'chicago': { name: "O'Hare International Airport", city: 'Chicago', country: 'USA', code: 'ORD', lat: 41.9742, lng: -87.9073, elevation: 672, timezone: 'UTC-6' },
  'atlanta': { name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'USA', code: 'ATL', lat: 33.6407, lng: -84.4277, elevation: 1026, timezone: 'UTC-5' },
  'dallas': { name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'USA', code: 'DFW', lat: 32.8998, lng: -97.0403, elevation: 607, timezone: 'UTC-6' },
  'denver': { name: 'Denver International Airport', city: 'Denver', country: 'USA', code: 'DEN', lat: 39.8561, lng: -104.6737, elevation: 5431, timezone: 'UTC-7' },
  'san francisco': { name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA', code: 'SFO', lat: 37.6213, lng: -122.3790, elevation: 13, timezone: 'UTC-8' },
  'seattle': { name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'USA', code: 'SEA', lat: 47.4502, lng: -122.3088, elevation: 433, timezone: 'UTC-8' },
  'miami': { name: 'Miami International Airport', city: 'Miami', country: 'USA', code: 'MIA', lat: 25.7959, lng: -80.2870, elevation: 8, timezone: 'UTC-5' },
  'london': { name: 'Heathrow Airport', city: 'London', country: 'UK', code: 'LHR', lat: 51.4700, lng: -0.4543, elevation: 83, timezone: 'UTC+0' },
  'paris': { name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', code: 'CDG', lat: 48.8566, lng: 2.3522, elevation: 392, timezone: 'UTC+1' },
  'tokyo': { name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', code: 'NRT', lat: 35.7720, lng: 140.3929, elevation: 141, timezone: 'UTC+9' },
  'dubai': { name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', code: 'DXB', lat: 25.2532, lng: 55.3657, elevation: 62, timezone: 'UTC+4' },
  'singapore': { name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', code: 'SIN', lat: 1.3644, lng: 103.9915, elevation: 22, timezone: 'UTC+8' },
  'frankfurt': { name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', code: 'FRA', lat: 50.0379, lng: 8.5622, elevation: 364, timezone: 'UTC+1' },
  'amsterdam': { name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', code: 'AMS', lat: 52.3105, lng: 4.7683, elevation: -11, timezone: 'UTC+1' },
  'madrid': { name: 'Madrid-Barajas Airport', city: 'Madrid', country: 'Spain', code: 'MAD', lat: 40.4983, lng: -3.5676, elevation: 2001, timezone: 'UTC+1' }
};

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
        if (blob) {
          const initialPos = initialPositions[index]

          const xOffset = Math.sin(newScroll / 100 + index * 0.5) * 340
          const yOffset = Math.cos(newScroll / 100 + index * 0.5) * 40

          const x = initialPos.x + xOffset
          const y = initialPos.y + yOffset

          blob.style.transform = `translate(${x}px, ${y}px)`
          blob.style.transition = "transform 1.4s ease-out"
        }
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
          className="absolute top-0 -left-4 md:w-96 md:h-96 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 md:opacity-20"></div>
        <div
          ref={(ref) => (blobRefs.current[1] = ref)}
          className="absolute top-0 -right-4 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 md:opacity-20 hidden sm:block"></div>
        <div
          ref={(ref) => (blobRefs.current[2] = ref)}
          className="absolute -bottom-8 left-[-40%] md:left-20 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 md:opacity-20"></div>
        <div
          ref={(ref) => (blobRefs.current[3] = ref)}
          className="absolute -bottom-10 right-20 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 md:opacity-10 hidden sm:block"></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>
  )
}

const AirportRunwayData = () => {
  const [runwayData, setRunwayData] = useState({
    runwayLength: 3300,
    surfaceCondition: 28,
    activeRunways: 2,
    runwaySlope: 0.2,
    runwaySlopeElevation: 45
  });

  const [airportLocation, setAirportLocation] = useState({
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    country: 'USA',
    code: 'JFK',
    lat: 40.6413,
    lng: -73.7781,
    elevation: 13,
    timezone: 'UTC-5'
  });

  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');

  // Handle airport search
  const handleAirportSearch = (term) => {
    if (!term.trim()) {
      setSearchStatus('Please enter an airport code or city name');
      return;
    }

    const key = term.toLowerCase().trim();
    const airport = airportDatabase[key];

    if (airport) {
      setAirportLocation(airport);
      setSearchStatus(`Found: ${airport.name} (${airport.code})`);
      
      // Generate new runway data for the searched airport
      setRunwayData({
        runwayLength: 2800 + Math.floor(Math.random() * 1500),
        surfaceCondition: 70 + Math.floor(Math.random() * 30),
        activeRunways: 1 + Math.floor(Math.random() * 4),
        runwaySlope: +((Math.random() - 0.5) * 1.2).toFixed(1),
        runwaySlopeElevation: airport.elevation + Math.floor((Math.random() - 0.5) * 100)
      });
      setLastUpdate(new Date());
      
      // Clear status message after 3 seconds
      setTimeout(() => setSearchStatus(''), 3000);
    } else {
      setSearchStatus(`Airport "${term}" not found. Try: JFK, LAX, LHR, CDG, or city names like "London", "Paris"`);
      setTimeout(() => setSearchStatus(''), 5000);
    }
  };

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRunwayData(prev => ({
        ...prev,
        runwayLength: Math.max(2000, prev.runwayLength + Math.floor((Math.random() - 0.5) * 50)),
        surfaceCondition: Math.max(0, Math.min(100, prev.surfaceCondition + Math.floor((Math.random() - 0.5) * 5))),
        activeRunways: Math.max(1, Math.min(4, prev.activeRunways + Math.floor((Math.random() - 0.5) * 2))),
        runwaySlope: +(prev.runwaySlope + (Math.random() - 0.5) * 0.1).toFixed(1),
        runwaySlopeElevation: Math.max(0, prev.runwaySlopeElevation + Math.floor((Math.random() - 0.5) * 10))
      }));
      setLastUpdate(new Date());
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setRunwayData({
        runwayLength: 2800 + Math.floor(Math.random() * 1500),
        surfaceCondition: 60 + Math.floor(Math.random() * 40),
        activeRunways: 1 + Math.floor(Math.random() * 4),
        runwaySlope: +((Math.random() - 0.5) * 1.5).toFixed(1),
        runwaySlopeElevation: airportLocation.elevation + Math.floor((Math.random() - 0.5) * 150)
      });
      setLastUpdate(new Date());
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ef4444] to-[#dc2626] leading-tight mb-4"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              AIRPORT & RUNWAY DATA
            </h1>
          </div>

          {/* Search Bar */}
          <SearchBar onSearch={handleAirportSearch} />

          {/* Search Status */}
          {searchStatus && (
            <div className="mb-6 text-center">
              <div className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${
                searchStatus.includes('Found:') 
                  ? 'bg-green-400/20 text-green-400 border border-green-400/30' 
                  : 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
              }`}>
                {searchStatus}
              </div>
            </div>
          )}

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

          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Main Data Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Plane className="w-6 h-6 text-red-400" />
                  {airportLocation.code} - Runway Data
                </h2>
                <p className="text-gray-300 text-sm">{airportLocation.name}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-red-400" />
                  Runway Status
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-lg">Runway Length</span>
                    <span className="text-white font-bold text-xl">{runwayData.runwayLength} m</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-lg">Surface Condition</span>
                    <span className="text-white font-bold text-xl">{runwayData.surfaceCondition}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-lg">Active Runway(s)</span>
                    <span className="text-white font-bold text-xl">{runwayData.activeRunways}</span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-lg">Runway Slope</span>
                    <span className="text-white font-bold text-xl">
                      {runwayData.runwaySlope > 0 ? '+' : ''}{runwayData.runwaySlope}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-lg">Slope Elevation</span>
                    <span className="text-white font-bold text-xl">{runwayData.runwaySlopeElevation} ft</span>
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="mt-8 space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Runway Length</span>
                    <span>{runwayData.runwayLength}m</span>
                  </div>
                  <div className="w-full bg-red-400/30 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (runwayData.runwayLength / 4500) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Surface Condition</span>
                    <span>{runwayData.surfaceCondition}%</span>
                  </div>
                  <div className="w-full bg-red-400/30 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${runwayData.surfaceCondition}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Component */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-400" />
                  Other Airports Locations
                </h3>
              </div>
              
              {/* Airport Info Card */}
              <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-300">Airport:</span>
                    <span className="text-white font-semibold ml-2 block">{airportLocation.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Code:</span>
                    <span className="text-white font-mono ml-2 text-lg">{airportLocation.code}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">City:</span>
                    <span className="text-white font-semibold ml-2">{airportLocation.city}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Country:</span>
                    <span className="text-white font-semibold ml-2">{airportLocation.country}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Coordinates:</span>
                    <span className="text-white font-mono ml-2 block text-sm">
                      {airportLocation.lat.toFixed(4)}°, {airportLocation.lng.toFixed(4)}°
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Elevation:</span>
                    <span className="text-white font-semibold ml-2">{airportLocation.elevation} ft</span>
                  </div>
                </div>
              </div>
              
              {/* Interactive Map */}
              <div className="relative rounded-lg h-64 border border-white/20 overflow-hidden">
                <AirportMap airportLocation={airportLocation} />
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">Timezone:</span>
                  <span className="text-white font-mono ml-2">{airportLocation.timezone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-red-400" />
                  <span className="text-white font-semibold">International</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-4 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white">Runway Systems: Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
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
        </div>
      </div>
    </div>
  );
};

export default AirportRunwayData;