import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User, Mail, Phone, Calendar, FileText, GraduationCap,
  Edit, Trash2
} from 'lucide-react';
import SearchBar from '../Components/SearchBar';
import StudentForm from '../Components/StudentForm'; // Reused for now

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

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/students/');
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) =>
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (student) => {
    setCurrentStudent(student);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setCurrentStudent(null);
  };

  const handleSubmit = async (studentData) => {
    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/students/${currentStudent.id}/`, studentData);
      setStudents(students.map(s => s.id === currentStudent.id ? response.data : s));
      setShowForm(false);
      setCurrentStudent(null);
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    setIsDeleting(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/students/${id}/delete/`);
      setStudents(prev => prev.filter(student => student.id !== id));
    } catch (error) {
      console.error("Error deleting student:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-gray-200">
      <AnimatedBackground />

      <div className="relative z-10 py-8 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <GraduationCap className="w-16 h-16 text-red-400 mr-4" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400">
              Student Management
            </h1>
          </div>
          <p className="text-gray-300 text-lg mb-8">Manage your students</p>
        </div>

        <div className="mb-6 max-w-md mx-auto">
          <SearchBar onSearch={setSearchTerm} />
        </div>

        {showForm && (
          <StudentForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode="edit"
            initialData={currentStudent}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div key={student.id} className="backdrop-blur-lg bg-gray-900/30 rounded-2xl p-6 shadow-xl border border-gray-700 hover:shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-200">
                        {student.first_name} {student.last_name}
                      </h3>
                      <p className="text-gray-400 text-sm">Student</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="text-blue-400 hover:text-blue-300"
                      title="Edit student"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      disabled={isDeleting}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50"
                      title="Delete student"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-red-400" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-red-400" />
                    <span>CIN: {student.cin}</span>
                  </div>
                  {student.phone_num && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-red-400" />
                      <span>{student.phone_num}</span>
                    </div>
                  )}
                  {student.birth_date && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-red-400" />
                      <span>{new Date(student.birth_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-gray-400 text-sm mb-2 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2 text-red-400" />
                    Fields:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(student.fields) && student.fields.length > 0 ? (
                      student.fields.map((field, idx) => (
                        <span key={idx} className="px-2 py-1 bg-red-600/20 text-red-300 rounded-full text-xs">
                          {field}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">No fields assigned</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">No students found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
