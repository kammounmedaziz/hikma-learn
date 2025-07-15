import { useState, useEffect } from 'react';

const StudentForm = ({ initialData = {}, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setEmail(initialData.email || '');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ id: initialData.id, name, email });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <input
        className="w-full p-2 rounded bg-gray-800 text-white"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="w-full p-2 rounded bg-gray-800 text-white"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="bg-blue-500 px-4 py-2 rounded">
        {initialData.id ? "Update Student" : "Add Student"}
      </button>
    </form>
  );
};

export default StudentForm;
