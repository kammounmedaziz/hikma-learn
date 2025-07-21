import { useState, useCallback, memo ,useEffect} from 'react';
import PropTypes from 'prop-types';
import {
  Shield,
  User,
  Bell,
  Palette,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Settings,
  Save,
  RefreshCw
} from 'lucide-react';

// Utility functions
const checkPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return strength;
};

const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case 0:
    case 1: return 'bg-red-500';
    case 2: return 'bg-orange-500';
    case 3: return 'bg-yellow-500';
    case 4: return 'bg-blue-500';
    case 5: return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getPasswordStrengthText = (strength) => {
  switch (strength) {
    case 0:
    case 1: return 'Very Weak';
    case 2: return 'Weak';
    case 3: return 'Fair';
    case 4: return 'Good';
    case 5: return 'Strong';
    default: return '';
  }
};

// PlaceholderTab component
const PlaceholderTab = memo(({ title, description }) => (
  <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 border border-white/20 text-center">
    <div className="mb-4">
      <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
        <Settings className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-300 mb-4">{description}</p>
      <p className="text-sm text-gray-400">This section is under development</p>
    </div>
  </div>
));

PlaceholderTab.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

PlaceholderTab.displayName = 'PlaceholderTab';

// SecuritySettings component
const SecuritySettings = memo(({
  showCurrentPassword, 
  showNewPassword, 
  showConfirmPassword,
  passwordForm,
  passwordStrength,
  isChangingPassword,
  passwordMessage,
  handlePasswordChange,
  handlePasswordSubmit,
  setShowCurrentPassword,
  setShowNewPassword,
  setShowConfirmPassword
}) => (
  <div className="space-y-8">
    <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <Lock className="w-5 h-5 mr-2 text-red-400" />
        Change Password
      </h3>

      <form className="space-y-6" onSubmit={handlePasswordSubmit}>
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all duration-300"
              placeholder="Enter your current password"
              required
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
            >
              {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all duration-300"
              placeholder="Enter your new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {passwordForm.newPassword && (
            <div className="mt-2">
              <div className="flex items-center space-x-2 mb-1">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${passwordStrength >= 3 ? 'text-green-400' : 'text-red-400'}`}>
                  {getPasswordStrengthText(passwordStrength)}
                </span>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div className="flex items-center space-x-2">
                  {passwordForm.newPassword.length >= 8 ?
                    <Check className="w-3 h-3 text-green-400" /> :
                    <X className="w-3 h-3 text-red-400" />
                  }
                  <span>At least 8 characters</span>
                </div>
                <div className="flex items-center space-x-2">
                  {/[A-Z]/.test(passwordForm.newPassword) ?
                    <Check className="w-3 h-3 text-green-400" /> :
                    <X className="w-3 h-3 text-red-400" />
                  }
                  <span>Contains uppercase letter</span>
                </div>
                <div className="flex items-center space-x-2">
                  {/[0-9]/.test(passwordForm.newPassword) ?
                    <Check className="w-3 h-3 text-green-400" /> :
                    <X className="w-3 h-3 text-red-400" />
                  }
                  <span>Contains number</span>
                </div>
                <div className="flex items-center space-x-2">
                  {/[^A-Za-z0-9]/.test(passwordForm.newPassword) ?
                    <Check className="w-3 h-3 text-green-400" /> :
                    <X className="w-3 h-3 text-red-400" />
                  }
                  <span>Contains special character</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all duration-300"
              placeholder="Confirm your new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
            <p className="mt-1 text-sm text-red-400">Passwords do not match</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isChangingPassword || passwordStrength < 3 || passwordForm.newPassword !== passwordForm.confirmPassword}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
          >
            {isChangingPassword ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Changing Password...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Change Password
              </>
            )}
          </button>

          {passwordMessage && (
            <div className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
              passwordMessage.includes('successfully') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {passwordMessage.includes('successfully') ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              {passwordMessage}
            </div>
          )}
        </div>
      </form>
    </div>

    {/* Recent Activity */}
    <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <RefreshCw className="w-5 h-5 mr-2 text-blue-400" />
        Recent Security Activity
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
          <div>
            <p className="text-white font-medium">Password last changed</p>
            <p className="text-gray-400 text-sm">March 15, 2024 at 2:34 PM</p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
          <div>
            <p className="text-white font-medium">Last successful login</p>
            <p className="text-gray-400 text-sm">Today at 8:42 AM from Chrome on Windows</p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
          <div>
            <p className="text-white font-medium">Failed login attempt</p>
            <p className="text-gray-400 text-sm">Yesterday at 11:23 PM from unknown device</p>
          </div>
          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
));

SecuritySettings.propTypes = {
  showCurrentPassword: PropTypes.bool.isRequired,
  showNewPassword: PropTypes.bool.isRequired,
  showConfirmPassword: PropTypes.bool.isRequired,
  passwordForm: PropTypes.shape({
    currentPassword: PropTypes.string,
    newPassword: PropTypes.string,
    confirmPassword: PropTypes.string
  }).isRequired,
  passwordStrength: PropTypes.number.isRequired,
  isChangingPassword: PropTypes.bool.isRequired,
  passwordMessage: PropTypes.string.isRequired,
  handlePasswordChange: PropTypes.func.isRequired,
  handlePasswordSubmit: PropTypes.func.isRequired,
  setShowCurrentPassword: PropTypes.func.isRequired,
  setShowNewPassword: PropTypes.func.isRequired,
  setShowConfirmPassword: PropTypes.func.isRequired
};

SecuritySettings.displayName = 'SecuritySettings';


const TeacherSettings = () => {
  const [activeTab, setActiveTab] = useState('security');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
useEffect(() => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    if (userId && username) {
      setCurrentUser({ id: userId, username });
    }
  }, []);
  const settingsTabs = [
    { id: 'security', label: 'Security', icon: Shield, description: 'Password and security settings' },
    { id: 'profile', label: 'Profile', icon: User, description: 'Personal information and preferences' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Notification preferences' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and display settings' },
    { id: 'language', label: 'Language', icon: Globe, description: 'Language and region settings' },
  ];

  

  const handlePasswordChange = useCallback((field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    if (field === 'newPassword') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  }, []);

  const handlePasswordSubmit = useCallback(async (e) => {
    e.preventDefault();
    setPasswordMessage('');


  // Validation checks
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('Passwords do not match');
      return;
    }

  if (passwordStrength < 3) {
      setPasswordMessage('Password is too weak');
      return;
    }

  setIsChangingPassword(true);

  try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        throw new Error('Session expired. Please login again.');
      }

      console.log('Attempting password change for user:', userId);
      
      const response = await fetch(`http://127.0.0.1:8000/api/change_password/${userId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
          confirm_password: passwordForm.confirmPassword,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Password change failed');
      }

      setPasswordMessage('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Optionally force re-login after password change
      // localStorage.removeItem('token');
      // localStorage.removeItem('userId');
      
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordMessage(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  }, [passwordForm, passwordStrength]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'security':
        return (
          <SecuritySettings 
            showCurrentPassword={showCurrentPassword}
            showNewPassword={showNewPassword}
            showConfirmPassword={showConfirmPassword}
            passwordForm={passwordForm}
            passwordStrength={passwordStrength}
            isChangingPassword={isChangingPassword}
            passwordMessage={passwordMessage}
            handlePasswordChange={handlePasswordChange}
            handlePasswordSubmit={handlePasswordSubmit}
            setShowCurrentPassword={setShowCurrentPassword}
            setShowNewPassword={setShowNewPassword}
            setShowConfirmPassword={setShowConfirmPassword}
          />
        );
      case 'profile':
        return <PlaceholderTab title="Profile Settings" description="Manage your personal information and teaching preferences" />;
      case 'notifications':
        return <PlaceholderTab title="Notification Settings" description="Configure how you receive notifications and alerts" />;
      case 'appearance':
        return <PlaceholderTab title="Appearance Settings" description="Customize the look and feel of your dashboard" />;
      case 'language':
        return <PlaceholderTab title="Language Settings" description="Change your language and regional preferences" />;
      default:
        return (
          <SecuritySettings 
            showCurrentPassword={showCurrentPassword}
            showNewPassword={showNewPassword}
            showConfirmPassword={showConfirmPassword}
            passwordForm={passwordForm}
            passwordStrength={passwordStrength}
            isChangingPassword={isChangingPassword}
            passwordMessage={passwordMessage}
            handlePasswordChange={handlePasswordChange}
            handlePasswordSubmit={handlePasswordSubmit}
            setShowCurrentPassword={setShowCurrentPassword}
            setShowNewPassword={setShowNewPassword}
            setShowConfirmPassword={setShowConfirmPassword}
          />
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-4">
          Settings
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Manage your account preferences and security settings
        </p>
      </div>

      {/* Settings Tabs */}
      <div className="backdrop-blur-md bg-white/10 rounded-xl border border-white/20 p-1">
        <div className="flex flex-wrap gap-1">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-500/20 to-gray-500/20 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
                title={tab.description}
              >
                <Icon size={18} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TeacherSettings;