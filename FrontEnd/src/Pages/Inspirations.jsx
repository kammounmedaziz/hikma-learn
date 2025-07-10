import { useEffect, useRef } from 'react';
import { Sparkles, Users } from 'lucide-react';

// Import card components
import BeethovenCard from '../Components/BeethovenCard'; 
import StephenHawking from '../Components/StephenHawkingCard';
import GhanimAlMuftah from '../Components/Ghanim Al Muftah';
import HelenKeller from '../Components/HelenKellerCard';
import MunibaMazri from '../Components/MunibaMazariCard';

// Card container wrapper to ensure consistent sizing
const CardContainer = ({ children }) => (
  <div className="h-full">
    <div className="flex flex-col h-full bg-gray-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 shadow-lg transition-all duration-300 hover:border-red-400/30 hover:shadow-red-900/10">
      {children}
    </div>
  </div>
);

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
    <div className="fixed inset-0 animated-bg" id="Inspiration">
      <div className="absolute inset-0">
        <div
          ref={(ref) => (blobRefs.current[0] = ref)}
          className="absolute top-0 -left-4 md:w-96 md:h-96 w-72 h-72 bg-red-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15 "></div>
        <div
          ref={(ref) => (blobRefs.current[1] = ref)}
          className="absolute top-0 -right-4 w-96 h-96 bg-rose-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15 hidden sm:block"></div>
        <div
          ref={(ref) => (blobRefs.current[2] = ref)}
          className="absolute -bottom-8 left-[-40%] md:left-20 w-96 h-96 bg-red-700 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15 "></div>
          <div
          ref={(ref) => (blobRefs.current[3] = ref)}
          className="absolute -bottom-10 right-20 w-96 h-96 bg-gray-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 md:opacity-10 hidden sm:block"></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>
  )
}

const Inspiration = () => {
  const handleHome = () => {
    window.location.href = '/';
  };

  const handleCommunity = () => {
    window.location.href = '/community';
  };

  return (
    <div id="Inspiration" className="min-h-screen px-4 relative overflow-hidden">
      <AnimatedBackground />

      

      {/* Page Header */}
      <div className="text-center z-10 relative max-w-5xl mx-auto px-4 py-12">
        <div className="inline-block relative group mb-6">
          <h1 
            className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-red-400 via-red-500 to-red-700 leading-tight drop-shadow-2xl"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            INSPIRING{' '}
            <span className="bg-gradient-to-br from-rose-300 via-red-500 to-red-800 bg-clip-text text-transparent drop-shadow-lg">
              STORIES
            </span>
          </h1>
        </div>

        <p 
          className="mt-6 text-gray-100 max-w-3xl mx-auto text-lg md:text-xl font-light flex items-center justify-center gap-2 mb-12 drop-shadow-lg"
        >
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-red-400 drop-shadow-md" />
          Proof that greatness knows no boundaries
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-red-400 drop-shadow-md" />
        </p>
      </div>

      {/* Cards Section */}
      <div className="z-10 relative max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CardContainer>
            <BeethovenCard />
          </CardContainer>
          <CardContainer>
            <GhanimAlMuftah />
          </CardContainer>
          <CardContainer>
            <HelenKeller />
          </CardContainer>
          <CardContainer>
            <MunibaMazri />
          </CardContainer>
          <CardContainer>
            <StephenHawking />
          </CardContainer>
        </div>

       
      </div>

      {/* Testimonials Section with top spacing */}
      <div className="z-10 relative max-w-4xl mx-auto px-4 w-full pb-24 mt-20">
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-600/30">
          <h3 
            className="text-2xl md:text-3xl font-bold text-center text-white mb-8"
          >
            What Our Learners Say
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              className="bg-white/5 p-6 rounded-xl border border-white/10"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gray-300 border-2 border-dashed rounded-xl w-12 h-12" />
                <div>
                  <h4 className="font-bold text-white">Sarah Johnson</h4>
                  <p className="text-red-300 text-sm">Visual Impairment</p>
                </div>
              </div>
              <p className="text-gray-300 italic">"Hikma Learn's audio-based courses have transformed how I access education. I've gained skills I never thought possible with my visual impairment."</p>
            </div>
            
            <div 
              className="bg-white/5 p-6 rounded-xl border border-white/10"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gray-300 border-2 border-dashed rounded-xl w-12 h-12" />
                <div>
                  <h4 className="font-bold text-white">Michael Torres</h4>
                  <p className="text-red-300 text-sm">Dyslexia</p>
                </div>
              </div>
              <p className="text-gray-300 italic">"The multi-sensory approach at Hikma Learn helped me overcome my reading challenges. I'm now pursuing a degree in graphic design!"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="z-10 relative max-w-4xl mx-auto px-4 w-full pb-24">
        <div className="text-center bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-red-500/30">
          <h3 
            className="text-2xl md:text-3xl font-bold text-white mb-4"
          >
            Ready to Write Your Own Success Story?
          </h3>
          <p 
            className="text-gray-300 max-w-2xl mx-auto text-lg mb-8"
          >
            Join thousands of learners who have discovered their potential through Hikma Learn's inclusive education platform.
          </p>
          <button 
            onClick={handleCommunity}
            className="px-8 py-4 bg-gradient-to-br from-red-500 via-red-600 to-red-800 hover:from-red-600 hover:via-red-700 hover:to-red-900 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-red-500/30"
          >
            <Users className="w-5 h-5 inline mr-2" />
            <span>Join Our Community</span>
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .gradient-border {
          position: relative;
          border: double 3px transparent;
          border-radius: 20px;
          background-image: linear-gradient(#1f2937, #1f2937), 
                            linear-gradient(to right, #dc2626, #ef4444);
          background-origin: border-box;
          background-clip: content-box, border-box;
        }
      `}</style>
    </div>
  );
};

export default Inspiration;