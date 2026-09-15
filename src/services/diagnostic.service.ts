// services/diagnostic.service.ts
import { api } from './api';

// ─── Types métier ──────────────────────────────────────────────────────────────

export interface DiagnosticSummary {
  overallScore: number;
  masteredCount: number;
  toReviewCount: number;
  masteryRate: number;
  progressionTrend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
  lastUpdated: string;
}

export interface Weakness {
  concept: string;        // champ réel retourné par le backend
  notion?: string;        // alias front pour compatibilité
  score: number;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  suggestedExercises?: string[];
}

export interface MasteredSkill {
  concept: string;
  score: number;
  masteredSince: string;
}

export interface SkillsSummary {
  mastered: MasteredSkill[];
  toReview: Weakness[];
  total: number;
  masteryRate: number;
}

export interface ConceptScore {
  concept: string;
  totalAttempts: number;
  successfulAttempts: number;
  score: number;
  lastAttemptDate: string;
}

export interface Diagnostic {
  userId: string;
  courseId: string;
  overallScore: number;
  skillsSummary: SkillsSummary;
  conceptScores: ConceptScore[];
  lastUpdated: string;
  totalExercisesAttempted: number;
  progressionTrend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
}

// ─── Types réponses API ────────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T | null;         // le backend peut retourner data: null (aucun exercice tenté)
}

interface WeaknessesApiData {
  totalWeaknesses: number;
  weaknesses: Weakness[];
}

// ─── Service ───────────────────────────────────────────────────────────────────

class DiagnosticService {

  // ── GET /api/courses/{courseId}/diagnostic ──────────────────────────────────
  /**
   * Récupère le diagnostic pédagogique complet.
   * Retourne null si l'élève n'a pas encore fait d'exercices.
   */
  async getDiagnostic(
    courseId: string,
    options?: { minAttempts?: number; includeExercises?: boolean }
  ): Promise<Diagnostic | null> {
    const params = new URLSearchParams();
    if (options?.minAttempts !== undefined) params.append('minAttempts', String(options.minAttempts));
    if (options?.includeExercises !== undefined) params.append('includeExercises', String(options.includeExercises));

    const qs = params.toString();
    const url = `/courses/${courseId}/diagnostic${qs ? `?${qs}` : ''}`;

    const response = await api.get<ApiResponse<Diagnostic>>(url);

    if (!response.success) {
      throw new Error(response.message ?? 'Erreur lors de la récupération du diagnostic');
    }

    // data: null = aucun exercice tenté, comportement normal
    return response.data ?? null;
  }

  // ── GET /api/courses/{courseId}/diagnostic/summary ──────────────────────────
  /**
   * Récupère le résumé court du diagnostic.
   * Retourne null si l'élève n'a pas encore fait d'exercices.
   */
  async getSummary(courseId: string): Promise<DiagnosticSummary | null> {
    const response = await api.get<ApiResponse<DiagnosticSummary>>(
      `/courses/${courseId}/diagnostic/summary`
    );

    if (!response.success) {
      throw new Error(response.message ?? 'Erreur lors de la récupération du résumé');
    }

    // data: null = aucun exercice tenté, comportement normal
    return response.data ?? null;
  }

  // ── GET /api/courses/{courseId}/diagnostic/weaknesses ───────────────────────
  /**
   * Récupère les points faibles prioritaires.
   * Retourne un tableau vide si aucun exercice tenté.
   */
  async getWeaknesses(
    courseId: string,
    priority?: 'high' | 'medium' | 'low'
  ): Promise<Weakness[]> {
    const qs = priority ? `?priority=${priority}` : '';
    const url = `/courses/${courseId}/diagnostic/weaknesses${qs}`;

    const response = await api.get<ApiResponse<WeaknessesApiData>>(url);

    if (!response.success) {
      throw new Error(response.message ?? 'Erreur lors de la récupération des points faibles');
    }

    // Normaliser : ajouter l'alias "notion" pour compatibilité avec l'UI existante
    const weaknesses = response.data?.weaknesses ?? [];
    return weaknesses.map(w => ({ ...w, notion: w.notion ?? w.concept }));
  }

  // ── POST /api/courses/{courseId}/diagnostic/refresh ─────────────────────────
  /**
   * Force le recalcul du diagnostic.
   * Lance une erreur si aucun exercice tenté (comportement intentionnel du backend).
   */
  async refreshDiagnostic(
    courseId: string,
    minAttempts: number = 1
  ): Promise<Diagnostic> {
    const response = await api.post<ApiResponse<Diagnostic>>(
      `/courses/${courseId}/diagnostic/refresh`,
      { minAttempts }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message ?? 'Erreur lors du rafraîchissement du diagnostic');
    }

    return response.data;
  }
}

export const diagnosticService = new DiagnosticService();