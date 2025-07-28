import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizForm from "../../Components/teacherQuiz/QuizForm";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../teacher-quiz/CreateQuiz.css';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState('New Quiz');

  const handleSave = async (quizData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to create a quiz');
      return;
    }

    const formattedQuizData = {
      title: quizData.name,
      description: '',
      time_limit: null,
      is_published: false,
      questions: quizData.questions.map((q) => ({
        text: q.text,
        question_type: 'MCQ',
        points: q.score,
        difficulty_level: 'EASY',
        answers: q.options.map((opt, index) => ({
          text: opt,
          is_correct: q.correctAnswers.includes(opt),
        })),
      })),
    };

    console.log('Sending quiz data:', JSON.stringify(formattedQuizData, null, 2));

    try {
      const response = await fetch('http://127.0.0.1:8000/quizzes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formattedQuizData),
      });

      if (response.ok) {
        console.log('Quiz created successfully');
        navigate('/teacherdashboard/quizzes');
      } else {
        const errorData = await response.json();
        console.error('Error creating quiz:', errorData);
        alert('Failed to create quiz: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error while creating quiz');
    }
  };

  return (
    <div className="min-h-screen relative text-gray-200 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-6 center">
          Create Quiz
        </h1>
        <div className="mb-6">
          <label className="text-lg font-semibold text-white">Quiz Title:</label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="w-full p-2 mt-2 bg-gray-700 text-white rounded"
            placeholder="Enter quiz title"
          />
        </div>
        <QuizForm quizTitle={quizTitle} onSave={handleSave} />
      </div>
    </div>
  );
};

export default CreateQuiz;