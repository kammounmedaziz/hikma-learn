interface Answer {
  id: number;
  text: string;
}

interface Question {
  id: number;
  text: string;
  question_type: 'MCQ';
  points: number;
  difficulty_level: 'EASY' | 'MEDIUM' | 'HARD' | null;
  answers: Answer[];
}

interface Quiz {
  id: number;
  url: string;
  teacher: number;
  title: string;
  description: string | null;
  time_limit: number | null;
  is_published: boolean;
  creation_date: string;
  updated_date: string;
  questions: Question[];
  submitted: boolean;
}

interface SubmissionAnswer {
  question: number;
  chosen_answer: number;
  is_correct: boolean;
}

interface Submission {
  id: number;
  quiz: number;
  student: number;
  submitted_at: string;
  grade: number;
  answers: SubmissionAnswer[];
}

export type { Quiz, Question, Answer, SubmissionAnswer, Submission };
export default Quiz;