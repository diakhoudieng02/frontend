// services/exercises.service.ts
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

// Types basés sur la documentation
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
  courseId: string;
  difficultyLevel: 1 | 2 | 3;
  conceptTag: string;
  questionData: QuestionData;
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
  userAnswer: string;
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

export const exercisesService = {
  /**
   * Lister les exercices d'un cours
   * GET /exercises/{courseId}
   */
  list: async (courseId: string): Promise<ExercisesListResponse> => {
    try {
      const response = await api.get<ApiResponse<ExercisesListResponse>>(
        `/exercises/${courseId}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur lors du chargement des exercices');
      }

      return response.data as unknown as ExercisesListResponse;
    } catch (error) {
      console.error('❌ Erreur chargement exercices:', error);
      throw error;
    }
  },

  /**
   * Générer des exercices
   * POST /exercises/{courseId}/generate
   */
  generate: async (
    courseId: string,
    options?: { force?: boolean; targetCount?: number; language?: string }
  ): Promise<GenerateExercisesResponse> => {
    try {
      const payload = {
        force: options?.force ?? false,
        targetCount: options?.targetCount ?? 12,
        language: options?.language ?? 'fr',
      };

      const response = await api.post<ApiResponse<GenerateExercisesResponse>>(
        `/exercises/${courseId}/generate`,
        payload
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur lors de la génération');
      }

      return response.data as unknown as GenerateExercisesResponse;
    } catch (error) {
      console.error('❌ Erreur génération exercices:', error);
      throw error;
    }
  },

  /**
   * Soumettre une réponse
   * POST /exercises/submit
   */
  submit: async (payload: SubmitAnswerPayload): Promise<SubmitAnswerResponse> => {
    try {
      const response = await api.post<ApiResponse<SubmitAnswerResponse>>(
        '/exercises/submit',
        payload
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur lors de la soumission');
      }

      return response.data as unknown as SubmitAnswerResponse;
    } catch (error) {
      console.error('❌ Erreur soumission réponse:', error);
      throw error;
    }
  },

  /**
   * Évaluer une réponse ouverte
   * POST /exercises/evaluate
   */
  evaluate: async (payload: EvaluateAnswerPayload): Promise<EvaluateAnswerResponse> => {
    try {
      const response = await api.post<ApiResponse<EvaluateAnswerResponse>>(
        '/exercises/evaluate',
        payload
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Erreur lors de l'évaluation");
      }

      return response.data as unknown as EvaluateAnswerResponse;
    } catch (error) {
      console.error('❌ Erreur évaluation:', error);
      throw error;
    }
  },

  /**
   * Évaluer une session
   * POST /exercises/{courseId}/evaluate-session
   */
  evaluateSession: async (
    courseId: string,
    options?: { conceptFilter?: string; minAttempts?: number }
  ): Promise<EvaluateSessionResponse> => {
    try {
      const response = await api.post<ApiResponse<EvaluateSessionResponse>>(
        `/exercises/${courseId}/evaluate-session`,
        options || {}
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Erreur lors de l'évaluation de la session");
      }

      return response.data as unknown as EvaluateSessionResponse;
    } catch (error) {
      console.error('❌ Erreur évaluation session:', error);
      throw error;
    }
  },

  /**
   * Récupérer le diagnostic
   * GET /exercises/{courseId}/diagnostic
   */
  getDiagnostic: async (courseId: string): Promise<Diagnostic> => {
    try {
      const response = await api.get<ApiResponse<{ diagnostic: Diagnostic }>>(
        `/exercises/${courseId}/diagnostic`
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur lors du chargement du diagnostic');
      }

      const data = response.data as unknown as { diagnostic: Diagnostic };
      return data.diagnostic;
    } catch (error) {
      console.error('❌ Erreur chargement diagnostic:', error);
      throw error;
    }
  },
};