import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Phone, GraduationCap, MapPin, CreditCard,
  Eye, EyeOff, Sparkles, ArrowRight, UserPlus, LogIn, School, Users
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
    username: '',
    password: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Login failed');
      }

      // Store the tokens and user data in localStorage
      localStorage.setItem('token', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('username', data.username);
      localStorage.setItem('userType', data.user_type);
      
      // If your backend provides user ID, store that too
      if (data.user_id) {
        localStorage.setItem('userId', data.user_id);
      }

      console.log('Login successful, tokens stored:', {
        token: data.access,
        refreshToken: data.refresh,
        username: data.username
      });

      onSubmit(data);
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <InputField 
        icon={User} 
        type="text" 
        placeholder="Username" 
        value={formData.username} 
        onChange={e => handleInputChange('username', e.target.value)} 
        required 
      />
      <InputField 
        icon={Lock} 
        type="password" 
        placeholder="Password" 
        value={formData.password} 
        onChange={e => handleInputChange('password', e.target.value)} 
        required 
      />
      <button 
        onClick={handleSubmit} 
        className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg flex items-center justify-center gap-2"
      >
        Sign In <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};



// Sign Up Component
const SignUpComponent = ({ onSubmit }) => {
  const [formData, setFormData] = useState({

    user_type: 'student',
    first_name: '',
    last_name: '',
    cin: '',
    email: '',
    phone_num: '',
    birth_date: '',
    password: '',
    confirm_password: '',
  });

  const handleInputChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) return alert('Passwords do not match');
    
    const payload = { ...formData };
    delete payload.confirm_password;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(data));
      onSubmit(data);
    } catch (error) {
      alert("Registration failed:\n" + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InputField icon={User} type="text" placeholder="First Name" value={formData.first_name} onChange={e => handleInputChange('first_name', e.target.value)} required />
        <InputField icon={User} type="text" placeholder="Last Name" value={formData.last_name} onChange={e => handleInputChange('last_name', e.target.value)} required />
      </div>
      <InputField icon={CreditCard} type="text" placeholder="CIN" value={formData.cin} onChange={e => handleInputChange('cin', e.target.value)} required />
      <InputField icon={Mail} type="email" placeholder="Email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} required />
      <InputField icon={Phone} type="tel" placeholder="Phone" value={formData.phone_num} onChange={e => handleInputChange('phone_num', e.target.value)} required />
      <InputField icon={MapPin} type="date" placeholder="Birth Date" value={formData.birth_date} onChange={e => handleInputChange('birth_date', e.target.value)} required />
      <InputField icon={Lock} type="password" placeholder="Password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} required />
      <InputField icon={Lock} type="password" placeholder="Confirm Password" value={formData.confirm_password} onChange={e => handleInputChange('confirm_password', e.target.value)} required />
      <button onClick={handleSubmit} className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg flex items-center justify-center gap-2">
        Create Account <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// Main Auth Page Container
const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => setIsSignUp(!isSignUp);

  
  const handleSignInSubmit = data => {
    const userType = data.user_type;
    if (userType === 'student') {
    navigate('/StudydDashboard');
  } else if (userType === 'teacher') {
    navigate('/TeacherDashboard');
  } else if (userType === 'admin') {
    navigate('/AdminDashboard');
  } else {

    alert('Unknown user type');
  }
  };



  const handleSignUpSubmit = data => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <AnimatedBackground />
      <div className="z-10 relative w-full max-w-md">
        <div className="text-center mb-8">
          <div>
                    <img data-aos="fade-in" 
                      data-aos-delay="100" 
                      className="inline-block px-2 bg-gradient-to-r from-indigo-600 to-red-600 bg-clip-text text-transparent"
                      src="src\assets\media\text.png" 
                      alt="Welcome to"
                      loading="lazy"
                      />

                  </div>
          
        </div>
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-lg">
          <div className="flex bg-gray-800/50 rounded-t-2xl overflow-hidden">
            <button onClick={() => !isSignUp && handleToggle()} className={`flex-1 py-4 px-6 ${!isSignUp ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 'text-gray-400'}`}> <LogIn className="w-4 h-4" /> Sign In </button>
            <button onClick={() => isSignUp && handleToggle()} className={`flex-1 py-4 px-6 ${isSignUp ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 'text-gray-400'}`}> <UserPlus className="w-4 h-4" /> Sign Up </button>
          </div>
          <div className="p-8">
            {isSignUp ? <SignUpComponent onSubmit={handleSignUpSubmit} /> : <SignInComponent onSubmit={handleSignInSubmit} />}
          </div>
        </div>
        <div className="text-center mt-8 text-gray-400">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={handleToggle} className="text-red-400 font-semibold">{isSignUp ? 'Sign In' : 'Sign Up'}</button>
          </p>
        </div>
      </div>
    </div>
  );
};
export default AuthPage;