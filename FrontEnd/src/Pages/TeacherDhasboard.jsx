<div className="flex justify-end space-x-4 pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition-all duraimport { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, FileText, GraduationCap, Edit, Trash2, Plus, UserPlus, Save, X } from 'lucide-react';

// Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 animated-bg">
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
        <div className="absolute -bottom-10 right-20 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>
  );
};

const TeacherForm = ({ initialData = {}, onSubmit, onCancel, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    cin: '',
    phone_num: '',
    birth_date: '',
    fields: [],
    user_type: 'teacher'
  });

  const [errors, setErrors] = useState({});

  // Available subject fields
  const availableFields = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'French', 'English',
    'Arabic', 'History', 'Geography', 'Philosophy', 'Computer Science',
    'Literature', 'Art', 'Music', 'Physical Education', 'Economics'
  ];

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        email: initialData.email || '',
        cin: initialData.cin || '',
        phone_num: initialData.phone_num || '',
        birth_date: initialData.birth_date || '',
        fields: initialData.fields || [],
        user_type: 'teacher'
      });
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
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
    if (formData.fields.length === 0) newErrors.fields = 'At least one subject field is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // CIN validation (assuming 8 digits for Tunisia)
    if (formData.cin && !/^\d{8}$/.test(formData.cin)) {
      newErrors.cin = 'CIN must be 8 digits';
    }
    
    // Phone validation
    if (formData.phone_num && !/^\d{8}$/.test(formData.phone_num)) {
      newErrors.phone_num = 'Phone number must be 8 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getModeConfig = () => {
    switch (mode) {
      case 'edit':
        return {
          title: 'Edit Teacher',
          icon: Edit,
          buttonText: 'Update Teacher',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'add':
      default:
        return {
          title: 'Add New Teacher',
          icon: UserPlus,
          buttonText: 'Create Teacher',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
    }
  };

  const config = getModeConfig();
  const IconComponent = config.icon;

  return (
    <div className="backdrop-blur-lg bg-gray-900/30 rounded-2xl p-8 shadow-xl border border-gray-700 max-w-4xl mx-auto">
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
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              <User className="w-4 h-4 inline mr-2" />
              First Name *
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              className={`w-full p-3 rounded-lg bg-gray-800/50 border ${
                errors.first_name ? 'border-red-500' : 'border-gray-600'
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter first name"
            />
            {errors.first_name && (
              <p className="text-red-400 text-sm mt-1">{errors.first_name}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Last Name *
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              className={`w-full p-3 rounded-lg bg-gray-800/50 border ${
                errors.last_name ? 'border-red-500' : 'border-gray-600'
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter last name"
            />
            {errors.last_name && (
              <p className="text-red-400 text-sm mt-1">{errors.last_name}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
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
              className={`w-full p-3 rounded-lg bg-gray-800/50 border ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
              placeholder="teacher@example.com"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
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
              className={`w-full p-3 rounded-lg bg-gray-800/50 border ${
                errors.phone_num ? 'border-red-500' : 'border-gray-600'
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
              placeholder="12345678"
            />
            {errors.phone_num && (
              <p className="text-red-400 text-sm mt-1">{errors.phone_num}</p>
            )}
          </div>
        </div>

        {/* ID and Birth Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              CIN (National ID) *
            </label>
            <input
              type="text"
              value={formData.cin}
              onChange={(e) => handleInputChange('cin', e.target.value)}
              className={`w-full p-3 rounded-lg bg-gray-800/50 border ${
                errors.cin ? 'border-red-500' : 'border-gray-600'
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
              placeholder="12345678"
              maxLength="8"
            />
            {errors.cin && (
              <p className="text-red-400 text-sm mt-1">{errors.cin}</p>
            )}
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
              className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Subject Fields */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-4">
            <GraduationCap className="w-4 h-4 inline mr-2" />
            Teaching Subjects *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableFields.map((field) => (
              <label
                key={field}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  formData.fields.includes(field)
                    ? 'bg-red-600/20 border-red-500 text-red-300'
                    : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50'
                } border`}
              >
                <input
                  type="checkbox"
                  checked={formData.fields.includes(field)}
                  onChange={() => handleFieldToggle(field)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{field}</span>
              </label>
            ))}
          </div>
          {errors.fields && (
            <p className="text-red-400 text-sm mt-2">{errors.fields}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition-all duration-200"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className={`px-8 py-3 rounded-lg ${config.buttonColor} text-white font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center`}
          >
            <Save className="w-5 h-5 mr-2" />
            {config.buttonText}
          </button>
        </div>
      </form>
    </div>
  );
};

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([
    {
      id: 1,
      first_name: 'Ahmed',
      last_name: 'Ben Salem',
      email: 'ahmed.bensalem@email.com',
      cin: '12345678',
      phone_num: '98765432',
      birth_date: '1985-06-15',
      fields: ['Mathematics', 'Physics'],
      user_type: 'teacher'
    },
    {
      id: 2,
      first_name: 'Fatima',
      last_name: 'Gharbi',
      email: 'fatima.gharbi@email.com',
      cin: '87654321',
      phone_num: '12345678',
      birth_date: '1990-03-22',
      fields: ['French', 'Literature'],
      user_type: 'teacher'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formMode, setFormMode] = useState('add');

  const handleSubmit = (teacherData) => {
    if (formMode === 'edit') {
      setTeachers(prev => prev.map(teacher => 
        teacher.id === editingTeacher.id 
          ? { ...teacherData, id: editingTeacher.id }
          : teacher
      ));
      setEditingTeacher(null);
    } else {
      const newTeacher = {
        ...teacherData,
        id: Date.now()
      };
      setTeachers(prev => [...prev, newTeacher]);
    }
    setShowForm(false);
    setFormMode('add');
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleDelete = (teacherId) => {
    setTeachers(prev => prev.filter(teacher => teacher.id !== teacherId));
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTeacher(null);
    setFormMode('add');
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-gray-200">
      <AnimatedBackground />
      
      <div className="relative z-10 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <GraduationCap className="w-16 h-16 text-red-400 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400">
                Teacher Management
              </h1>
            </div>
            <p className="text-gray-300 text-lg mb-8">
              Manage your teaching staff with ease
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-gray-500 mx-auto rounded-full"></div>
          </div>

          {/* Add Teacher Button */}
          {!showForm && (
            <div className="mb-8 text-center">
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center mx-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Teacher
              </button>
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="mb-8">
              <TeacherForm
                initialData={editingTeacher || {}}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                mode={formMode}
              />
            </div>
          )}

          {/* Teachers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="backdrop-blur-lg bg-gray-900/30 rounded-2xl p-6 shadow-xl border border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-200">
                        {teacher.first_name} {teacher.last_name}
                      </h3>
                      <p className="text-gray-400 text-sm">Teacher</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="p-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Mail className="w-4 h-4 mr-2" />
                    {teacher.email}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <FileText className="w-4 h-4 mr-2" />
                    CIN: {teacher.cin}
                  </div>
                  {teacher.phone_num && (
                    <div className="flex items-center text-gray-300">
                      <Phone className="w-4 h-4 mr-2" />
                      {teacher.phone_num}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-gray-400 text-sm mb-2">Teaching Subjects:</p>
                  <div className="flex flex-wrap gap-2">
                    {teacher.fields.map((field) => (
                      <span
                        key={field}
                        className="px-2 py-1 bg-red-600/20 text-red-300 rounded-full text-xs"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherManagement;