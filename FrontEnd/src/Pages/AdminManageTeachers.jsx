import { useState } from 'react';
import SearchBar from '../Components/SearchBar';
import TeacherForm from '../Components/TeacherForm';

const AdminManageTeachers = () => {
  const [teachers, setTeachers] = useState([
    { id: 1, name: "Dr. Alice Johnson", email: "alice@school.edu" },
    { id: 2, name: "Mr. Bob Smith", email: "bob@school.edu" },
  ]);
  const [mode, setMode] = useState(null); // "add" | "edit" | "delete"
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const handleSearch = (term) => {
    setSearchTerm(term);
    const found = teachers.find(t =>
      t.name.toLowerCase().includes(term.toLowerCase())
    );
    setSelectedTeacher(found || null);
  };

  const handleAdd = (newTeacher) => {
    setTeachers(prev => [...prev, { ...newTeacher, id: Date.now() }]);
    setMode(null);
  };

  const handleEdit = (updatedTeacher) => {
    setTeachers(prev =>
      prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t)
    );
    setSelectedTeacher(null);
    setMode(null);
  };

  const handleDelete = () => {
    setTeachers(prev => prev.filter(t => t.id !== selectedTeacher.id));
    setSelectedTeacher(null);
    setMode(null);
  };

  return (
    <div className="pt-20 px-6 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Admin Panel - Manage Teachers</h1>

      {/* Stats */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 shadow-lg">
        <p>Total Teachers: {teachers.length}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setMode("add")} className="bg-green-600 px-4 py-2 rounded">
          Add Teacher
        </button>
        <button onClick={() => setMode("edit")} className="bg-yellow-500 px-4 py-2 rounded">
          Edit Teacher
        </button>
        <button onClick={() => setMode("delete")} className="bg-red-600 px-4 py-2 rounded">
          Delete Teacher
        </button>
      </div>

      {/* Mode-Based Rendering */}
      {mode === "add" && (
        <TeacherForm onSubmit={handleAdd} />
      )}

      {(mode === "edit" || mode === "delete") && (
        <>
          <SearchBar onSearch={handleSearch} />
          {selectedTeacher && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg shadow">
              <p><strong>Name:</strong> {selectedTeacher.name}</p>
              <p><strong>Email:</strong> {selectedTeacher.email}</p>

              {mode === "edit" && (
                <TeacherForm
                  initialData={selectedTeacher}
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

export default AdminManageTeachers;
