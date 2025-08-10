import { useEffect, useState } from 'react';
import { User, Calendar, Clock, CheckCircle, Flame } from 'lucide-react';
import XPBar from './XPBar';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);

  // Helper to get JWT token from localStorage
  const getToken = () => localStorage.getItem('access_token');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/profile/', {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Not authorized or not found');
        return res.json();
      })
      .then(data => setProfile(data))
      .catch(err => {
        setProfile(null);
        console.error(err);
      });
  }, []);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <User className="w-6 h-6 mr-2 text-red-400" />
          Your Profile
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Progress</h3>
          <XPBar xp={profile.xp} level={profile.level} />
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center">
              <Flame className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-white">Current streak:</span>
              <span className="ml-auto font-bold">{profile.streak_days} days</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-white">Tasks completed:</span>
              <span className="ml-auto font-bold">{profile.tasks_completed_total}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-white">Focus minutes:</span>
              <span className="ml-auto font-bold">{profile.focus_minutes_total}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Daily Goals</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-white mb-2 block">Daily task goal</label>
              <input
                type="number"
                value={profile.daily_goal}
                onChange={(e) => {
                  const newGoal = parseInt(e.target.value) || 0;
                  fetch('http://127.0.0.1:8000/api/profile/', {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${getToken()}`,
                    },
                    body: JSON.stringify({ daily_goal: newGoal })
                  })
                  .then(res => {
                    if (!res.ok) throw new Error('Not authorized or not found');
                    return res.json();
                  })
                  .then(data => setProfile(data))
                  .catch(err => {
                    console.error(err);
                  });
                }}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                min="1"
                max="20"
              />
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center text-gray-400">
                <Calendar className="w-5 h-5 mr-2" />
                <span>Last active: {new Date(profile.last_login_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;