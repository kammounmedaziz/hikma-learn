import { useEffect, useRef, useState } from 'react';
import { Sparkles, BookOpen, Users, Award, ArrowRight } from 'lucide-react';
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
          className="absolute top-0 -left-4 md:w-96 md:h-96 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 md:opacity-20 "></div>
        <div
          ref={(ref) => (blobRefs.current[1] = ref)}
          className="absolute top-0 -right-4 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 md:opacity-20 hidden sm:block"></div>
        <div
          ref={(ref) => (blobRefs.current[2] = ref)}
          className="absolute -bottom-8 left-[-40%] md:left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 md:opacity-20 "></div>
          <div
          ref={(ref) => (blobRefs.current[3] = ref)}
          className="absolute -bottom-10 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 md:opacity-10 hidden sm:block"></div>
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
    utterance.lang = "en-US"; // Change to "fr-FR" if using French
    utterance.rate = 1; // Adjust speed if needed
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
          <p className="text-teal-300 text-sm">{person.challenge}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Award className="w-5 h-5 text-yellow-400" />
        <p className="text-yellow-300 font-medium">{person.achievement}</p>
      </div>
      <p className="text-gray-300 mb-4">{person.description}</p>
      <div className="flex justify-end">
        <button className="flex items-center gap-1 text-indigo-300 hover:text-indigo-200 transition-colors">
          <span>Learn more</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
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

  const handleExplore = () => {
    window.location.href = '/courses';
  };

  const handleCommunity = () => {
    window.location.href = '/community';
  };

  return (
    <div id="hikma-learn" className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <AnimatedBackground />

      {/* Hero Section */}
      <div className="text-center z-10 relative max-w-5xl mx-auto px-[5%] py-20">
        <div className="inline-block relative group mb-6">
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#5e72e4] to-[#11cdef] leading-tight"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            data-aos="zoom-in-up"
            data-aos-duration="600"
          >
            WELCOME TO{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              HIKMA LEARN
            </span>
          </h1>
        </div>

        <p 
          className="mt-6 text-gray-300 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl font-light flex items-center justify-center gap-2 mb-12"
          data-aos="zoom-in-up"
          data-aos-duration="800"
        >
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#11cdef]" />
          Where limitations become launchpads for greatness
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#11cdef]" />
        </p>

        <p 
          className="text-gray-400 max-w-4xl mx-auto text-base md:text-lg mb-12"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          Hikma Learn is dedicated to creating inclusive learning opportunities that empower individuals of all abilities. We believe that disability is not inability, but rather a unique perspective that can lead to extraordinary achievements. Our platform celebrates neurodiversity and provides adaptive learning tools for everyone.
        </p>

        {/* Call-to-action buttons */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 mb-16">
          <button 
            onClick={handleExplore}
            className="
              w-full lg:w-auto px-8 py-4 md:px-12 md:py-5 text-lg md:text-xl font-semibold text-white
              bg-gradient-to-r from-[#5e72e4] to-[#11cdef] hover:from-[#4a5bd0] hover:to-[#0fb4d9]
              rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105
              relative overflow-hidden group
            "
            data-aos="fade-up"
            data-aos-duration="800"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#5e72e4] to-[#11cdef] rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
              Explore Courses
            </span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
          </button>

          <button 
            onClick={handleCommunity}
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
            Join Community
          </button>
        </div>
      </div>

      {/* Inspiring Individuals Section */}
      <div className="z-10 relative max-w-6xl mx-auto px-4 w-full pb-20">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            data-aos="fade-up"
          >
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Inspiring Success Stories
            </span>
          </h2>
          <p 
            className="text-gray-400 max-w-2xl mx-auto text-lg"
            data-aos="fade-up"
            data-aos-delay="100"
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
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-300"
            data-aos="fade-up"
          >
            Discover More Inspiring Stories
          </button>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="z-10 relative max-w-4xl mx-auto px-4 w-full pb-24">
        <div className="bg-indigo-900/30 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-indigo-500/30">
          <h3 
            className="text-2xl md:text-3xl font-bold text-center text-white mb-8"
            data-aos="fade-up"
          >
            What Our Learners Say
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              className="bg-white/5 p-6 rounded-xl border border-white/10"
              data-aos="fade-right"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                <div>
                  <h4 className="font-bold text-white">Sarah Johnson</h4>
                  <p className="text-indigo-300 text-sm">Visual Impairment</p>
                </div>
              </div>
              <p className="text-gray-300 italic">"Hikma Learn's audio-based courses have transformed how I access education. I've gained skills I never thought possible with my visual impairment."</p>
            </div>
            
            <div 
              className="bg-white/5 p-6 rounded-xl border border-white/10"
              data-aos="fade-left"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                <div>
                  <h4 className="font-bold text-white">Michael Torres</h4>
                  <p className="text-indigo-300 text-sm">Dyslexia</p>
                </div>
              </div>
              <p className="text-gray-300 italic">"The multi-sensory approach at Hikma Learn helped me overcome my reading challenges. I'm now pursuing a degree in graphic design!"</p>
            </div>
          </div>
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
          background-image: linear-gradient(#0f172a, #0f172a), 
                            linear-gradient(to right, #6366f1, #06b6d4);
          background-origin: border-box;
          background-clip: content-box, border-box;
        }
      `}</style>
    </div>
  );
};

export default Home;