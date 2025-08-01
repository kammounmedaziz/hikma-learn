import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentQuizForm from '../../Components/student-quiz/StudentQuizForm';
import '../student-quiz/StudentQuizForm.css'; // Add this line
import '../../Components/teacherQuiz/QuizForm.css';
import '../../Components/teacherQuiz/QuestionForm.css';
import type { Quiz, Answer } from '../../types/student-quiz';

const QuizView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to edit a quiz');
            navigate('/login');
            return;
        }
        fetch(`http://127.0.0.1:8000/quizzes/${id}/`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if (!res.ok) {
                    console.error('Error fetching quiz:', res.statusText);
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (!data) {
                    console.error('No quiz data found for ID:', id);
                    return;
                }
                if (data?.submitted) {
                    console.log('Quiz already submitted, redirecting to results');
                    navigate(`/StudydDashboard/quizzes/${id}/result`);
                    return;
                }
                setQuiz(data);
            }
            );
    }, [id, navigate]);

    const handleSubmit = (quiz: Quiz, selectedAnswers: Answer[]) => {
        if (!quiz || !selectedAnswers) {
            console.error('Quiz or selected answers are not defined');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to edit a quiz');
            navigate('/login');
            return;
        }
        const submission = {
            "answers": selectedAnswers.map(answer => ({ chosen_answer: answer.id }))
        };
        console.log(submission);
        fetch(`http://localhost:8000/quizzes/${quiz.id}/submissions/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(
                submission
            )
        })
            .then(res => {
                if (!res.ok) {
                    console.error('Error submitting quiz:', res.statusText);
                    return;
                }
                return res.json();
            })
            .then(submission => {
                if (!submission) {
                    console.error('No submission data returned');
                    return;
                }
                console.log('Quiz submitted successfully:', submission);
                navigate(`/StudydDashboard/quizzes/${quiz.id}/result`);
            })
            .catch(error => {
                console.error('Error submitting quiz:', error);
            }
            );

    };

    if (id && !quiz) return <div className="text-center text-white py-8">Loading quiz...</div>;

    return (
        <div className="relative text-gray-200 min-h-screen flex items-center justify-center">
            <div className="quiz-container">
                <StudentQuizForm
                    quiz={quiz as Quiz}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
};

export default QuizView;