// src/types/diagnostic.ts
import type { CourseSubject } from './index';

export interface DiagnosticQuestion {
  id: string;
  level: 1 | 2 | 3;
  concept_tag: string;
  question_data: {
    type: 'QCM' | 'VRAI_FAUX' | 'REPONSE_OUVERTE';
    question: string;
    options?: string[];
    correct_answer: string;
    explanation: string;
    method?: string;
    error_hint?: string;
  };
}

export interface DiagnosticAnswer {
  questionId: string;
  selectedAnswer: string | number;
  correct: boolean;
  timeSpent?: number;
}

export interface DiagnosticTest {
  id: string;
  subject: CourseSubject;
  level: string;
  questions: Array<DiagnosticQuestion & {
    question: string;
    options: string[];
    correctIndex: number;
    difficulty: string;
    topic: string;
    explanation: string;
  }>;
}

export interface DiagnosticSubmitPayload {
  test_id: string;
  subject: CourseSubject;
  level: string;
  score: number;
  total: number;
  timeSpent?: number;
  answers: DiagnosticAnswer[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface DiagnosticResult {
  id: string;
  test_id: string;
  subject: CourseSubject;
  level: string;
  score: number;
  total: number;
  timeSpent?: number;
  created_at: string;
  answers: DiagnosticAnswer[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  overall_score: number;
  stats_by_level: {
    level_1: string;
    level_2: string;
    level_3: string;
  };
  skills_ok: string[];
  skills_to_review: Array<{
    notion: string;
    priority: 'High' | 'Medium' | 'Low';
    recommendation: string;
  }>;
}

// Nouveau type pour le résumé du diagnostic
export interface DiagnosticSummary {
  summary: string;
  strengths_count: number;
  weaknesses_count: number;
  last_diagnostic_date?: string;
  overall_progress: number;
}

export interface WeaknessItem {
  notion: string;
  priority: 'High' | 'Medium' | 'Low';
  recommendation: string;
  attempts_count?: number;
  success_rate?: number;
}

export interface PedagogicalDiagnostic {
  subject: CourseSubject;
  overall_score: number;
  last_updated: string;
  stats_by_level: {
    level_1: string;
    level_2: string;
    level_3: string;
  };
  skills_ok: string[];
  skills_to_review: WeaknessItem[];
  progression: number;
  recommended_actions: string[];
  exercises_attempted?: number;
}