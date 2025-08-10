import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RefreshCw, Clock, Zap } from 'lucide-react';

const PomodoroTimer = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpAnimation, setShowXpAnimation] = useState(false);

  const handleTimerComplete = useCallback(() => {
    setIsActive(false);
    
    // Send session to backend
    fetch('/api/pomodoro/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration: isBreak ? minutes : 25 })
    })
    .then(res => res.json())
    .then(data => {
      setXpEarned(prev => prev + data.xp_earned);
      setShowXpAnimation(true);
      setTimeout(() => setShowXpAnimation(false), 2000);
    });

    if (!isBreak) {
      setSessionCount(prev => prev + 1);
      setMinutes((sessionCount % 3 === 0 && sessionCount > 0) ? 15 : 5);
      setIsBreak(true);
    } else {
      setMinutes(25);
      setIsBreak(false);
    }
  }, [isBreak, sessionCount, minutes]);

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            handleTimerComplete();
          } else {
            setMinutes(prev => prev - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(prev => prev - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, handleTimerComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(isBreak ? 5 : 25);
    setSeconds(0);
  };

  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center">
          <Clock className="w-6 h-6 mr-2 text-red-400" />
          Focus Timer
        </h2>
        <p className="text-gray-400 mt-2">
          {isBreak ? 'Take a break!' : 'Time to focus!'}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="text-7xl font-bold text-white mb-6">
          {formatTime(minutes)}:{formatTime(seconds)}
        </div>
        
        {showXpAnimation && (
          <div className="animate-bounce text-yellow-400 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-1" />
            +{xpEarned} XP earned today!
          </div>
        )}
        
        <div className="flex space-x-4">
          <button
            onClick={toggleTimer}
            className={`px-6 py-3 rounded-full flex items-center ${
              isActive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white transition-all`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start
              </>
            )}
          </button>
          
          <button
            onClick={resetTimer}
            className="px-6 py-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center transition-all"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Reset
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400">
        <p>Completed sessions: {sessionCount}</p>
        <p className="text-sm mt-2">
          {isBreak ? 'Next: Work session (25:00)' : 'Next: Short break (05:00)'}
        </p>
      </div>
    </div>
  );
};

export default PomodoroTimer;