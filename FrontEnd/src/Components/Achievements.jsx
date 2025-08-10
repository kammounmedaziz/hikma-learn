import { useState, useEffect } from 'react';
import { Trophy, Lock, Zap, Flame, CheckCircle } from 'lucide-react';

import { fetchWithAuth } from '../services/api';
const Achievements = () => {
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const getBadgeIcon = (badgeName) => {
    switch(badgeName.toLowerCase()) {
      case 'zen_focus': return <Zap className="w-8 h-8" />;
      case 'streak_starter': return <Flame className="w-8 h-8" />;
      case 'task_finisher': return <CheckCircle className="w-8 h-8" />;
      default: return <Trophy className="w-8 h-8" />;
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [badges, profile] = await Promise.all([
          fetchWithAuth('/badges/'),
          fetchWithAuth('/profile/')
        ]);
        setBadges(badges);
        setUserBadges(profile.badges.map(b => b.badge.id));
      } catch (error) {
        console.error('API error:', error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Trophy className="w-6 h-6 mr-2 text-red-400" />
          Achievements
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map(badge => (
          <div 
            key={badge.id}
            className={`p-4 rounded-lg border flex flex-col items-center text-center ${
              userBadges.includes(badge.id)
                ? 'bg-gradient-to-b from-yellow-500/10 to-yellow-800/10 border-yellow-500'
                : 'bg-gray-800/50 border-gray-700 opacity-60'
            }`}
          >
            <div className="mb-2">
              {userBadges.includes(badge.id) ? (
                getBadgeIcon(badge.name)
              ) : (
                <Lock className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <h3 className="font-bold text-white">{badge.name.replace(/_/g, ' ')}</h3>
            <p className="text-sm text-gray-300 mt-1">{badge.description}</p>
            {!userBadges.includes(badge.id) && (
              <p className="text-xs text-yellow-400 mt-2">
                {badge.xp_threshold > 0 ? `Earn ${badge.xp_threshold} XP to unlock` : 'Complete challenges to unlock'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;