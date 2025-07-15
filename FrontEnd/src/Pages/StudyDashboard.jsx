
import { useState } from 'react';
import {
  Home,
  BookOpen,
  FileText,
  MessageSquare,
  HelpCircle,
  Calendar,
  Award,
  TrendingUp,
  Users,
  Settings,
  Bell,
  Library,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Target,
  Star
} from 'lucide-react';

import StudyOverview from './StudyOverview';
//import MeetOurLearners from './MeetOurLearners';
//import SharingFeedbacks from './SharingFeedbacks';
//import Events from './Events';
//import PartnersAndSupporters from './PartnersAndSupporters';
//import VoicesOfCommunity from './VoicesOfCommunity';
//import Actualite from './Actualite';
//import Contact from './Contact';

const PlaceholderPage = ({ title, description }) => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-4">
        {title}
      </h2>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto">
        {description}
      </p>
    </div>

    <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 border border-white/20 text-center">
      <div className="mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Star className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Page Component</h3>
        <p className="text-gray-300 mb-4">
          This page would be imported from: <code className="bg-gray-800 px-2 py-1 rounded text-red-400">./pages/{title.replace(/\s+/g, '')}</code>
        </p>
        <p className="text-sm text-gray-400">
          Create a separate component file and import it at the top of this dashboard
        </p>
      </div>
    </div>
  </div>
);

const AnimatedBackground = () => null;

const StudyDashboard = () => {
  const [currentPage, setCurrentPage] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home, description: 'Study summary and quick insights' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, description: 'Explore your enrolled courses' },
    { id: 'exams', label: 'Exams & Quizzes', icon: FileText, description: 'Upcoming tests and past results' },
    { id: 'assignments', label: 'Assignments', icon: Target, description: 'Track and submit assignments' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, description: 'Daily and weekly learning schedule' },
    { id: 'progress', label: 'Progress & Analytics', icon: TrendingUp, description: 'Your learning analytics and goals' },
    { id: 'achievements', label: 'Achievements', icon: Award, description: 'Your badges and certificates' },
    { id: 'library', label: 'Resource Library', icon: Library, description: 'Extra resources and materials' },
    { id: 'forum', label: 'Discussion Forum', icon: MessageSquare, description: 'Ask and answer questions' },
    { id: 'study_groups', label: 'Study Groups', icon: Users, description: 'Join or create study circles' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts and important messages' },
    { id: 'support', label: 'Support Center', icon: HelpCircle, description: 'Ask for help or report issues' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Manage your profile and preferences' },
  ];

  const renderPage = () => {
    const currentMenuItem = menuItems.find((item) => item.id === currentPage);
    switch (currentPage) {
      case 'overview': return <StudyOverview />;
    //  case 'meet_learners': return <MeetOurLearners />;
    //  case 'sharing_feedbacks': return <SharingFeedbacks />;
      //case 'events': return <Events />;
      //case 'partners_supporters': return <PartnersAndSupporters />;
      //case 'voices_community': return <VoicesOfCommunity />;
      //case 'actualite': return <Actualite />;
      //case 'contact': return <Contact />;
      default:
        return <PlaceholderPage title={currentMenuItem?.label || 'Page Not Found'} description={currentMenuItem?.description || "This section is under development"} />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <div className="flex h-screen relative z-10">
        <div className={`backdrop-blur-md bg-black/20 border-r border-white/10 shadow-2xl transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center">
                  <GraduationCap className="w-8 h-8 text-red-400 mr-2" />
                  <h1 className="text-xl font-bold text-white bg-gradient-to-r from-red-400 to-gray-400 bg-clip-text text-transparent">
                    StudyHub
                  </h1>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300 text-white hover:scale-105"
              >
                {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
          </div>

          <nav className="mt-4 overflow-y-auto max-h-[calc(100vh-120px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left transition-all duration-300 hover:scale-105 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-red-500/20 to-gray-500/20 border-r-2 border-red-400 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={!sidebarCollapsed ? item.description : item.label}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 relative z-10">
            <div className="backdrop-blur-lg bg-gray-900/30 rounded-2xl border border-gray-700 shadow-xl min-h-[calc(100vh-4rem)] p-4 md:p-8">
              {renderPage()}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes spin-slower { to { transform: rotate(360deg); } }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        .animate-pulse-slow { animation: pulse 3s infinite; }
        .animate-spin-slower { animation: spin-slower 8s linear infinite; }
        nav::-webkit-scrollbar { width: 4px; }
        nav::-webkit-scrollbar-track { background: transparent; }
        nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
        nav::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
};

export default StudyDashboard;