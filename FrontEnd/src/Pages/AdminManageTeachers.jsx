import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Calendar, FileText, GraduationCap,
  Edit, Trash2, Plus, UserPlus, Save, X
} from 'lucide-react';
import TeacherForm from '../Components/TeacherForm';
// 🔴 Animated background
const AnimatedBackground = () => (
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


const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/teachers/')
      .then(response => setTeachers(response.data))
      .catch(error => console.error("Error fetching teachers:", error));
  }, []);
  const navigate = useNavigate();
  const handleSubmit = async (teacherData) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register-teacher/', teacherData);
      const newTeacher = { ...response.data };
      setTeachers(prev => [...prev, newTeacher]);
      setShowForm(false);
      navigate('/AdminDashboard');
    } catch (error) {
      console.error("Error creating teacher:", error.response?.data || error.message);
      alert("Failed to add teacher.");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-gray-200">
      <AnimatedBackground />

      <div className="relative z-10 py-8 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <GraduationCap className="w-16 h-16 text-red-400 mr-4" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400">
              Teacher Management
            </h1>
          </div>
          <p className="text-gray-300 text-lg mb-8">
            Manage your teaching staff with ease
          </p>
        </div>

        {!showForm && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Add New Teacher
            </button>
          </div>
        )}

        {showForm && (
          <TeacherForm onSubmit={handleSubmit} onCancel={handleCancel} />
        )}

        {/* Teacher cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="backdrop-blur-lg bg-gray-900/30 rounded-2xl p-6 shadow-xl border border-gray-700">
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
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center"><Mail className="w-4 h-4 mr-2" /> {teacher.email}</div>
                <div className="flex items-center"><FileText className="w-4 h-4 mr-2" /> CIN: {teacher.cin}</div>
                {teacher.phone_num && (
                  <div className="flex items-center"><Phone className="w-4 h-4 mr-2" /> {teacher.phone_num}</div>
                )}
              </div>

              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-2">Subjects:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(teacher.fields) &&
                    teacher.fields.map((field, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-600/20 text-red-300 rounded-full text-xs">
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
  );
};

export default TeacherManagement;
