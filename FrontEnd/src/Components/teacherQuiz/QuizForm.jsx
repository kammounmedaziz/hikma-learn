import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionForm from '../teacherQuiz/QuestionForm';
import '../teacherQuiz/QuizForm.css';

const QuizForm = ({ quizTitle, onSave }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([
    { id: 1, text: '', options: ['', '', '', ''], correctAnswers: [], score: 10 },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: questions.length + 1, text: '', options: ['', '', '', ''], correctAnswers: [], score: 10 },
    ]);
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const saveQuiz = () => {
    if (!quizTitle.trim()) {
      alert('Please enter a quiz title.');
      return;
    }

    const invalidQuestions = questions.filter(
      (q) => !q.text.trim() || q.options.some((opt) => !opt.trim()) || q.correctAnswers.length === 0
    );
    if (invalidQuestions.length > 0) {
      alert('Please fill in all question texts, options, and select at least one correct answer per question.');
      return;
    }

    const quizData = { name: quizTitle, questions };
    onSave(quizData);
  };

  return (
    <div className="relative text-gray-200">
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