import { useState, useEffect } from 'react';

const XPBar = () => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      console.log('Fetching stats from Django backend...');
      
      // Use absolute URL to Django server
      const API_BASE = 'http://localhost:8000';
      
      const token = localStorage.getItem('access_token') || 
                   localStorage.getItem('token') ||
                   sessionStorage.getItem('access_token') ||
                   sessionStorage.getItem('token');

      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/stats/`, {
        headers: headers,
        credentials: 'include'
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Stats data received:', data);
        setXp(data.xp || 0);
        setLevel(data.level || 1);
        setError(null);
      } else if (response.status === 401) {
        setError('Please log in again');
      } else {
        setError(`Server error: ${response.status}`);
      }
    } catch (error) {
      setError('Network error: ' + error.message);
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Mock data for development
  useEffect(() => {
    setTimeout(() => {
      setXp(750);
      setLevel(6);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
        <div className="bg-gray-500 h-4 rounded-full animate-pulse"></div>
        <div className="text-xs text-center text-white mt-1">
          Loading stats...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-yellow-100 rounded-lg p-3">
        <div className="text-xs text-center text-yellow-800">
          <div className="font-bold">Development Mode:</div>
          <div className="mt-1 opacity-75">{error}</div>
          <div className="mt-2 text-xs">
            Using mock data. Make sure Django is running on port 8000.
          </div>
        </div>
        
        {/* Show mock data */}
        <div className="mt-3 pt-3 border-t border-yellow-300">
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-500 to-yellow-500 h-4 rounded-full" 
              style={{ width: '75%' }}
            ></div>
            <div className="text-xs text-center text-white mt-1">
              Level 6 • 750/6000 XP (Mock Data)
            </div>
          </div>
        </div>
      </div>
    );
  }

  const xpNeeded = level * 1000;
  const progress = Math.min(100, (xp / xpNeeded) * 100);

  return (
    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
      <div 
        className="bg-gradient-to-r from-red-500 to-yellow-500 h-4 rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${progress}%` }}
      ></div>
      <div className="text-xs text-center text-white mt-1">
        Level {level} • {xp}/{xpNeeded} XP
      </div>
    </div>
  );
};

export default XPBar;