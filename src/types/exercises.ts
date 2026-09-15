export type DifficultyLevel = 'bronze' | 'silver' | 'gold';

export interface Exercise {
  id: string;
  courseId: string;
  difficultyLevel: 1 | 2 | 3;
  conceptTag: string;
  questionData: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    errorHint?: string;
    questionType: 'multiple_choice';
  };
  attempts?: ExerciseAttempt[];
  createdAt: string;
}

export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  createdAt: string;
}

export interface Diagnostic {
  userId: string;
  courseId: string;
  overallScore: number;
  skillsToReview: string[];
  lastUpdated: string;
}