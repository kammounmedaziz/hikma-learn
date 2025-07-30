import React from 'react';
import '../teacherQuiz/QuestionForm.css';

const QuestionForm = ({ question, questions, setQuestions, onDelete }) => {
  const updateQuestion = (field, value) => {
    setQuestions(questions.map(q =>
      q.id === question.id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (optIndex, value) => {
    setQuestions(questions.map(q =>
      q.id === question.id ? {
        ...q,
        options: q.options.map((opt, i) => i === optIndex ? value : opt)
      } : q
    ));
  };

  const deleteOption = (optIndex) => {
    const optionToDelete = question.options[optIndex];
    setQuestions(questions.map(q =>
      q.id === question.id ? {
        ...q,
        options: q.options.filter((_, i) => i !== optIndex),
        correctAnswers: q.correctAnswers.filter(ans => ans !== optionToDelete)
      } : q
    ));
  };

  const addOption = () => {
    setQuestions(questions.map(q =>
      q.id === question.id ? {
        ...q,
        options: [...q.options, '']
      } : q
    ));
  };

  const toggleCorrectAnswer = (optIndex) => {
    const option = question.options[optIndex];
    const currentQuestion = { ...question };
    const newCorrectAnswers = [...currentQuestion.correctAnswers];
    if (newCorrectAnswers.includes(option)) {
      newCorrectAnswers.splice(newCorrectAnswers.indexOf(option), 1);
    } else {
      newCorrectAnswers.push(option);
    }
    updateQuestion('correctAnswers', newCorrectAnswers);
  };

  const updateScore = (value) => {
    updateQuestion('score', parseInt(value) || 0);
  };

  return (
    <div className="question-card">
      <div className="question-header">
        <input
          id={`question-text-${question.id}`} // Unique id
          type="text"
          value={question.text}
          onChange={(e) => updateQuestion('text', e.target.value)}
          placeholder="Enter question"
          className="question-input"
        />
        <div className="score-container">
          <label htmlFor={`question-score-${question.id}`}>Score:</label> {/* Link label to input */}
          <input
            id={`question-score-${question.id}`} // Unique id
            type="number"
            value={question.score}
            onChange={(e) => updateScore(e.target.value)}
            className="score-input"
            min="0"
          />
        </div>
      </div>

      {question.options.map((opt, index) => (
        <div key={index} className="option-row">
          <button
            onClick={() => deleteOption(index)}
            className="option-delete"
          >
            ❌
          </button>
          <input
            id={`option-${question.id}-${index}`} // Unique id
            type="text"
            value={opt}
            onChange={(e) => updateOption(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
            className="option-input"
          />
          <input
            id={`correct-${question.id}-opt-${index}`} // Unique id
            type="checkbox"
            checked={question.correctAnswers.includes(opt)}
            onChange={() => toggleCorrectAnswer(index)}
            className="checkbox"
          />
        </div>
      ))}

      <div className="button-row">
        <button onClick={addOption} className="icon-button add">
          ➕
        </button>
        <button onClick={onDelete} className="icon-button delete">
          🗑️
        </button>
      </div>
    </div>
  );
};

export default QuestionForm;