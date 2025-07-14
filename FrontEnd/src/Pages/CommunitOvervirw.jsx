import  { useState, useEffect, useRef } from 'react';
import { Users, Clock, Heart, Quote, GraduationCap } from 'lucide-react';
import { useSpeechSynthesis } from 'react-speech-kit';


// Animated Background Component (same as StudyDashboard)
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

const CommunityOverview = () => {
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [isVisible, setIsVisible] = useState({});
  const counterRefs = useRef({});

  // Motivational quotes
  const quotes = [
    {
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela"
    },
    {
      text: "The beautiful thing about learning is that no one can take it away from you.",
      author: "B.B. King"
    },
    {
      text: "Every accomplishment starts with the decision to try.",
      author: "From our community"
    },
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill"
    },
    {
      text: "Your limitation—it's only your imagination.",
      author: "From our community"
    }
  ];

  // State for current quote index (for navigation dots)
  const [currentQuote, setCurrentQuote] = useState(0);

  // Tunisia cities with coordinates (approximate)
  const communityLocations = [
    { name: "Tunis", x: 45, y: 35, users: 1247 },
    { name: "Sfax", x: 48, y: 52, users: 892 },
    { name: "Sousse", x: 46, y: 45, users: 634 },
    { name: "Kairouan", x: 42, y: 48, users: 423 },
    { name: "Bizerte", x: 43, y: 32, users: 356 },
    { name: "Gabès", x: 47, y: 68, users: 287 },
    { name: "Ariana", x: 45, y: 33, users: 521 },
    { name: "Gafsa", x: 40, y: 62, users: 198 }
  ];

  // Animated counter hook
  const useCounter = (end, duration = 2000) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
      if (!hasAnimated) return;

      let startTime;
      const startCount = 0;

      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        setCount(Math.floor(progress * (end - startCount) + startCount));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, [hasAnimated, end, duration]);

    return [count, () => setHasAnimated(true)];
  };

  // Intersection Observer for animations
  useEffect(() => {
    const observers = [];
    
    Object.keys(counterRefs.current).forEach(key => {
      const ref = counterRefs.current[key];
      if (ref) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                setIsVisible(prev => ({ ...prev, [key]: true }));
              }
            });
          },
          { threshold: 0.3 }
        );
        observer.observe(ref);
        observers.push(observer);
      }
    });

    return () => observers.forEach(observer => observer.disconnect());
  }, []);

  // Auto-rotate quotes
useEffect(() => {
  const fallbackQuotes = [
    { text: "Education is the key to unlocking the world, a passport to freedom.", author: "Oprah Winfrey" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  ];

  const fetchQuote = async () => {
    try {
      const response = await fetch('https://api.quotable.io/random?tags=education|success|inspirational');
      const data = await response.json();
      setQuote({ text: data.content, author: data.author });
    } catch (error) {
      console.error('Failed to fetch quote, using fallback.', error);
      const random = Math.floor(Math.random() * fallbackQuotes.length);
      setQuote(fallbackQuotes[random]);
    }
  };

  fetchQuote(); // load on mount
  const interval = setInterval(fetchQuote, 7000); // auto-update

  return () => clearInterval(interval); // cleanup
}, []);


  // Counter components
  const [learnersCount, triggerLearners] = useCounter(12847);
  const [hoursCount, triggerHours] = useCounter(245632);
  const [contributorsCount, triggerContributors] = useCounter(2156);

  useEffect(() => {
    if (isVisible.learners) triggerLearners();
  }, [isVisible.learners, triggerLearners]);

  useEffect(() => {
    if (isVisible.hours) triggerHours();
  }, [isVisible.hours, triggerHours]);

  useEffect(() => {
    if (isVisible.contributors) triggerContributors();
  }, [isVisible.contributors, triggerContributors]);

  return (
    <div className="min-h-screen relative overflow-hidden text-gray-200">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Header Section */}
      <div className="relative z-10 text-center py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <GraduationCap className="w-16 h-16 text-red-400 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400">
              Our Community
            </h1>
          </div>
          <p className="text-gray-300 text-lg mb-8">
            Together, we learn. Together, we grow.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-gray-500 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Live Stats Counter */}
      <div className="relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Learners Helped */}
            <div 
              ref={el => counterRefs.current.learners = el}
              className="backdrop-blur-lg bg-gray-900/30 rounded-2xl p-8 shadow-xl border border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-gray-500 rounded-full mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-2">
                  {learnersCount.toLocaleString()}
                </div>
                <p className="text-gray-300 font-medium">Learners Supported</p>
              </div>
            </div>

            {/* Hours of Content */}
            <div 
              ref={el => counterRefs.current.hours = el}
              className="backdrop-blur-lg bg-gray-900/30 rounded-2xl p-8 shadow-xl border border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-gray-500 rounded-full mb-4 shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-2">
                  {hoursCount.toLocaleString()}
                </div>
                <p className="text-gray-300 font-medium">Hours of Learning</p>
              </div>
            </div>

            {/* Contributors */}
            <div 
              ref={el => counterRefs.current.contributors = el}
              className="backdrop-blur-lg bg-gray-900/30 rounded-2xl p-8 shadow-xl border border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-gray-500 rounded-full mb-4 shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-2">
                  {contributorsCount.toLocaleString()}
                </div>
                <p className="text-gray-300 font-medium">Community Contributors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Map */}
      <div className="relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-4">
              Our Learning Community
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Connecting learners across Tunisia and beyond, building bridges of knowledge and support.
            </p>
          </div>

          <div className="backdrop-blur-lg bg-gray-900/30 rounded-2xl p-8 shadow-xl border border-gray-700">
            <div className="relative w-full h-96 bg-gray-900/50 rounded-2xl overflow-hidden">
              {/* Simplified Tunisia Map Shape */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                <path
                  d="M35 25 L55 20 L65 25 L70 35 L65 45 L60 55 L55 70 L50 75 L45 70 L40 65 L35 55 L30 45 L25 35 Z"
                  fill="rgba(255, 255, 255, 0.05)"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="0.5"
                />
              </svg>

              {/* Community Location Pins */}
              {communityLocations.map((location, index) => (
                <div
                  key={location.name}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer animate-pulse"
                  style={{ left: `${location.x}%`, top: `${location.y}%` }}
                >
                  <div className="relative">
                    <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-gray-500 rounded-full shadow-lg"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-gradient-to-br from-red-500 to-gray-500 rounded-full animate-ping"></div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-200">{location.name}</div>
                      <div className="text-xs text-gray-400">{location.users} learners</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quote of the Day */}
      <div className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="backdrop-blur-lg bg-gray-900/30 rounded-2xl p-8 md:p-12 shadow-xl border border-gray-700 text-center">
            <Quote className="w-12 h-12 text-red-400 mx-auto mb-6" />
            
            <div className="relative h-32 md:h-24 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <blockquote className="text-lg md:text-xl text-gray-200 italic font-medium leading-relaxed px-4">
                    &quot;{quote.text}&quot;
                </blockquote>

              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-400 font-medium">
                — {quote.author}
                </p>
            </div>

            
           
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-red-600 to-gray-600 rounded-2xl p-8 md:p-12 shadow-xl text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Join Our Community?
            </h3>{/* Quote Navigation Dots */}
            <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Be part of a supportive learning environment where every achievement matters and every learner is valued.
            </p>
            <button className="bg-white text-red-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg">
              Join Hikma Learn Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityOverview;