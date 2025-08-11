import React, { useState, useRef } from 'react';

/**
 * ScreenReader component to read quiz content aloud.
 * @param {Object} props - The component props.
 * @param {Object} props.quiz - The quiz object with title and questions.
 * @param {Array} props.selectedAnswers - Array of selected answer objects.
 * @param {Array} props.questionAnswers - Array of answers for the current question.
 * @param {string} props.questionText - The text of the current question.
 * @param {string} props.locale - Optional locale override (e.g., "fr-FR" or "en-US").
 */
const ScreenReader = ({ quiz, selectedAnswers, questionAnswers, questionText, locale }) => {
  const [isReading, setIsReading] = useState(false);
  const timeoutsRef = useRef([]);

  // Fallback to browser language if no locale provided
  const siteLocale = locale || navigator.language || 'en-US';

  // Detects if text is French or English
  const detectLanguage = (text) => {
    if (!text) return siteLocale;
    const frenchChars = /[àâçéèêëîïôûùüÿñæœ]/i;
    const englishChars = /^[a-z0-9\s.,!?'"-:;()]+$/i;
    if (frenchChars.test(text)) return 'fr-FR';
    if (englishChars.test(text)) return 'en-US';
    return siteLocale;
  };

  // Speak with dynamic language detection
  const speakText = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = detectLanguage(text);
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setIsReading(false);
  };

  const handleReadQuiz = () => {
    if (isReading) {
      stopReading();
      return;
    }

    setIsReading(true);
    let totalDelay = 0;

    const questionPrefix = siteLocale.startsWith('fr') ? 'Question : ' : 'Question: ';
    speakText(`${questionPrefix}${questionText || 'Aucune question disponible'}`);
    totalDelay += 2000; // Wait before reading options

    questionAnswers.forEach((answer, index) => {
      const isSelected = selectedAnswers.some((a) => a.id === answer.id);
      const timeout = setTimeout(() => {
        speakText(
          `${siteLocale.startsWith('fr') ? 'Option' : 'Option'} ${index + 1}: ${answer.text}${
            isSelected ? siteLocale.startsWith('fr') ? ' (sélectionné)' : ' (selected)' : ''
          }`
        );
      }, totalDelay);
      timeoutsRef.current.push(timeout);
      totalDelay += 1500;
    });

    const endTimeout = setTimeout(() => {
      setIsReading(false);
    }, totalDelay);
    timeoutsRef.current.push(endTimeout);
  };

  return (
    <button
      onClick={handleReadQuiz}
      className="save-question-button mt-2 text-sm"
      aria-label={siteLocale.startsWith('fr') ? 'Lire la Question à Voix Haute' : 'Read Question Aloud'}
    >
      {isReading
        ? siteLocale.startsWith('fr') ? 'Arrêter' : 'Stop'
        : siteLocale.startsWith('fr') ? 'Lire à Voix Haute' : 'Read Aloud'}
    </button>
  );
};

export default ScreenReader;
