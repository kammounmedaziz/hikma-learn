import { useState, useEffect } from 'react';
import { 

  ClipboardList, 
  Clock, 
  SquarePen,
  Trophy,
  User,

} from 'lucide-react';
import WorkspaceLayout from '../components/WorkspaceLayout';
import XPBar from '../components/XPBar';
import StreakCounter from '../components/StreakCounter';

const WorkspacePage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userStats, setUserStats] = useState({ xp: 0, level: 1, streak_days: 0 });

  // Helper to get JWT token from localStorage
  const getToken = () => localStorage.getItem('access_token');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/stats/', {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Not authorized or not found');
        return res.json();
      })
      .then(data => setUserStats(data))
      .catch(err => {
        setUserStats({ xp: 0, level: 1, streak_days: 0 });
        console.error(err);
      });
  }, []);

  const workspaceTabs = [
    { id: 'tasks', label: 'Tasks', icon: ClipboardList, description: 'Manage your tasks' },
    { id: 'pomodoro', label: 'Focus Timer', icon: Clock, description: 'Pomodoro timer' },
    { id: 'whiteboard', label: 'Whiteboard', icon: SquarePen, description: 'Collaborative whiteboard' },
    { id: 'achievements', label: 'Achievements', icon: Trophy, description: 'Your progress and badges' },
    { id: 'profile', label: 'Profile', icon: User, description: 'Account settings' },

  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 relative overflow-hidden p-4 md:p-8">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-4">
            FocusForge
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Your gamified productivity workspace
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 p-4 backdrop-blur-md bg-white/10 rounded-xl border border-white/20">
          <XPBar xp={userStats.xp} level={userStats.level} />
          <StreakCounter streak={userStats.streak_days} />
        </div>

        {/* Workspace Tabs */}
        <div className="backdrop-blur-md bg-white/10 rounded-xl border border-white/20 p-1">
          <div className="flex flex-wrap gap-1">
            {workspaceTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-red-500/20 to-gray-500/20 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={tab.description}
                >
                  <Icon size={18} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="min-h-[500px]">
          <div className="backdrop-blur-lg bg-gray-900/30 rounded-2xl border border-gray-700 shadow-xl p-6">
            <WorkspaceLayout activeTab={activeTab} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;