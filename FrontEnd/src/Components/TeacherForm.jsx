import { useState } from 'react';
import {
  User, Mail, Phone, Calendar, FileText, GraduationCap,
  Edit, UserPlus, Save, X
} from 'lucide-react';

const TeacherForm = ({ onSubmit, onCancel, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    cin: '',
    phone_num: '',
    birth_date: '',
    fields: [],
    user_type: 'teacher',
  });

  const [errors, setErrors] = useState({});

  const availableFields = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'French', 'English',
    'Arabic', 'History', 'Geography', 'Philosophy', 'Computer Science',
    'Literature', 'Art', 'Music', 'Physical Education', 'Economics'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleFieldToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.includes(field)
        ? prev.fields.filter(f => f !== field)
        : [...prev.fields, field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.cin.trim()) newErrors.cin = 'CIN is required';
    if (formData.fields.length === 0) newErrors.fields = 'Select at least one subject';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.cin && !/^\d{8}$/.test(formData.cin)) newErrors.cin = 'CIN must be 8 digits';
    if (formData.phone_num && !/^\d{8}$/.test(formData.phone_num)) newErrors.phone_num = 'Phone number must be 8 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await onSubmit(formData); // Ensure async call completes before React re-renders
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    }
  };


  const config = {
    title: mode === 'edit' ? 'Edit Teacher' : 'Add New Teacher',
    icon: mode === 'edit' ? Edit : UserPlus,
    buttonText: mode === 'edit' ? 'Update Teacher' : 'Create Teacher',
    buttonColor: mode === 'edit' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700',
  };
  const IconComponent = config.icon;

  return (
    <form onSubmit={handleSubmit} className="backdrop-blur-lg bg-gray-900/30 rounded-2xl p-8 shadow-xl border border-gray-700 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-gray-500 rounded-full mr-4 shadow-lg">
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400">
            {config.title}
          </h2>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['first_name', 'last_name'].map((field, i) => (
          <div key={i}>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              <User className="w-4 h-4 inline mr-2" />
              {field === 'first_name' ? 'First Name *' : 'Last Name *'}
            </label>
            <input
              type="text"
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder={`Enter ${field.replace('_', ' ')}`}
              className={`w-full p-3 rounded-lg bg-gray-800/50 border ${
                errors[field] ? 'border-red-500' : 'border-gray-600'
              } text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500`}
            />
            {errors[field] && <p className="text-red-400 text-sm mt-1">{errors[field]}</p>}
          </div>
        ))}
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="teacher@example.com"
            className={`w-full p-3 rounded-lg bg-gray-800/50 border ${
              errors.email ? 'border-red-500' : 'border-gray-600'
            } text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500`}
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone_num}
            onChange={(e) => handleInputChange('phone_num', e.target.value)}
            placeholder="12345678"
            className={`w-full p-3 rounded-lg bg-gray-800/50 border ${
              errors.phone_num ? 'border-red-500' : 'border-gray-600'
            } text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500`}
          />
          {errors.phone_num && <p className="text-red-400 text-sm mt-1">{errors.phone_num}</p>}
        </div>
      </div>

      {/* CIN & Birth Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            CIN (National ID) *
          </label>
          <input
            type="text"
            value={formData.cin}
            maxLength="8"
            onChange={(e) => handleInputChange('cin', e.target.value)}
            placeholder="12345678"
            className={`w-full p-3 rounded-lg bg-gray-800/50 border ${
              errors.cin ? 'border-red-500' : 'border-gray-600'
            } text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500`}
          />
          {errors.cin && <p className="text-red-400 text-sm mt-1">{errors.cin}</p>}
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Birth Date
          </label>
          <input
            type="date"
            value={formData.birth_date}
            onChange={(e) => handleInputChange('birth_date', e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-600 text-white focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Fields */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-4">
          <GraduationCap className="w-4 h-4 inline mr-2" />
          Teaching Subjects *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableFields.map((field) => (
            <label
              key={field}
              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                formData.fields.includes(field)
                  ? 'bg-red-600/20 border-red-500 text-red-300'
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={formData.fields.includes(field)}
                onChange={() => handleFieldToggle(field)}
              />
              <span className="text-sm font-medium">{field}</span>
            </label>
          ))}
        </div>
        {errors.fields && <p className="text-red-400 text-sm mt-2">{errors.fields}</p>}
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4 pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={`px-8 py-3 rounded-lg ${config.buttonColor} text-white font-medium transition hover:scale-105 shadow-lg flex items-center`}
        >
          <Save className="w-5 h-5 mr-2" />
          {config.buttonText}
        </button>
      </div>
    </form>
  );
};

export default TeacherForm;
