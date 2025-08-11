import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentQuizForm from '../../Components/student-quiz/StudentQuizForm';
import '../student-quiz/StudentQuizForm.css'; // Add this line
import '../../Components/teacherQuiz/QuizForm.css';
import '../../Components/teacherQuiz/QuestionForm.css';
import type { Quiz } from '../../types/student-quiz';

const QuizList = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to edit a quiz');
            navigate('/login');
            return;
        }
        fetch('http://localhost:8000/quizzes/', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if (!res.ok) {
                    console.error('Error fetching quizzes:', res.statusText);
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (!data || !Array.isArray(data)) {
                    console.error('No quizzes data found');
                    return;
                }
                console.log('Fetched quizzes data:', data);
                setQuizzes(data);
            }
            )
            .catch(error => {
                console.error('Error fetching quizzes:', error);
            }
            );
    }, [navigate]);

    return (
        <div className="justify-center">
            <div className="quiz-list-container">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-6">Available Quizzes</h2>
                <ul className="quiz-list">
                    {quizzes.map((quiz) => (
                        <li key={quiz.id} className="quiz-card">
                            <button
                                onClick={() => {
                                    localStorage.setItem(`seen-quiz-${quiz.id}`, 'true');
                                    if (!quiz.submitted) {
                                        navigate(`/StudydDashboard/quizzes/${quiz.id}`);
                                        return;
                                    }
                                    navigate(`/StudydDashboard/quizzes/${quiz.id}/result`);
                                }}
                                className="quiz-button"
                            >
                                <div className="quiz-title-row">
                                    <span className="quiz-title">{quiz.title}</span>
                                    <div className="quiz-icons">
                                        <span className="score-indicator">Score: 0%</span>
                                        {localStorage.getItem(`seen-quiz-${quiz.id}`) === 'true' && (
                                            <span className="seen-icon">👁️</span> // You can use an actual icon here
                                        )}
                                    </div>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>

            </div>
        </div>
    );
};

export default QuizList;