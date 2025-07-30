import React, { useEffect, useState } from 'react';

const StudentQuizForm = ({ name: initialName, initialQuestions, onAnswerChange, answers, onSubmit }) => {
  const [quizTitle, setQuizTitle] = useState(initialName || '');
  const [questions, setQuestions] = useState([]);

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
        <div className="mb-6">
          <label className="text-lg font-semibold text-white">Quiz Title:</label>
          <input
            type="text"
            value={quizTitle}
            readOnly={true}
            className="w-full p-2 mt-2 bg-gray-700 text-white rounded"
            disabled
          />
        </div>
        {questions.map((q) => (
          <div key={q.id} className="student-question-card">
            <div className="question-header">
              <input
                type="text"
                value={q.text}
                readOnly={true}
                className="question-input"
                disabled
              />
              <div className="score-container">
                <label>Score:</label>
                <input
                  type="number"
                  value={q.score}
                  readOnly={true}
                  className="score-input"
                  disabled
                />
              </div>
            </div>
            {q.options.map((opt, index) => (
              <div key={index} className="student-option-row">
                <input
                  type="checkbox"
                  checked={answers[q.id]?.includes(opt) || false}
                  onChange={() => onAnswerChange(q.id, opt)}
                  className="checkbox"
                />
                <input
                  type="text"
                  value={opt}
                  readOnly={true}
                  className="option-input"
                  disabled
                />
              </div>
            ))}
          </div>
        ))}
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