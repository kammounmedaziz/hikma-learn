import { useEffect, useRef } from 'react';
import { Sparkles, BarChart3, Users } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

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

const Home = () => {
  // Optimized AOS initialization
  useEffect(() => {
    const initAOS = () => {
      AOS.init({
        once: false, 
      });
    };

    initAOS();
    
    // Debounced resize handler
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initAOS, 250);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Navigation functions
  const handleGetStarted = () => {
    // For React Router, you would use: navigate('/statistics')
    // For now, using window.location for demonstration
    window.location.href = '/statistics';
  };

  const handleTeamClick = () => {
    // For React Router, you would use: navigate('/team')
    // For now, using window.location for demonstration
    window.location.href = '/team';
  };

  return (
    <div id="Home" className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <AnimatedBackground />

      {/* Main content container */}
      <div className="text-center z-10 relative max-w-5xl mx-auto px-[5%]">
        {/* Main heading with matching gradient style */}
        <div className="inline-block relative group mb-8">
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f1636f] to-[#a855f7] leading-tight"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            data-aos="zoom-in-up"
            data-aos-duration="600"
          >
            CRAFTING{' '}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              WEATHER
            </span>{' '}
            WISDOM FOR{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AEROSPACE
            </span>
          </h1>
        </div>

        {/* Subtitle with sparkles like the About page */}
        <p 
          className="mt-4 text-gray-400 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl font-light flex items-center justify-center gap-2 mb-12"
          data-aos="zoom-in-up"
          data-aos-duration="800"
        >
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#f1636f]" />
          Organized by IEEE ESPRIT SB – AESS Chapter
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#f1636f]" />
        </p>

        {/* Call-to-action buttons */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6">
          {/* Get Started Button */}
          <button 
            onClick={handleGetStarted}
            className="
              w-full lg:w-auto px-8 py-4 md:px-12 md:py-5 text-lg md:text-xl font-semibold text-white
              bg-gradient-to-r from-[#f1636f] to-[#a855f7] hover:from-[#e55a66] hover:to-[#9333ea]
              rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105
              relative overflow-hidden group animate-bounce-slow
            "
            data-aos="fade-up"
            data-aos-duration="800"
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#f1636f] to-[#a855f7] rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            
            {/* Button content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />
              Get Started
            </span>
            
            {/* Hover shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
          </button>

          {/* Team Button */}
          <button 
            onClick={handleTeamClick}
            type="button"
            className="
              w-full lg:w-auto px-8 py-4 md:px-12 md:py-5 text-lg md:text-xl font-medium 
              rounded-lg border-2 border-gray-200 bg-transparent text-white shadow-sm 
              hover:bg-white/10 focus:outline-none focus:bg-white/10 
              disabled:opacity-50 disabled:pointer-events-none
              transition-all duration-300 hover:scale-105
            "
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            <Users className="w-5 h-5 md:w-6 md:h-6 inline mr-2" />
            Team
          </button>
        </div>

        {/* Additional decorative elements */}
        <div 
          className="mt-16"
          data-aos="fade-up"
          data-aos-duration="1200"
        >
          <div className="flex items-center justify-center gap-8 text-gray-500">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#f1636f]"></div>
            <div className="w-2 h-2 bg-[#f1636f] rounded-full animate-pulse"></div>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#a855f7]"></div>
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

export default Home;