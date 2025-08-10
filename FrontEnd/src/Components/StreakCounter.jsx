import { Flame } from 'lucide-react';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const StreakCounter = ({ streak }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (streak > 1) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [streak]);

  return (
    <div className={`flex items-center ${animate ? 'animate-pulse' : ''}`}>
      <div className="text-2xl font-bold text-yellow-400 flex items-center">
        {streak}
        <Flame className="w-5 h-5 ml-1" />
      </div>
      <span className="ml-2 text-sm text-gray-300">day streak</span>
    </div>
  );
};
StreakCounter.propTypes = {
  streak: PropTypes.number.isRequired,
};


export default StreakCounter;