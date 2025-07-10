import { useRef } from 'react';
import { Award, ArrowRight, Sparkles } from 'lucide-react';
import PropTypes from 'prop-types';
import helenImage from '../assets/media/helen,.png'; // Replace with your actual path

const HelenKellerCard = ({
  learnMoreUrl = "https://en.wikipedia.org/wiki/Helen_Keller",
  avatarImage = helenImage
}) => {
  const synthRef = useRef(window.speechSynthesis);

  const person = {
    name: "Helen Keller",
    challenge: "Deafblind",
    achievement: "Humanitarian & Author",
    description:
      "Overcoming the dual challenge of being deaf and blind, Helen Keller became a world-renowned speaker and author. She devoted her life to humanitarian causes, especially advocating for people with disabilities and women's rights."
  };

  const handleSpeak = () => {
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(`${person.description} Learn more`);
    utterance.lang = "en-US";
    utterance.rate = 1;
    synthRef.current.speak(utterance);
  };

  const handleStop = () => {
    synthRef.current.cancel();
  };

  const handleCardClick = () => {
    window.open(learnMoreUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        onMouseEnter={handleSpeak}
        onMouseLeave={handleStop}
        onClick={handleCardClick}
        className="relative bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.03] hover:rotate-1 overflow-hidden max-w-lg mx-auto group cursor-pointer"
      >
        {/* Glowing border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Sparkle */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start gap-6 mb-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-400/30 to-blue-400/30 border-2 border-dashed border-white/40 rounded-2xl w-20 h-20 flex items-center justify-center group-hover:border-yellow-400/60 transition-colors duration-300 overflow-hidden">
                <img
                  src={avatarImage}
                  alt={person.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2 group-hover:from-yellow-200 group-hover:to-white transition-all duration-300">
                {person.name}
              </h3>
              <p className="text-cyan-300 text-sm font-medium px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-400/30 inline-block">
                {person.challenge}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-400/30 group-hover:border-yellow-400/50 transition-colors duration-300">
            <div className="relative">
              <Award className="w-6 h-6 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300" />
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <p className="text-yellow-100 font-semibold text-lg">{person.achievement}</p>
          </div>

          <div className="relative mb-6">
            <div className="absolute -left-2 -top-2 text-6xl text-purple-400/20 font-serif">"</div>
            <p className="text-gray-200 leading-relaxed text-lg font-medium pl-6 pr-4 italic">
              {person.description}
            </p>
            <div className="absolute -right-2 -bottom-2 text-6xl text-purple-400/20 font-serif">"</div>
          </div>

          <div className="flex justify-end">
            <div className="group/btn flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 group-hover:from-indigo-500/50 group-hover:to-purple-500/50 text-white font-semibold rounded-xl border border-indigo-400/30 group-hover:border-indigo-400/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-indigo-500/25 transform group-hover:-translate-y-0.5">
              <span className="bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
                Learn more
              </span>
              <ArrowRight className="w-5 h-5 text-indigo-300 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>

        {/* Decorative glow */}
        <div className="absolute top-8 left-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-2xl" />
        </div>
        <div className="absolute bottom-8 right-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};

HelenKellerCard.propTypes = {
  learnMoreUrl: PropTypes.string,
  avatarImage: PropTypes.string
};

export default HelenKellerCard;
