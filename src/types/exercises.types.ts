// types/exercises.types.ts
export interface QuestionData {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  errorHint?: string;
  questionType: 'multiple_choice' | 'open';
}

export interface ApiExercise {
  id: string;
  difficultyLevel: 1 | 2 | 3;
  conceptTag: string;
  question: string;
  createdAt: string;
}

export interface GenerateExercisesResponse {
  exercisesGenerated: number;
  exercisesByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  exercises: ApiExercise[];
  fromCache: boolean;
}

export interface SubmitAnswerPayload {
  exerciseId: string;
  userAnswer: string; // La réponse en texte, pas l'index
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  feedback: string;
}

export interface EvaluateAnswerPayload {
  exerciseId: string;
  userAnswer: string;
  language?: 'fr' | 'en';
}

export interface EvaluateAnswerResponse {
  evaluation: {
    isCorrect: boolean;
    score: number;
    feedback: string;
    detailedAnalysis: {
      conceptsUnderstood: string[];
      conceptsMissing: string[];
      suggestions: string[];
    };
    semanticSimilarity: number;
    evaluatedAt: string;
  };
  attemptSaved: boolean;
  passDebited: boolean;
  remainingPasses: number;
}

export interface ConceptStats {
  conceptTag: string;
  totalAttempts: number;
  correctAttempts: number;
  successRate: number;
  needsReview: boolean;
}

export interface EvaluateSessionResponse {
  evaluation: {
    userId: string;
    courseId: string;
    totalExercises: number;
    correctAnswers: number;
    overallScore: number;
    conceptsStats: ConceptStats[];
    weakConcepts: string[];
    evaluatedAt: string;
  };
  diagnosticUpdated: boolean;
}

export interface Diagnostic {
  userId: string;
  courseId: string;
  overallScore: number;
  skillsToReview: string[];
  lastUpdated: string;
}

export interface ExercisesListResponse {
  total: number;
  exercises: ApiExercise[];
}