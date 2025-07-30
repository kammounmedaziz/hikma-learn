import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentQuizForm from '../student-quiz/StudentQuizForm';
import '../student-quiz/StudentQuizForm.css'; // Add this line
import '../../Components/teacherQuiz/QuizForm.css';
import '../../Components/teacherQuiz/QuestionForm.css';

const ExamsQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});

  // Static quiz data matching the QuizForm structure
  const staticQuizzes = {
    '1': {
      id: 1,
      name: 'Quiz 1',
      questions: [
        { id: Date.now() + 1, text: 'What are the primary colors?', options: ['Red', 'Blue', 'Green', 'Yellow'], correctAnswers: [], score: 10 },
        { id: Date.now() + 2, text: 'Which planets are gas giants?', options: ['Earth', 'Jupiter', 'Saturn', 'Mars'], correctAnswers: [], score: 10 },
      ],
    },
    '2': {
      id: 2,
      name: 'Quiz 2',
      questions: [
        { id: Date.now() + 3, text: 'What are European capitals?', options: ['London', 'Paris', 'Berlin', 'Madrid'], correctAnswers: [], score: 10 },
        { id: Date.now() + 4, text: 'What are multiples of 5?', options: ['10', '15', '20', '25'], correctAnswers: [], score: 10 },
      ],
    },
    '3': {
      id: 3,
      name: 'Quiz 3',
      questions: [
        { id: Date.now() + 5, text: 'Which elements are metals?', options: ['Gold', 'Oxygen', 'Iron', 'Silver'], correctAnswers: [], score: 10 },
        { id: Date.now() + 6, text: 'What are major oceans?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctAnswers: [], score: 10 },
      ],
    },
  };

  useEffect(() => {
    if (id) {
      const selectedQuiz = staticQuizzes[id];
      if (!selectedQuiz) {
        navigate('/StudydDashboard/ExamsQuiz');
        return;
      }
      setQuiz(selectedQuiz);
    }
  }, [id, navigate]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (currentAnswers.includes(value)) {
        return { ...prev, [questionId]: currentAnswers.filter(a => a !== value) };
      } else {
        return { ...prev, [questionId]: [...currentAnswers, value] };
      }
    });
  };

  const handleSubmit = () => {
    console.log('Submitted Answers:', answers);
    alert('Quiz submitted! Check the console for your answers.');
    navigate('/StudydDashboard/ExamsQuiz');
  };

  if (id && !quiz) return <div className="text-center text-white py-8">Loading quiz...</div>;

  if (!id) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-4">Available Quizzes</h2>
        <ul className="space-y-4">
          {Object.values(staticQuizzes).map((quiz) => (
            <li key={quiz.id} className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl shadow">
              <button
                onClick={() => navigate(`/StudydDashboard/ExamsQuiz/${quiz.id}`)}
                className="text-lg font-semibold text-white hover:underline w-full text-left"
              >
                {quiz.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="relative text-gray-200">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <StudentQuizForm
          name={quiz.name}
          initialQuestions={quiz.questions}
          onAnswerChange={handleAnswerChange}
          answers={answers}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default ExamsQuiz;