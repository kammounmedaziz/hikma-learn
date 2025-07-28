import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuizForm from "../../Components/teacherQuiz/QuizForm";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../teacher-quiz/CreateQuiz.css';

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState('');
  const [initialQuestions, setInitialQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to edit a quiz');
      navigate('/login');
      return;
    }

    fetch(`http://127.0.0.1:8000/quizzes/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setQuizTitle(data.title);
        const formattedQuestions = data.questions.map((q) => ({
          text: q.text,
          score: q.points,
          correctAnswers: q.answers.filter(a => a.is_correct).map(a => a.text),
          options: q.answers.map(a => a.text),
        }));
        setInitialQuestions(formattedQuestions);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching quiz:', error);
        setLoading(false);
      });
  }, [id, navigate]);

  const handleSave = async (quizData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to update a quiz');
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
        answers: q.options.map((opt) => ({
          text: opt,
          is_correct: q.correctAnswers.includes(opt),
        })),
      })),
    };

    console.log('Updating quiz:', JSON.stringify(formattedQuizData, null, 2));

    try {
      const response = await fetch(`http://127.0.0.1:8000/quizzes/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formattedQuizData),
      });

      if (response.ok) {
        alert('Quiz updated successfully');
        navigate('/teacherdashboard/quizzes');
      } else {
        const errorData = await response.json();
        console.error('Error updating quiz:', errorData);
        alert('Failed to update quiz: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error while updating quiz');
    }
  };

  if (loading) {
    return <div className="text-center text-white py-8">Loading quiz...</div>;
  }

  return (
    <div className="min-h-screen relative text-gray-200 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-6 center">
          Edit Quiz
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
        <QuizForm
          quizTitle={quizTitle}
          onSave={handleSave}
          initialQuestions={initialQuestions}
        />
      </div>
    </div>
  );
};

export default EditQuiz;
