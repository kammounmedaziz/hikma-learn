
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScreenReader from "../student-quiz/ScreenReader";
import { Quiz, Answer } from "../../types/student-quiz";

// Create a default Answer object to hint the type
const defaultAnswer = { id: 0, text: "" }; // Matches Answer interface from types/student-quiz.ts

const StudentQuizForm = ({ quiz, onSubmit }) => {
  const navigate = useNavigate();
  const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>([defaultAnswer]); // Initialize with a typed default
  const [focusedOption, setFocusedOption] = useState<number | null>(null); // Track focused option
  const optionRefs = useRef<{ [key: number]: React.RefObject<HTMLDivElement> }>({}); // Type refs for answer options
  const questionRefs = useRef<{ [key: number]: React.RefObject<HTMLDivElement> }>({}); // Type refs for questions
  const submitButtonRef = useRef<HTMLButtonElement>(null); // Type ref for submit button
  const backButtonRef = useRef<HTMLButtonElement>(null); // Type ref for back button

  // Initialize refs for questions and answers
  useEffect(() => {
    quiz.questions.forEach((q: Quiz['questions'][number]) => {
      questionRefs.current[q.id] = React.createRef<HTMLDivElement>();
      q.answers.forEach((answer: Answer) => {
        optionRefs.current[answer.id] = React.createRef<HTMLDivElement>();
      });
    });
  }, [quiz]);

  const handleAnswerClick = (answer: Answer) => {
    setSelectedAnswers((prevAnswers) => {
      const isSelected = prevAnswers.some((a) => a.id === answer.id);
      if (isSelected) {
        return prevAnswers.filter((a) => a.id !== answer.id);
      } else {
        return [...prevAnswers.filter((a) => a.id !== 0), answer]; // Remove default and add new answer
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, answer: Answer, questionId: number) => {
    const questionIndex = quiz.questions.findIndex((q) => q.id === questionId);
    const answerIndex = quiz.questions[questionIndex].answers.findIndex((a) => a.id === answer.id);

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleAnswerClick(answer);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextAnswerIndex = answerIndex + 1;
      if (nextAnswerIndex < quiz.questions[questionIndex].answers.length) {
        const nextAnswer = quiz.questions[questionIndex].answers[nextAnswerIndex];
        setFocusedOption(nextAnswer.id);
        optionRefs.current[nextAnswer.id]?.current?.focus();
      } else {
        const nextQuestionIndex = questionIndex + 1;
        if (nextQuestionIndex < quiz.questions.length) {
          const nextQuestion = quiz.questions[nextQuestionIndex];
          setFocusedOption(nextQuestion.answers[0].id);
          optionRefs.current[nextQuestion.answers[0].id]?.current?.focus();
        } else {
          submitButtonRef.current?.focus();
        }
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (answerIndex > 0) {
        const prevAnswer = quiz.questions[questionIndex].answers[answerIndex - 1];
        setFocusedOption(prevAnswer.id);
        optionRefs.current[prevAnswer.id]?.current?.focus();
      } else {
        if (questionIndex > 0) {
          const prevQuestion = quiz.questions[questionIndex - 1];
          const lastAnswer = prevQuestion.answers[prevQuestion.answers.length - 1];
          setFocusedOption(lastAnswer.id);
          optionRefs.current[lastAnswer.id]?.current?.focus();
        }
      }
    } else if (e.key === "Tab" && !e.shiftKey && answerIndex === quiz.questions[questionIndex].answers.length - 1) {
      e.preventDefault();
      const nextQuestionIndex = questionIndex + 1;
      if (nextQuestionIndex < quiz.questions.length) {
        const nextQuestion = quiz.questions[nextQuestionIndex];
        setFocusedOption(nextQuestion.answers[0].id);
        optionRefs.current[nextQuestion.answers[0].id]?.current?.focus();
      } else {
        submitButtonRef.current?.focus();
      }
    } else if (e.key === "Tab" && e.shiftKey && answerIndex === 0) {
      e.preventDefault();
      if (questionIndex > 0) {
        const prevQuestion = quiz.questions[questionIndex - 1];
        const lastAnswer = prevQuestion.answers[prevQuestion.answers.length - 1];
        setFocusedOption(lastAnswer.id);
        optionRefs.current[lastAnswer.id]?.current?.focus();
      }
    }
  };

  return (
    <div
      className="relative text-gray-200"
      role="region"
      aria-label="Student Quiz Form"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Quiz Title */}
        <div className="mb-6">
          <h2
            id="quiz-title"
            className="text-2xl font-bold text-white"
            aria-live="polite"
          >
            {quiz.title}
          </h2>
        </div>

        {/* Questions */}
        {quiz.questions.map((q: Quiz['questions'][number], index: number) => (
          <div
            key={q.id}
            className="student-question-card"
            role="group"
            aria-labelledby={`question-${q.id}`}
            ref={questionRefs.current[q.id]}
          >
            <div className="question-header">
              <p
                id={`question-${q.id}`}
                className="question-text text-lg font-semibold text-white"
                aria-live="polite"
              >
                {index + 1}. {q.text}
              </p>
              <div className="score-container">
                <span className="text-sm text-gray-300" aria-hidden="true">
                  Score: {q.points}
                </span>
              </div>
            </div>

            {/* Chosen answers */}
            {q.answers.map((answer: Answer, idx: number) => (
              <div
                key={idx}
                className={`student-option-row ${
                  selectedAnswers.find((a) => a.id === answer.id)
                    ? "selected-option"
                    : ""
                }`}
                onClick={() => handleAnswerClick(answer)}
                role="button"
                tabIndex={0}
                aria-label={`Option ${idx + 1} for question ${index + 1}: ${
                  answer.text
                }${
                  selectedAnswers.find((a) => a.id === answer.id)
                    ? " (sélectionné)"
                    : ""
                }`}
                ref={optionRefs.current[answer.id]}
                onKeyDown={(e) => handleKeyDown(e, answer, q.id)}
                aria-selected={selectedAnswers.some((a) => a.id === answer.id)}
              >
                {answer.text}
              </div>
            ))}

            {/* Screen Reader Button Inside Question Card */}
            <div className="mt-2 text-right">
              <ScreenReader
                quiz={quiz}
                selectedAnswers={selectedAnswers.filter((a) => a.id !== 0)} // Filter out default
                questionAnswers={q.answers}
                questionText={q.text}
                locale={
                  document.documentElement.lang || navigator.language || "en-US"
                } // Pass locale here
              />
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="button-container">
          <button
            onClick={() =>
              onSubmit(
                quiz,
                selectedAnswers.filter((a) => a.id !== 0)
              )
            } // Filter out default
            className="save-question-button"
            aria-label="Soumettre le Quiz"
            ref={submitButtonRef}
          >
            Soumettre le Quiz
          </button>
          <button
            onClick={() => navigate(-1)}
            className="add-question-button"
            aria-label="Retour"
            ref={backButtonRef}
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizForm;
