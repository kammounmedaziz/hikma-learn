import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionForm from '../teacherQuiz/QuestionForm';
import '../teacherQuiz/QuizForm.css';

const QuizForm = ({ name: initialName, onSave, initialQuestions }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState(initialName || '');

  useEffect(() => {
    console.log('Initial Questions received:', initialQuestions); // Log initial data
    if (initialQuestions && initialQuestions.length > 0) {
      // Check for duplicate ids
      const ids = initialQuestions.map(q => q.id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        console.warn('Duplicate IDs found in initialQuestions:', ids);
      }
      setQuestions(initialQuestions);
    } else {
      setQuestions([{ id: Date.now(), text: '', options: ['', '', '', ''], correctAnswers: [], score: 10 }]);
    }
    setQuizTitle(initialName || '');
  }, [initialQuestions, initialName]);

  const addQuestion = () => {
    const newId = Date.now(); // Ensure new id is unique
    console.log('Adding question with ID:', newId);
    setQuestions([
      ...questions,
      { id: newId, text: '', options: ['', '', '', ''], correctAnswers: [], score: 10 },
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
        {questions.map((q) => {
          console.log('Rendering Question with ID:', q.id, 'Questions array:', questions); // Detailed debug
          return (
            <QuestionForm
              key={q.id} // Explicitly set unique key
              question={q}
              questions={questions}
              setQuestions={setQuestions}
              onDelete={() => deleteQuestion(q.id)}
            />
          );
        })}
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