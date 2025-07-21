// ExamsQuizzes.js - Page for exams and quizzes with Create Quiz button and quiz list
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExamsQuizzes.css';

const ExamsQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [quizName, setQuizName] = useState('');
  const teacherId = "auth_teacher_123";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      const dummyQuizzes = [
        { id: 1, title: "Math Quiz 1", date: "2025-07-15" },
        { id: 2, title: "Science Quiz 1", date: "2025-07-16" },
      ];
      setQuizzes(dummyQuizzes);
    };
    fetchQuizzes();
  }, [teacherId]);

  const handleCreateQuiz = () => {
    if (quizName.trim()) {
      console.log('Navigating to:', `/study-dashboard/ExamsQuizzes/create?name=${encodeURIComponent(quizName)}`); // Debug log
      setShowPopup(false); // Close popup first
      // Use a small delay to ensure popup closes before navigation
      setTimeout(() => {
        navigate(`/study-dashboard/ExamsQuizzes/create?name=${encodeURIComponent(quizName)}`);
        setQuizName('');
      }, 100);
    } else {
      alert('Please enter a quiz name');
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
          <button onClick={() => setShowPopup(true)} className="create-quiz-button">
            Create Quiz
          </button>
        </div>
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-red-400 mb-4">My Quizzes</h2>
          {quizzes.length > 0 ? (
            <ul className="space-y-4">
              {quizzes.map((quiz) => (
                <li key={quiz.id} className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl shadow">
                  <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
                  <p className="text-gray-400 text-sm">Created: {quiz.date}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">No quizzes yet</p>
          )}
        </div>

        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4">Enter Quiz Name</h2>
              <input
                type="text"
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
                className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                placeholder="Quiz Name"
              />
              <div className="flex justify-end gap-4">
                <button onClick={() => setShowPopup(false)} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500">
                  Cancel
                </button>
                <button onClick={handleCreateQuiz} className="create-buttom">
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamsQuizzes;