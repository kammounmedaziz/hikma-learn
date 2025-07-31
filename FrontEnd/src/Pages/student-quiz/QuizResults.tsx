// StudentResultPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { Quiz, Submission } from '../../types/student-quiz';

const StudentResultPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();

  const [quiz, setQuiz] = useState<Quiz | null>(state?.quiz ?? null);
  const [submission, setSubmission] = useState<Submission | null>(state?.submission ?? null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to view quiz results');
      navigate('/login');
      return;
    }

    fetch(`http://localhost:8000/quizzes/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setQuiz)
      .catch(console.error);

    fetch(`http://localhost:8000/quizzes/${id}/submissions/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(arr => setSubmission(arr?.[0] ?? null))
      .catch(console.error);
  }, [id, navigate]);

  if (!quiz || !submission)
    return <div className="text-white text-center py-8">Loading…</div>;

  return (
    <div className="relative text-gray-200">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl text-center font-bold mb-6 text-white">
          Results for Quiz #{id}
        </h2>

        <div className="flex justify-center mb-10">
          {/* TODO: Change according to grade */}
          <div className="w-40 h-40 rounded-full border-8 border-green-400 flex items-center justify-center text-3xl font-bold text-white">
            {submission.grade * 100}%
          </div>
        </div>

        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="student-question-card">
            <p className="text-lg font-semibold mb-2">
              {idx + 1}. {q.text}
            </p>
            <div className="text-sm text-gray-400 mb-4">Score: {q.points}</div>

            {q.answers.map(ans => {
              const isSelected = submission.answers.some(a => a.chosen_answer === ans.id);
              const isCorrect = false; // FIXME: compute properly
              let bg = 'bg-gray-700';
              if (isSelected && isCorrect) bg = 'bg-green-600';
              else if (isSelected) bg = 'bg-red-600';

              return (
                <div key={ans.id} className={`p-3 rounded mb-2 ${bg}`}>
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