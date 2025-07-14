import { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  GraduationCap, 
  MapPin, 
  CreditCard, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight,
  UserPlus,
  LogIn,
  School
} from 'lucide-react';

const AnimatedBackground = () => {
  const blobRefs = useRef([]);
  
  useEffect(() => {
    const initialPositions = [
      { x: -4, y: 0 },
      { x: -4, y: 0 },
      { x: 20, y: -8 },
      { x: 20, y: -8 },
    ];
    let requestId;

    const handleScroll = () => {
      const newScroll = window.pageYOffset;

      blobRefs.current.forEach((blob, index) => {
        if (blob) {
          const initialPos = initialPositions[index];
          const xOffset = Math.sin(newScroll / 100 + index * 0.5) * 340;
          const yOffset = Math.cos(newScroll / 100 + index * 0.5) * 40;
          const x = initialPos.x + xOffset;
          const y = initialPos.y + yOffset;

          blob.style.transform = `translate(${x}px, ${y}px)`;
          blob.style.transition = "transform 1.4s ease-out";
        }
      });

      requestId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(requestId);
    };
  }, []);

  return (
    <div className="fixed inset-0 animated-bg">
      <div className="absolute inset-0">
        <div
          ref={(ref) => (blobRefs.current[0] = ref)}
          className="absolute top-0 -left-4 md:w-96 md:h-96 w-72 h-72 bg-red-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15"
        />
        <div
          ref={(ref) => (blobRefs.current[1] = ref)}
          className="absolute top-0 -right-4 w-96 h-96 bg-rose-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15 hidden sm:block"
        />
        <div
          ref={(ref) => (blobRefs.current[2] = ref)}
          className="absolute -bottom-8 left-[-40%] md:left-20 w-96 h-96 bg-red-700 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15"
        />
        <div
          ref={(ref) => (blobRefs.current[3] = ref)}
          className="absolute -bottom-10 right-20 w-96 h-96 bg-gray-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 md:opacity-10 hidden sm:block"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]" />
    </div>
  );
};

// Input Field Component
const InputField = ({ icon: Icon, type, placeholder, value, onChange, required = false, options = null }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  if (options) {
    return (
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-red-400 transition-colors duration-300" />
        </div>
        <select
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 hover:border-red-400/30"
        >
          <option value="" disabled className="bg-gray-800 text-gray-400">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-800 text-white">
              {option.label}
            </option>
          ))}
        </select>
        <div className={`absolute inset-0 rounded-lg border-2 transition-all duration-300 pointer-events-none ${
          isFocused ? 'border-red-400/50 shadow-lg shadow-red-500/20' : 'border-transparent'
        }`} />
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-red-400 transition-colors duration-300" />
      </div>
      <input
        type={type === 'password' && showPassword ? 'text' : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full pl-10 pr-12 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 hover:border-red-400/30"
      />
      {type === 'password' && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-400 transition-colors duration-300"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      )}
      <div className={`absolute inset-0 rounded-lg border-2 transition-all duration-300 pointer-events-none ${
        isFocused ? 'border-red-400/50 shadow-lg shadow-red-500/20' : 'border-transparent'
      }`} />
    </div>
  );
};

