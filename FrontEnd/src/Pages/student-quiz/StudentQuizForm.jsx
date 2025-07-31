import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Add this

const StudentQuizForm = ({ name: initialName, initialQuestions, onAnswerChange, answers, onSubmit }) => {
  const [quizTitle, setQuizTitle] = useState(initialName || '');
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate(); // ✅ Initialize navigate

  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
    } else {
      setQuestions([{ id: Date.now(), text: '', options: ['', '', '', ''], correctAnswers: [], score: 10 }]);
    }
    setQuizTitle(initialName || '');
  }, [initialQuestions, initialName]);

  return (
    <div className="relative text-gray-200">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">

        {/* Quiz Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">{quizTitle}</h2>
        </div>

        {/* Questions */}
        {questions.map((q, index) => (
          <div key={q.id} className="student-question-card">
            <div className="question-header">
              <p className="question-text text-lg font-semibold text-white">
                {index + 1}. {q.text}
              </p>
              <div className="score-container">
                <span className="text-sm text-gray-300">Score: {q.score}</span>
              </div>
            </div>

            {/* Options */}
            {q.options.map((opt, idx) => (
              <div
                key={idx}
                className={`student-option-row ${answers[q.id]?.includes(opt) ? 'selected-option' : ''}`}
                onClick={() => onAnswerChange(q.id, opt)}
              >
                {opt}
              </div>
            ))}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="button-container">
          <button onClick={onSubmit} className="save-question-button">
            Submit Quiz
          </button>
          <button onClick={() => navigate(-1)} className="add-question-button">
            Back
          </button>
        </div>
      </div>
    </div>
  );

};

export default StudentQuizForm;