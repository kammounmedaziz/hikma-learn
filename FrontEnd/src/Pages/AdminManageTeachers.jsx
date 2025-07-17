import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Calendar, FileText, GraduationCap,
  Edit, Trash2, Plus
} from 'lucide-react';
import TeacherForm from '../Components/TeacherForm';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const navigate = useNavigate();

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/teachers/');
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSubmit = async (teacherData) => {
    try {
      if (currentTeacher) {
        const response = await axios.put(
          `http://127.0.0.1:8000/api/teachers/${currentTeacher.id}/`,
          teacherData
        );
        setTeachers(teachers.map(t =>
          t.id === currentTeacher.id ? response.data : t
        ));
      } else {
        const response = await axios.post('http://127.0.0.1:8000/api/register-teacher/', teacherData);
        setTeachers(prev => [...prev, response.data]);
        navigate('/AdminDashboard');
      }
      setShowForm(false);
      setCurrentTeacher(null);
    } catch (error) {
      console.error("Error saving teacher:", error.response?.data || error.message);
      alert(`Failed to ${currentTeacher ? 'update' : 'create'} teacher.`);
    }
  };

  const handleDelete = async (teacherId) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;

    setIsDeleting(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/teachers/${teacherId}/delete/`);
      setTeachers(prev => prev.filter(teacher => teacher.id !== teacherId));
    } catch (error) {
      console.error("Error deleting teacher:", error.response?.data || error.message);
      alert("Failed to delete teacher. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (teacher) => {
    setCurrentTeacher(teacher);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setCurrentTeacher(null);
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
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center mx-auto transition-transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Teacher
            </button>
          </div>
        )}

        {showForm && (
          <TeacherForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode={currentTeacher ? 'edit' : 'add'}
            initialData={currentTeacher}
          />
        )}

        {/* Teacher cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.length > 0 ? (
            teachers.map((teacher) => (
              <div key={teacher.id} className="backdrop-blur-lg bg-gray-900/30 rounded-2xl p-6 shadow-xl border border-gray-700 transition-all hover:shadow-2xl hover:border-red-400/50">
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
                      className="text-blue-400 hover:text-blue-300"
                      title="Edit teacher"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      disabled={isDeleting}
                      className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                      title="Delete teacher"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-red-400" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-red-400" />
                    <span>CIN: {teacher.cin}</span>
                  </div>
                  {teacher.phone_num && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-red-400" />
                      <span>{teacher.phone_num}</span>
                    </div>
                  )}
                  {teacher.birth_date && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-red-400" />
                      <span>{new Date(teacher.birth_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-gray-400 text-sm mb-2 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2 text-red-400" />
                    Subjects:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(teacher.fields) && teacher.fields.length > 0 ? (
                      teacher.fields.map((field, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-red-600/20 text-red-300 rounded-full text-xs"
                        >
                          {field}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">No subjects assigned</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">No teachers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherManagement;
