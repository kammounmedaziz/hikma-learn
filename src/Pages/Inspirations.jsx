import { useEffect, useRef } from 'react';
import { Sparkles, Users, Award, ArrowRight, Home } from 'lucide-react';

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

const SuccessStoryCard = ({ person, delay }) => {
  const synthRef = useRef(window.speechSynthesis);

  const handleSpeak = () => {
    if (synthRef.current.speaking) synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(person.description);
    utterance.lang = "en-US";
    utterance.rate = 1;
    synthRef.current.speak(utterance);
  };

  const handleStop = () => {
    synthRef.current.cancel();
  };

  return (
    <div 
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
      data-aos="fade-up"
      data-aos-delay={delay}
      onMouseEnter={handleSpeak}
      onMouseLeave={handleStop}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
        <div>
          <h3 className="text-xl font-bold text-white">{person.name}</h3>
          <p className="text-red-300 text-sm">{person.challenge}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Award className="w-5 h-5 text-yellow-400" />
        <p className="text-yellow-300 font-medium">{person.achievement}</p>
      </div>
      <p className="text-gray-300 mb-4">{person.description}</p>
      <div className="flex justify-end">
        <button className="flex items-center gap-1 text-red-300 hover:text-red-200 transition-colors">
          <span>Learn more</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Inspiration = () => {
  const inspiringPeople = [
    {
      name: "Stephen Hawking",
      challenge: "Motor Neuron Disease",
      achievement: "Renowned Theoretical Physicist",
      description: "Despite being diagnosed with ALS at 21 and given just a few years to live, Hawking became one of the most influential scientists of our time, authoring groundbreaking theories on black holes and cosmology."
    },
    {
      name: "Helen Keller",
      challenge: "Deaf-blind",
      achievement: "Author, Activist & Lecturer",
      description: "The first deaf-blind person to earn a Bachelor of Arts degree, Keller became a world-famous speaker and author, advocating for people with disabilities."
    },
    {
      name: "Frida Kahlo",
      challenge: "Polio & Spinal Injury",
      achievement: "Iconic Mexican Artist",
      description: "After a bus accident left her with lifelong pain and medical problems, Kahlo channeled her experiences into powerful, surrealist paintings that made her an art world legend."
    },
    {
      name: "Nick Vujicic",
      challenge: "Tetra-amelia syndrome",
      achievement: "Motivational Speaker & Evangelist",
      description: "Born without limbs, Vujicic has become a world-renowned motivational speaker, inspiring millions with his message of hope and resilience."
    },
    {
      name: "Temple Grandin",
      challenge: "Autism Spectrum",
      achievement: "Animal Scientist & Autism Advocate",
      description: "Grandin revolutionized livestock handling designs and became a leading voice in autism advocacy, showing how neurodiversity can be a strength."
    },
    {
      name: "Andrea Bocelli",
      challenge: "Blindness",
      achievement: "World-Famous Tenor",
      description: "Blinded at age 12, Bocelli has sold over 90 million records worldwide, becoming one of the most successful classical crossover artists in history."
    }
  ];

  const handleHome = () => {
    window.location.href = '/';
  };

  const handleCommunity = () => {
    window.location.href = '/community';
  };

  return (
    <div id="inspiration" className="min-h-screen px-4 relative overflow-hidden">
      <AnimatedBackground />

      {/* Navigation */}
      <div className="z-10 relative max-w-6xl mx-auto pt-8 pb-4">
        <button 
          onClick={handleHome}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <Home className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
      </div>

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

      {/* Inspiring Individuals Section */}
      <div className="z-10 relative max-w-6xl mx-auto px-4 w-full pb-20">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            <span className="bg-gradient-to-br from-red-300 via-red-500 to-red-700 bg-clip-text text-transparent drop-shadow-lg">
              Remarkable Individuals
            </span>
          </h2>
          <p 
            className="text-gray-400 max-w-2xl mx-auto text-lg"
          >
            These remarkable individuals overcame significant challenges to achieve greatness. Their stories remind us that true potential knows no boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {inspiringPeople.map((person, index) => (
            <SuccessStoryCard 
              key={index} 
              person={person} 
              delay={100 + (index * 100)}
            />
          ))}
        </div>

        <div className="text-center mt-16">
          <button 
            className="px-6 py-3 bg-gradient-to-br from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-red-500/30"
          >
            <span className="drop-shadow-sm">Discover More Inspiring Stories</span>
          </button>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="z-10 relative max-w-4xl mx-auto px-4 w-full pb-24">
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