import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../teacher-quiz/ExamsQuizzes.css';

const ExamsQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchQuizzes = async () => {
    if (!token) {
      console.error('No token found, please log in');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/quizzes/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      } else {
        console.error('Error fetching quizzes:', await response.text());
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [token]);

  const handleCreateQuiz = () => {
    navigate('/teacherdashboard/quizzes/create');
  };

  const handleEdit = (id) => {
    navigate(`/teacherdashboard/quizzes/edit/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this quiz?');
    if (!confirmed) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/quizzes/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setQuizzes(quizzes.filter((quiz) => quiz.id !== id));
      } else {
        console.error('Error deleting quiz:', await response.text());
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return (
    <div className="min-h-screen relative text-gray-200 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400">
            Exams & Quizzes
          </h1>
          <p className="text-gray-400 mt-2">Manage your exams and quizzes</p>
        </div>
        <div className="mb-12">
          <button onClick={handleCreateQuiz} className="create-quiz-button">
            Create Quiz
          </button>
        </div>
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-red-400 mb-4">My Quizzes</h2>
          {quizzes.length > 0 ? (
           <ul className="space-y-4">
  {quizzes.map((quiz) => (
    <li
      key={quiz.id}
      className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl shadow"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
        <div className="space-x-2">
          <button
            onClick={() => handleEdit(quiz.id)}
            className="edit-quiz-button"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(quiz.id)}
            className="delete-quiz-button"
          >
            Delete
          </button>
        </div>
      </div>
      <p className="text-gray-400 text-sm mt-1">
        Created: {new Date(quiz.creation_date).toLocaleDateString()}
      </p>
    </li>
  ))}
</ul>

          ) : (
            <p className="text-gray-400 text-center">No quizzes yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamsQuizzes;
