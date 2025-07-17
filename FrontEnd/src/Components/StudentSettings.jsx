import { useState, useCallback, memo, useEffect } from 'react';
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
  RefreshCw,
  GraduationCap
} from 'lucide-react';

const availableDisabilities = [
  'Visual Impairment',
  'Hearing Impairment',
  'Mobility Impairment',
  'Learning Disability',
  'Autism Spectrum',
];

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
    case 0: case 1: return 'bg-red-500';
    case 2: return 'bg-orange-500';
    case 3: return 'bg-yellow-500';
    case 4: return 'bg-blue-500';
    case 5: return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getPasswordStrengthText = (strength) => {
  switch (strength) {
    case 0: case 1: return 'Very Weak';
    case 2: return 'Weak';
    case 3: return 'Fair';
    case 4: return 'Good';
    case 5: return 'Strong';
    default: return '';
  }
};

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

const DisabilitiesSettings = memo(({ 
  disabilities, 
  handleDisabilityToggle,
  isUpdatingDisabilities,
  updateMessage,
  handleDisabilitySubmit
}) => (
  <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
      <GraduationCap className="w-5 h-5 mr-2 text-blue-400" />
      Disabilities Settings
    </h3>
    
    <div className="space-y-6">
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-4">
          Select your disabilities (if any)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableDisabilities.map((disability) => (
            <label
              key={disability}
              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                disabilities.includes(disability)
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={disabilities.includes(disability)}
                onChange={() => handleDisabilityToggle(disability)}
              />
              <span className="text-sm font-medium">{disability}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleDisabilitySubmit}
          disabled={isUpdatingDisabilities}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
        >
          {isUpdatingDisabilities ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {updateMessage && (
        <div className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
          updateMessage.includes('successfully') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {updateMessage.includes('successfully') ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <X className="w-4 h-4 mr-2" />
          )}
          {updateMessage}
        </div>
      )}
    </div>
  </div>
));

DisabilitiesSettings.propTypes = {
  disabilities: PropTypes.array.isRequired,
  handleDisabilityToggle: PropTypes.func.isRequired,
  handleDisabilitySubmit: PropTypes.func.isRequired,
  isUpdatingDisabilities: PropTypes.bool.isRequired,
  updateMessage: PropTypes.string.isRequired
};

DisabilitiesSettings.displayName = 'DisabilitiesSettings';

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
                {/* Password requirements indicators */}
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
        {/* Activity items */}
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

const StudentSettings = () => {
  const [disabilities, setDisabilities] = useState([]);
  const [isUpdatingDisabilities, setIsUpdatingDisabilities] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
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
    { id: 'disabilities', label: 'Disabilities', icon: GraduationCap, description: 'Manage your disability information' },
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
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordMessage(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  }, [passwordForm, passwordStrength]);

  const handleDisabilityToggle = useCallback((disability) => {
    setDisabilities(prev => 
      prev.includes(disability)
        ? prev.filter(d => d !== disability)
        : [...prev, disability]
    );
  }, []);

  const handleDisabilitySubmit = useCallback(async () => {
    setIsUpdatingDisabilities(true);
    setUpdateMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        throw new Error('Session expired. Please login again.');
      }

      const response = await fetch(`http://127.0.0.1:8000/api/update_disabilities/${userId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ disabilities }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update disabilities');
      }

      setUpdateMessage('Disabilities updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      setUpdateMessage(error.message || 'Failed to update disabilities');
    } finally {
      setIsUpdatingDisabilities(false);
    }
  }, [disabilities]);

  useEffect(() => {
    const fetchDisabilities = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) return;

        const response = await fetch(`http://127.0.0.1:8000/api/update_disabilities/${userId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setDisabilities(data.disabilities || []);
        }
      } catch (error) {
        console.error('Failed to fetch disabilities:', error);
      }
    };

    fetchDisabilities();
  }, []);

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
      case 'disabilities':
        return (
          <DisabilitiesSettings
            disabilities={disabilities}
            handleDisabilityToggle={handleDisabilityToggle}
            handleDisabilitySubmit={handleDisabilitySubmit}
            isUpdatingDisabilities={isUpdatingDisabilities}
            updateMessage={updateMessage}
          />
        );
      case 'profile':
        return <PlaceholderTab title="Profile Settings" description="Manage your personal information and preferences" />;
      case 'notifications':
        return <PlaceholderTab title="Notification Settings" description="Configure how you receive notifications" />;
      case 'appearance':
        return <PlaceholderTab title="Appearance Settings" description="Customize the look and feel" />;
      case 'language':
        return <PlaceholderTab title="Language Settings" description="Change language and region" />;
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

      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default StudentSettings;