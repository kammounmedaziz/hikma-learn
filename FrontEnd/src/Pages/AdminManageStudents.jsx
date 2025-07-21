import { useState } from 'react';
import SearchBar from '../Components/SearchBar';
import StudentForm from '../Components/StudentForm'; 
//import StatsHeader from './StatsHeader'; // Optional summary box

const AdminManageStudents = () => {
  const [students, setStudents] = useState([

  ]);
  const [mode, setMode] = useState(null); // "add" | "edit" | "delete"
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleSearch = (term) => {
    setSearchTerm(term);
    const found = students.find(s =>
      s.name.toLowerCase().includes(term.toLowerCase())
    );
    setSelectedStudent(found || null);
  };

  const handleAdd = (newStudent) => {
    setStudents(prev => [...prev, { ...newStudent, id: Date.now() }]);
    setMode(null);
  };

  const handleEdit = (updatedStudent) => {
    setStudents(prev =>
      prev.map(s => s.id === updatedStudent.id ? updatedStudent : s)
    );
    setSelectedStudent(null);
    setMode(null);
  };

  const handleDelete = () => {
    setStudents(prev => prev.filter(s => s.id !== selectedStudent.id));
    setSelectedStudent(null);
    setMode(null);
  };

  return (
    <div className="pt-20 px-6 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Admin Panel - Manage Students</h1>

      {/* Stats Section */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 shadow-lg">
        <p>Total Students: {students.length}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setMode("add")} className="bg-green-600 px-4 py-2 rounded">
          Add Student
        </button>
        <button onClick={() => setMode("edit")} className="bg-yellow-500 px-4 py-2 rounded">
          Edit Student
        </button>
        <button onClick={() => setMode("delete")} className="bg-red-600 px-4 py-2 rounded">
          Delete Student
        </button>
      </div>

      {/* Mode-Based Rendering */}
      {mode === "add" && (
        <StudentForm onSubmit={handleAdd} />
      )}

      {(mode === "edit" || mode === "delete") && (
        <>
          <SearchBar onSearch={handleSearch} />
          {selectedStudent && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg shadow">
              <p><strong>Name:</strong> {selectedStudent.name}</p>
              <p><strong>Email:</strong> {selectedStudent.email}</p>

              {mode === "edit" && (
                <StudentForm
                  initialData={selectedStudent}
                  onSubmit={handleEdit}
                />
              )}

              {mode === "delete" && (
                <button
                  onClick={handleDelete}
                  className="bg-red-500 px-4 py-2 mt-4 rounded"
                >
                  Confirm Delete
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminManageStudents;
