import { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Megaphone,
  Star,
  Handshake,
  Newspaper,
  Mail,

} from 'lucide-react';

import CommunityOverview from '../Pages/CommunitOvervirw';


// Placeholder component for demonstration
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

        const xOffset = Math.sin(newScroll / 100 + index * 0.5) * 340
        const yOffset = Math.cos(newScroll / 100 + index * 0.5) * 40

        const x = initialPos.x + xOffset
        const y = initialPos.y + yOffset

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

const CommunityDashboard = () => {
  const [currentPage, setCurrentPage] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Menu items configuration
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, description: 'Community statistics and quick actions' },
    { id: 'meet_learners', label: 'Meet Our Learners', icon: Users, description: 'Inspiring stories from our community members' },
    { id: 'sharing_feedbacks', label: 'Sharing Feedbacks', icon: MessageSquare, description: 'Help us improve by sharing your thoughts' },
    { id: 'events', label: 'Events', icon: Calendar, description: 'Join workshops, webinars, and gatherings' },
    { id: 'partners_supporters', label: 'Partners and Supporters', icon: Handshake, description: 'Organizations supporting our mission' },
    { id: 'voices_community', label: 'Voices of the Community', icon: Megaphone, description: 'Hear from community members and advocates' },
    { id: 'actualite', label: 'Actualité', icon: Newspaper, description: 'Latest news and updates from our community' },
    { id: 'contact', label: 'Contact', icon: Mail, description: 'Get in touch with our support team' },
  ];

  // Page rendering logic - replace with actual imports
  const renderPage = () => {
    const currentMenuItem = menuItems.find(item => item.id === currentPage);
    

    switch (currentPage) {
      case 'overview':
        return <CommunityOverview />;
      case 'meet_learners':
        return <MeetOurLearners />;
      case 'sharing_feedbacks':
        return <SharingFeedbacks />;
      case 'events':
        return <Events />;
      case 'partners_supporters':
        return <PartnersAndSupporters />;
      case 'voices_community':
        return <VoicesOfCommunity />;
      case 'actualite':
        return <Actualite />;
      case 'contact':
        return <Contact />;
      default:
        return <PlaceholderPage title="Page Not Found" description="This page doesn't exist" />;
    }

    
    // For demonstration, showing placeholder
    return (
      <PlaceholderPage 
        title={currentMenuItem?.label || 'Page'} 
        description={currentMenuItem?.description || 'This section is under development'}
      />
    );
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
                  <Star className="w-8 h-8 text-red-400 mr-2" />
                  <h1 className="text-xl font-bold text-white bg-gradient-to-r from-red-400 to-gray-400 bg-clip-text text-transparent">
                    Community Dashboard
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
                  title={!sidebarCollapsed ? item.description : item.label}
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
        
        /* Custom scrollbar for sidebar */
        nav::-webkit-scrollbar {
          width: 4px;
        }
        nav::-webkit-scrollbar-track {
          background: transparent;
        }
        nav::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
        nav::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default CommunityDashboard;