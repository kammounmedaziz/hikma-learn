// StudentResultPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { QuizResult } from '../../types/student-quiz';

const StudentResultPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();

  const [ result, setResult] = useState<QuizResult|null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to view quiz results');
      navigate('/login');
      return;
    }

    fetch(`http://localhost:8000/quizzes/${id}/result/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setResult)
      .catch(console.error);
  }, [id, navigate]);

  if (!result)
    return <div className="text-white text-center py-8">Loading…</div>;

  return (
    <div className="relative text-gray-200">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl text-center font-bold mb-6 text-white">
          Results for Quiz "{result.title}"
        </h2>

        <div className="flex justify-center mb-10">
          {/* TODO: Change according to grade */}
          <div className="w-40 h-40 rounded-full border-8 border-green-400 flex items-center justify-center text-3xl font-bold text-white">
            {result.grade * 100}%
          </div>
        </div>

        {result.questions.map((q, idx) => (
          <div key={q.id} className="student-question-card">
            <p className="text-lg font-semibold mb-2">
              {idx + 1}. {q.text}
            </p>
            <div className="text-sm text-gray-400 mb-4">Score: {q.points}</div>

            {q.answers.map(ans => {
              let bg = 'bg-gray-700';
              let border = '';
              if (ans.is_chosen && ans.is_correct) bg = 'bg-green-600';
              else if (ans.is_chosen) bg = 'bg-red-600';
              else if (ans.is_correct) border = 'border-2 border-green-600';

              return (
                <div key={ans.id} className={`p-3 rounded mb-2 ${bg} ${border}`}>
                  {ans.text}
                </div>
              );
            })}
          </div>
        ))}

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => navigate('/StudydDashboard/quizzes')}
            className="save-question-button"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentResultPage;