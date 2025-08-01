export interface AnswerBase {
  id: number;
  text: string;
}

export interface Answer extends AnswerBase {}

export interface QuestionBase {
  id: number;
  text: string;
  question_type: 'MCQ';
  points: number;
  difficulty_level: 'EASY' | 'MEDIUM' | 'HARD' | null;
}

export interface Question extends QuestionBase {
  answers: Answer[];
}

export interface QuizBase {
  id: number;
  url: string;
  teacher: number;
  title: string;
  description: string | null;
  time_limit: number | null;
  is_published: boolean;
  creation_date: string;
  updated_date: string;
  submitted: boolean;
}

export interface Quiz extends QuizBase {
  questions: Question[];
}

// --- Submission / Result shapes ---
export interface SubmissionAnswer {
  question: number;
  chosen_answer: number;
  is_correct: boolean;
}

export interface Submission {
  id: number;
  quiz: number;
  student: number;
  submitted_at: string;
  grade: number;
  answers: SubmissionAnswer[];
}

export interface AnswerResult extends AnswerBase {
  is_correct: boolean;
  is_chosen: boolean;
}

export interface QuestionResult extends QuestionBase {
  answers: AnswerResult[];
}

export interface QuizResult extends QuizBase {
  questions: QuestionResult[];
  grade: number;
}