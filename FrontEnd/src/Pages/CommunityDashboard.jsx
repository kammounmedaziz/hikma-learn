import { useState, useEffect, useRef } from 'react';
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
  
} from 'lucide-react';
import CommunityOverview from './CommunitOvervirw';

// Animated Background Component
const AnimatedBackground = () => {
  const blobRefs = useRef([])

  useEffect(() => {
    let requestId;
    const localInitialPositions = [
      { x: -4, y: 0 },
      { x: -4, y: 0 },
      { x: 20, y: -8 },
      { x: 20, y: -8 },
    ];

    const handleScroll = () => {
      const newScroll = window.pageYOffset;

      blobRefs.current.forEach((blob, index) => {
        const initialPos = localInitialPositions[index];

        // Calculating movement in both X and Y direction
        const xOffset = Math.sin(newScroll / 100 + index * 0.5) * 340 // Horizontal movement
        const yOffset = Math.cos(newScroll / 100 + index * 0.5) * 40 // Vertical movement

        const x = initialPos.x + xOffset
        const y = initialPos.y + yOffset

        // Apply transformation with smooth transition
        if (blob) {
          blob.style.transform = `translate(${x}px, ${y}px)`
          blob.style.transition = "transform 1.4s ease-out"
        }
      })

      requestId = requestAnimationFrame(handleScroll)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (requestId) cancelAnimationFrame(requestId)
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
          className="absolute -bottom-8 left-[-40%] md:left-20 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 md:opacity-20 "></div>
          <div
          ref={(ref) => (blobRefs.current[3] = ref)}
          className="absolute -bottom-10 right-20 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 md:opacity-10 hidden sm:block"></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>
  )
}

const StudyDashboard = () => {
  const [currentPage, setCurrentPage] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Define your study platform menu items
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'exams', label: 'Exams & Quizzes', icon: FileText },
    { id: 'assignments', label: 'Assignments', icon: Target },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'progress', label: 'Progress & Analytics', icon: TrendingUp },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'library', label: 'Resource Library', icon: Library },
    { id: 'forum', label: 'Discussion Forum', icon: MessageSquare },
    { id: 'study_groups', label: 'Study Groups', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'support', label: 'Support Center', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return (
          <div className="text-center">
            <CommunityOverview/>
          </div>
        );
      default:
        return (
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-4">
              {menuItems.find(item => item.id === currentPage)?.label || 'Page'}
            </h2>
            <p className="text-gray-300 text-lg">This section will be implemented soon</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
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
          
          {/* Navigation Menu */}
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
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 relative z-10">
            <div className="backdrop-blur-lg bg-gray-900/30 rounded-2xl border border-gray-700 shadow-xl min-h-[calc(100vh-4rem)] p-4 md:p-8">
              {renderPage()}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
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

export default StudyDashboard;