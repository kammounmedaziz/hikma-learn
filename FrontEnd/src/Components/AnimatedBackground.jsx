const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-red-500/10 rounded-full blur-2xl animate-spin-slower"></div>
  </div>
);

export default AnimatedBackground;