// Sign In Component
const SignInComponent = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <InputField
        icon={Mail}
        type="email"
        placeholder="Email address"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        required
      />
      
      <InputField
        icon={Lock}
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        required
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center text-gray-300">
          <input type="checkbox" className="mr-2 rounded" />
          Remember me
        </label>
        <a href="#" className="text-red-400 hover:text-red-300 transition-colors">
          Forgot password?
        </a>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
      >
        Sign In
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// Sign Up Component
const SignUpComponent = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cin: '',
    email: '',
    phone: '',
    school: '',
    grade: '',
    region: '',
    password: '',
    confirmPassword: ''
  });

  const regions = [
    { value: 'tunis', label: 'Tunis' },
    { value: 'ariana', label: 'Ariana' },
    { value: 'ben_arous', label: 'Ben Arous' },
    { value: 'manouba', label: 'Manouba' },
    { value: 'nabeul', label: 'Nabeul' },
    { value: 'zaghouan', label: 'Zaghouan' },
    { value: 'bizerte', label: 'Bizerte' },
    { value: 'beja', label: 'Béja' },
    { value: 'jendouba', label: 'Jendouba' },
    { value: 'kef', label: 'Le Kef' },
    { value: 'siliana', label: 'Siliana' },
    { value: 'kairouan', label: 'Kairouan' },
    { value: 'kasserine', label: 'Kasserine' },
    { value: 'sidi_bouzid', label: 'Sidi Bouzid' },
    { value: 'sousse', label: 'Sousse' },
    { value: 'monastir', label: 'Monastir' },
    { value: 'mahdia', label: 'Mahdia' },
    { value: 'sfax', label: 'Sfax' },
    { value: 'gafsa', label: 'Gafsa' },
    { value: 'tozeur', label: 'Tozeur' },
    { value: 'kebili', label: 'Kebili' },
    { value: 'gabes', label: 'Gabès' },
    { value: 'medenine', label: 'Médenine' },
    { value: 'tataouine', label: 'Tataouine' }
  ];

  const grades = [
    { value: '1', label: '1st Grade' },
    { value: '2', label: '2nd Grade' },
    { value: '3', label: '3rd Grade' },
    { value: '4', label: '4th Grade' },
    { value: '5', label: '5th Grade' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InputField
          icon={User}
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          required
        />
        <InputField
          icon={User}
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          required
        />
      </div>

      <InputField
        icon={CreditCard}
        type="text"
        placeholder="CIN (National ID)"
        value={formData.cin}
        onChange={(e) => handleInputChange('cin', e.target.value)}
        required
      />

      <InputField
        icon={Mail}
        type="email"
        placeholder="Email address"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        required
      />

      <InputField
        icon={Phone}
        type="tel"
        placeholder="Phone number"
        value={formData.phone}
        onChange={(e) => handleInputChange('phone', e.target.value)}
        required
      />

      <InputField
        icon={School}
        type="text"
        placeholder="School/Institution"
        value={formData.school}
        onChange={(e) => handleInputChange('school', e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <InputField
          icon={GraduationCap}
          type="select"
          placeholder="Select Grade"
          value={formData.grade}
          onChange={(e) => handleInputChange('grade', e.target.value)}
          options={grades}
          required
        />
        <InputField
          icon={MapPin}
          type="select"
          placeholder="Select Region"
          value={formData.region}
          onChange={(e) => handleInputChange('region', e.target.value)}
          options={regions}
          required
        />
      </div>

      <InputField
        icon={Lock}
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        required
      />

      <InputField
        icon={Lock}
        type="password"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
        required
      />

      <div className="flex items-center text-sm text-gray-300">
        <input type="checkbox" className="mr-2 rounded" required />
        <span>
          I agree to the{' '}
          <a href="#" className="text-red-400 hover:text-red-300 transition-colors">
            Terms & Conditions
          </a>{' '}
          and{' '}
          <a href="#" className="text-red-400 hover:text-red-300 transition-colors">
            Privacy Policy
          </a>
        </span>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
      >
        Create Account
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// Main Auth Page Container
const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleToggle = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsSignUp(!isSignUp);
      setIsTransitioning(false);
    }, 300);
  };

  const handleSignInSubmit = (data) => {
    console.log('Sign In Data:', data);
    // Handle sign in logic here
    alert('Sign in successful! Check console for data.');
  };

  const handleSignUpSubmit = (data) => {
    console.log('Sign Up Data:', data);
    // Handle sign up logic here
    alert('Sign up successful! Check console for data.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Main Container */}
      <div className="z-10 relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block relative group mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-red-400 via-red-500 to-red-700 leading-tight drop-shadow-2xl">
              HIKMA{' '}
              <span className="bg-gradient-to-br from-rose-300 via-red-500 to-red-800 bg-clip-text text-transparent drop-shadow-lg">
                LEARN
              </span>
            </h1>
          </div>
          <p className="text-gray-300 flex items-center justify-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-red-400" />
            {isSignUp ? 'Create your account' : 'Welcome back'}
            <Sparkles className="w-5 h-5 text-red-400" />
          </p>
        </div>

        {/* Form Container */}
        <div className={`bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-lg transition-all duration-500 transform ${
          isTransitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
        }`}>
          {/* Toggle Buttons */}
          <div className="flex bg-gray-800/50 rounded-t-2xl overflow-hidden">
            <button
              onClick={() => !isSignUp && handleToggle()}
              className={`flex-1 py-4 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                !isSignUp
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => isSignUp && handleToggle()}
              className={`flex-1 py-4 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                isSignUp
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {!isSignUp ? (
              <SignInComponent onSubmit={handleSignInSubmit} />
            ) : (
              <SignUpComponent onSubmit={handleSignUpSubmit} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={handleToggle}
              className="text-red-400 hover:text-red-300 transition-colors font-semibold"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;