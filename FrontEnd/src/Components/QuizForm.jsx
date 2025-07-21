import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuestionForm from './QuestionForm';
import './QuizForm.css';

const QuizForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const quizName = searchParams.get('name') || 'New Quiz';

  const [questions, setQuestions] = useState([
    { id: 1, text: '', options: ['', '', '', ''], correctAnswers: [], score: 10 }
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: questions.length + 1, text: '', options: ['', '', '', ''], correctAnswers: [], score: 10 }
    ]);
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const saveQuiz = () => {
    const quizData = { name: quizName, questions };
    console.log('Saving quiz:', quizData);
    navigate('/study-dashboard/ExamsQuizzes');
  };

  return (
    <div className="min-h-screen relative text-gray-200 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {questions.map((q) => (
          <QuestionForm 
            key={q.id}
            question={q}
            questions={questions}
            setQuestions={setQuestions}
            onDelete={() => deleteQuestion(q.id)}
          />
        ))}

        {/* ✅ Wrap buttons in a container */}
        <div className="button-container">
          <button onClick={addQuestion} className="add-question-button">
            Add Question
          </button>
          <button onClick={saveQuiz} className="save-question-button">
            Save Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;
