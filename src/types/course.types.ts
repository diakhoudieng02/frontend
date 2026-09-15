import type { CourseWithOutputs, CourseOutputs, Exercise, Flashcard, Quiz } from '@/types/api';

export interface CourseContextType {
  course: CourseWithOutputs | null;
  summary: any | null;
  outputs: CourseOutputs | null;
  loading: boolean;
  generating: boolean;
  error: string;
  courseStatus: 'processing' | 'ready' | 'error';
  navigationSections: CourseSection[];
}

export interface CourseSection {
  id: string;
  title: string;
  level: 'h2' | 'h3';
}

export interface FlashcardsContextType {
  flashcards: any[];
  handleFlashcardMastered: (id: string) => Promise<void>;
}

export interface PdfContextType {
  pdfUrl: string;
  pdfLoading: boolean;
  pdfProgress: number;
  handleDownloadPdf: () => Promise<void>;
  handlePdfProgressChange: (value: number[]) => void;
}

export interface Category {
  value: string;
  label: string;
  emoji: string;
}

export const COURSE_CATEGORIES: Category[] = [
  { value: 'math', label: 'Mathématiques', emoji: '📐' },
  { value: 'langues', label: 'Langues', emoji: '🗣️' },
  { value: 'physique', label: 'Physique', emoji: '⚛️' },
  { value: 'chimie', label: 'Chimie', emoji: '🧪' },
  { value: 'histoire', label: 'Histoire', emoji: '📜' },
  { value: 'geographie', label: 'Géographie', emoji: '🌍' },
  { value: 'francais', label: 'Français', emoji: '📚' },
  { value: 'philosophie', label: 'Philosophie', emoji: '🤔' },
  { value: 'svt', label: 'SVT', emoji: '🧬' },
  { value: 'informatique', label: 'Informatique', emoji: '💻' },
];

export interface MicroSummaryResponse {
  success: boolean;
  data: {
    microSummary: {
      notion: string;
      microSummary: string;
      generatedAt: string;
    };
    chunks: Array<{
      chunkId: string;
      content: string;
      pageNumber: number;
      relevanceScore: number;
    }>;
    fromCache: boolean;
  };
}

export interface MethodCardResponse {
  success: boolean;
  data: {
    methodCard: MethodCard;
    processingTime: number;
  };
}

export interface MethodCard {
  title: string;
  context: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    warning?: string;
    formula?: string;
  }>;
  examples: Array<{
    problem: string;
    solution: string;
    explanation: string;
  }>;
  tips: string[];
}