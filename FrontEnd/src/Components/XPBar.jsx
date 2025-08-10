const XPBar = ({ xp, level }) => {
  const xpNeeded = level * 1000;
  const progress = Math.min(100, (xp / xpNeeded) * 100);

  return (
    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
      <div 
        className="bg-gradient-to-r from-red-500 to-yellow-500 h-4 rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${progress}%` }}
      ></div>
      <div className="text-xs text-center text-white mt-1">
        Level {level} • {xp}/{xpNeeded} XP
      </div>
    </div>
  );
};

export default XPBar;