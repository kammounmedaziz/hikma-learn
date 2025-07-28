import { useState } from 'react';
import {
  Home,
  BookOpen,
  Users,
  FileText,
  Calendar,
  BarChart3,
  MessageSquare,
  Settings,
  Bell,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Library,
  UserCheck,
  Video,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { Link, useLocation, Outlet } from 'react-router-dom';

const TeacherOverview = () => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-4">
        Welcome Back, Professor!
      </h2>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto">
        Your teaching dashboard - manage classes, track student progress, and create engaging content
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <Users className="w-8 h-8 text-red-400" />
          <span className="text-2xl font-bold text-white">156</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Total Students</h3>
        <p className="text-green-400 text-sm">+12 this month</p>
      </div>

      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <BookOpen className="w-8 h-8 text-red-400" />
          <span className="text-2xl font-bold text-white">8</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Active Courses</h3>
        <p className="text-red-400 text-sm">2 new this semester</p>
      </div>

      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <ClipboardList className="w-8 h-8 text-green-400" />
          <span className="text-2xl font-bold text-white">24</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Pending Reviews</h3>
        <p className="text-yellow-400 text-sm">6 urgent</p>
      </div>

      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="w-8 h-8 text-yellow-400" />
          <span className="text-2xl font-bold text-white">87%</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Avg. Performance</h3>
        <p className="text-green-400 text-sm">+5% improvement</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-red-400" />
          Today's Schedule
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg">
            <div>
              <p className="text-white font-medium">Advanced Mathematics</p>
              <p className="text-gray-300 text-sm">Room 204 • 45 students</p>
            </div>
            <span className="text-red-400 font-bold">09:00</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg">
            <div>
              <p className="text-white font-medium">Physics Lab Session</p>
              <p className="text-gray-300 text-sm">Lab 3 • 20 students</p>
            </div>
            <span className="text-red-400 font-bold">14:00</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg">
            <div>
              <p className="text-white font-medium">Office Hours</p>
              <p className="text-gray-300 text-sm">Room 105 • Open</p>
            </div>
            <span className="text-red-400 font-bold">16:00</span>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-yellow-400" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
            <div>
              <p className="text-white text-sm">New assignment submitted by John Doe</p>
              <p className="text-gray-400 text-xs">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
            <div>
              <p className="text-white text-sm">Quiz "Quantum Mechanics" completed by 25 students</p>
              <p className="text-gray-400 text-xs">1 hour ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
            <div>
              <p className="text-white text-sm">New forum discussion started in "General Physics"</p>
              <p className="text-gray-400 text-xs">3 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-red-500/10 rounded-full blur-2xl animate-spin-slower"></div>
  </div>
);

const TeacherDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: Home, description: 'Overview of your teaching activities', path: '/teacherdashboard' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, description: 'Manage your courses and curriculum', path: '/teacherdashboard/courses' },
    { id: 'quizzes', label: 'Quizzes', icon: ClipboardList, description: 'Create and manage assignments', path: '/teacherdashboard/quizzes' },
    { id: 'grading', label: 'Grading Center', icon: FileText, description: 'Review and grade submissions', path: '/teacherdashboard/grading' },
    { id: 'attendance', label: 'Attendance', icon: UserCheck, description: 'Track student attendance', path: '/teacherdashboard/attendance' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Student performance analytics', path: '/teacherdashboard/analytics' },
    { id: 'schedule', label: 'Class Schedule', icon: Calendar, description: 'Manage your teaching schedule', path: '/teacherdashboard/schedule' },
    { id: 'content', label: 'Content Library', icon: Library, description: 'Course materials and resources', path: '/teacherdashboard/content' },
    { id: 'live_classes', label: 'Live Classes', icon: Video, description: 'Conduct virtual classes', path: '/teacherdashboard/live_classes' },
    { id: 'forums', label: 'Discussion Forums', icon: MessageSquare, description: 'Moderate class discussions', path: '/teacherdashboard/forums' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'System alerts and updates', path: '/teacherdashboard/notifications' },
    { id: 'support', label: 'Support', icon: HelpCircle, description: 'Get help and report issues', path: '/teacherdashboard/support' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Configure your preferences', path: '/teacherdashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 relative overflow-hidden">
      <AnimatedBackground />
      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <div
          className={`backdrop-blur-md bg-black/20 border-r border-white/10 shadow-2xl transition-all duration-300 ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center">
                  <GraduationCap className="w-8 h-8 text-red-400 mr-2" />
                  <h1 className="text-xl font-bold text-white bg-gradient-to-r from-red-400 to-gray-400 bg-clip-text text-transparent">
                    TeacherHub
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
              const isActive = location.pathname === item.path || (item.id === 'overview' && location.pathname === '/teacherdashboard');
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center px-4 py-3 text-left transition-all duration-300 hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-500/20 to-gray-500/20 border-r-2 border-red-400 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={!sidebarCollapsed ? item.description : item.label}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 relative z-10">
            <div className="backdrop-blur-lg bg-gray-900/30 rounded-2xl border border-gray-700 shadow-xl min-h-[calc(100vh-4rem)] p-4 md:p-8">
              {location.pathname === '/teacherdashboard' || location.pathname === '/teacherdashboard/overview' ? (
                <TeacherOverview />
              ) : (
                <Outlet />
              )}
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

export default TeacherDashboard;