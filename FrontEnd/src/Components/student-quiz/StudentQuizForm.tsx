import React, { MouseEventHandler, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Add this
import type { Quiz, Answer} from '../../types/student-quiz';

type StudentQuizProps = {
  quiz: Quiz;
  onSubmit: (quiz: Quiz, selectedAnswers: Answer[]) => void;
};

const StudentQuizForm = ({quiz, onSubmit}: StudentQuizProps) => {
  const navigate = useNavigate();
  const [ selectedAnswers, setSelectedAnswers ] = useState<Answer[]>([]);

  return (
    <div className="relative text-gray-200">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">

        {/* Quiz Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">{quiz.title}</h2>
        </div>

        {/* Questions */}
        {quiz.questions.map((q, index) => (
          <div key={q.id} className="student-question-card">
            <div className="question-header">
              <p className="question-text text-lg font-semibold text-white">
                {index + 1}. {q.text}
              </p>
              <div className="score-container">
                <span className="text-sm text-gray-300">Score: {q.points}</span>
              </div>
            </div>

            {/* Chosen answers */}
            {q.answers.map((answer, idx) => (
              <div
                key={idx}
                className={`student-option-row ${selectedAnswers.find(a => a.id === answer.id) ? 'selected-option' : ''}`}
                onClick={() => {
                  const newAnswer = answer;
                  setSelectedAnswers(prevAnswers => {
                    const isSelected = prevAnswers.some(a => a.id === answer.id);
                    if (isSelected) {
                      return prevAnswers.filter(a => a.id !== answer.id);
                    } else {
                      return [...prevAnswers, newAnswer];
                    }
                  });
                }}
              >
                {answer.text}
              </div>
            ))}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="button-container">
          <button onClick={() => {
            // prevent default or handle event if needed
            onSubmit(quiz, selectedAnswers);
          } } className="save-question-button">
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