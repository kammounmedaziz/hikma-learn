import React, { useState, useEffect, useRef } from 'react';
import { Cloud, CloudRain, Sun, Wind, Navigation, Clock, Gauge, Mountain, Sparkles, Plane, Search } from 'lucide-react';

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
  }, [initialPositions])

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
  const [activeTab, setActiveTab] = useState('departures');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAirport, setSelectedAirport] = useState('JFK');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock airport data
  const airports = [
    { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
    { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
    { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK' },
    { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
    { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan' },
    { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
    { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore' },
    { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Generate mock flight data
  const generateFlightData = (type) => {
    const airlines = ['American Airlines', 'Delta Air Lines', 'United Airlines', 'Emirates', 'Lufthansa', 'British Airways', 'Air France', 'Singapore Airlines'];
    const aircraftTypes = ['Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A350', 'Boeing 787', 'Airbus A380', 'Boeing 747', 'Embraer E190'];
    const gates = ['A1', 'A2', 'B3', 'B4', 'C5', 'C6', 'D7', 'D8', 'E9', 'E10'];
    const statuses = ['On Time', 'Delayed', 'Boarding', 'Departed', 'Arrived', 'Cancelled'];
    const statusColors = {
      'On Time': 'text-green-400',
      'Delayed': 'text-yellow-400',
      'Boarding': 'text-red-400',
      'Departed': 'text-gray-400',
      'Arrived': 'text-green-400',
      'Cancelled': 'text-red-500'
    };

    const flightData = [];
    const now = new Date();
    
    for (let i = 0; i < 20; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const flightNumber = `${airline.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`;
      const destination = airports[Math.floor(Math.random() * airports.length)];
      const scheduledTime = new Date(now.getTime() + (Math.random() * 24 * 60 * 60 * 1000));
      const actualTime = new Date(scheduledTime.getTime() + (Math.random() - 0.5) * 60 * 60 * 1000);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      flightData.push({
        id: i + 1,
        flightNumber,
        airline,
        destination: type === 'departures' ? destination : airports.find(a => a.code === selectedAirport),
        origin: type === 'arrivals' ? destination : airports.find(a => a.code === selectedAirport),
        scheduledTime: scheduledTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        actualTime: actualTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status,
        statusColor: statusColors[status],
        gate: gates[Math.floor(Math.random() * gates.length)],
        aircraft: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
        terminal: Math.floor(Math.random() * 3) + 1,
        delay: status === 'Delayed' ? Math.floor(Math.random() * 120) + 15 : 0
      });
    }
    
    return flightData.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  };

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setFlights(generateFlightData(activeTab));
      setLoading(false);
    }, 1000);
  }, [activeTab, selectedAirport]);

  const filteredFlights = flights.filter(flight => 
    flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flight.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (activeTab === 'departures' ? flight.destination.city : flight.origin.city).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    const icons = {
      'On Time': '✅',
      'Delayed': '⏰',
      'Boarding': '🚪',
      'Departed': '✈️',
      'Arrived': '🛬',
      'Cancelled': '❌'
    };
    return icons[status] || '📋';
  };

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
              AIRPORT{' '}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                DASHBOARD
              </span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-[#f1636f]" />
              Real-time Flight Information
              <Sparkles className="w-5 h-5 text-[#f1636f]" />
            </p>
            <p className="text-gray-400 mt-2">
              Current Time: {currentTime.toLocaleTimeString()}
            </p>
          </div>

          {/* Airport Selector */}
          <div className="mb-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex flex-wrap gap-4 items-center justify-center">
              <div className="flex items-center gap-3">
                <Navigation className="w-5 h-5 text-red-400" />
                <span className="text-gray-300 font-medium">Current Airport:</span>
                <select
                  value={selectedAirport}
                  onChange={(e) => setSelectedAirport(e.target.value)}
                  className="px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400 hover:bg-white/15 transition-all duration-300"
                >
                  {airports.map(airport => (
                    <option key={airport.code} value={airport.code} className="bg-gray-800">
                      {airport.code} - {airport.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-400 bg-red-400/20 px-3 py-1 rounded-full border border-red-400/30">
                {airports.find(a => a.code === selectedAirport)?.city}, {airports.find(a => a.code === selectedAirport)?.country}
              </div>
            </div>
          </div>

          {/* Search and Tabs */}
          <div className="mb-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search flights by number, airline, or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pl-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 hover:bg-white/15 transition-all duration-300"
              />
              <Search className="absolute left-4 top-4 w-5 h-5 text-red-400" />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-2 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
              <button
                onClick={() => setActiveTab('departures')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === 'departures'
                    ? 'bg-gradient-to-r from-red-400/30 to-red-500/30 text-white shadow-lg border border-red-400/50'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Plane className="w-4 h-4" />
                Departures
              </button>
              <button
                onClick={() => setActiveTab('arrivals')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === 'arrivals'
                    ? 'bg-gradient-to-r from-red-400/30 to-red-500/30 text-white shadow-lg border border-red-400/50'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Plane className="w-4 h-4 rotate-180" />
                Arrivals
              </button>
            </div>
          </div>

          {/* Flight Information Board */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-300">Loading flight information...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Flight</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Airline</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        {activeTab === 'departures' ? 'Destination' : 'Origin'}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Scheduled</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actual</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Gate</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Aircraft</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredFlights.map((flight) => (
                      <tr key={flight.id} className="hover:bg-white/5 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{flight.flightNumber}</div>
                          <div className="text-sm text-red-300 bg-red-400/20 px-2 py-1 rounded-full border border-red-400/30 inline-block">
                            Terminal {flight.terminal}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white">{flight.airline}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">
                            {activeTab === 'departures' ? flight.destination.code : flight.origin.code}
                          </div>
                          <div className="text-sm text-gray-400">
                            {activeTab === 'departures' ? flight.destination.city : flight.origin.city}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white">{flight.scheduledTime}</td>
                        <td className="px-6 py-4">
                          <div className="text-white">{flight.actualTime}</div>
                          {flight.delay > 0 && (
                            <div className="text-xs text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded-full border border-yellow-400/30 inline-block">
                              +{flight.delay} min
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-2 ${flight.statusColor}`}>
                            <span>{getStatusIcon(flight.status)}</span>
                            <span className="font-medium">{flight.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-medium bg-white/10 px-3 py-1 rounded-lg border border-white/20 inline-block">
                            {flight.gate}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white">{flight.aircraft}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Flight Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {filteredFlights.filter(f => f.status === 'On Time').length}
                </div>
                <div className="text-sm text-gray-300">On Time</div>
                <div className="mt-2 w-full bg-green-400/30 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: `${(filteredFlights.filter(f => f.status === 'On Time').length / filteredFlights.length) * 100}%` }}></div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {filteredFlights.filter(f => f.status === 'Delayed').length}
                </div>
                <div className="text-sm text-gray-300">Delayed</div>
                <div className="mt-2 w-full bg-yellow-400/30 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${(filteredFlights.filter(f => f.status === 'Delayed').length / filteredFlights.length) * 100}%` }}></div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">
                  {filteredFlights.filter(f => f.status === 'Boarding').length}
                </div>
                <div className="text-sm text-gray-300">Boarding</div>
                <div className="mt-2 w-full bg-red-400/30 rounded-full h-2">
                  <div className="bg-red-400 h-2 rounded-full" style={{ width: `${(filteredFlights.filter(f => f.status === 'Boarding').length / filteredFlights.length) * 100}%` }}></div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">
                  {filteredFlights.filter(f => f.status === 'Cancelled').length}
                </div>
                <div className="text-sm text-gray-300">Cancelled</div>
                <div className="mt-2 w-full bg-red-500/30 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(filteredFlights.filter(f => f.status === 'Cancelled').length / filteredFlights.length) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Updates Indicator */}
          <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-4 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white">Live Updates Active</span>
                </div>
                <div className="text-sm text-gray-300">
                  Last Updated: {currentTime.toLocaleTimeString()}
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

export default FlightOverviewPage;