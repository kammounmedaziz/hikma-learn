import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const StudentResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // ✅ Get ID from URL
  const { quiz, answers, scorePercent } = location.state || {};

  if (!quiz || !answers) {
    return <div className="text-white text-center py-8">No result data available for quiz {id}.</div>;
  }

  return (
    <div className="relative text-gray-200">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        
        {/* Title */}
        <h2 className="text-2xl text-center font-bold mb-6 text-white">
          Results for Quiz #{id}
        </h2>

        {/* Score Circle */}
        <div className="flex justify-center mb-10">
          <div className="w-40 h-40 rounded-full border-8 border-green-400 flex items-center justify-center text-3xl font-bold text-white">
            {scorePercent}%
          </div>
        </div>

        {/* Question Review */}
        {quiz.questions.map((q, index) => (
          <div key={q.id} className="student-question-card">
            <p className="text-lg font-semibold mb-2">{index + 1}. {q.text}</p>
            <div className="score-container text-sm text-gray-400 mb-4">Score: {q.score}</div>

            {q.options.map((opt, idx) => {
              const isCorrect = q.correctAnswers.includes(opt);
              const isSelected = answers[q.id]?.includes(opt);

              let bgColor = "bg-gray-700";
              if (isSelected && isCorrect) bgColor = "bg-green-600";
              else if (isSelected && !isCorrect) bgColor = "bg-red-600";
             

              return (
                <div key={idx} className={`p-3 rounded mb-2 ${bgColor}`}>
                  {opt}
                </div>
              );
            })}
          </div>
        ))}

        <div className="mt-10 flex justify-center">
          <button onClick={() => navigate('/StudydDashboard/ExamsQuiz')} className="save-question-button">
            Back to Quizzes
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentResultPage;
