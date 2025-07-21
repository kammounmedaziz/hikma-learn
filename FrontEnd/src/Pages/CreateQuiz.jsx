// CreateQuiz.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuizForm from '../Components/QuizForm';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported
import './CreateQuiz.css';

const CreateQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const quizName = searchParams.get('name') || 'New Quiz';

  const handleSave = (quizData) => {
    console.log('Saving quiz from CreateQuiz:', { name: quizName, ...quizData });
    // Replace with: fetch('/api/quizzes', { method: 'POST', body: JSON.stringify({ name: quizName, ...quizData }), headers: { 'Content-Type': 'application/json' } })
    // .then(response => response.json())
    // .then(() => navigate('/study-dashboard/ExamsQuizzes'));
    navigate('/study-dashboard/ExamsQuizzes');
  };

  return (
    <div className="min-h-screen relative text-gray-200 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-6 center">
          Create Quiz: {quizName}
        </h1>
        <QuizForm onSave={handleSave} />
      </div>
    </div>
  );
};

export default CreateQuiz;