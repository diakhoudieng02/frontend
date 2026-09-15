  export interface MicroSummaryRequest {
    courseId: string;
    notion: string;
  }

  export interface RelatedChunk {
    chunkId: string;
    content: string;
    pageNumber: number;
    relevanceScore: number;
  }

  export interface MicroSummary {
    notion: string;
    microSummary: string;
    relatedChunks: RelatedChunk[];
    generatedAt: string;
    cacheKey: string;
  }

  export interface MicroSummaryResponse {
    notion: string;
    microSummary: MicroSummary;
    chunks: RelatedChunk[];
    fromCache: boolean;
  }

  export interface ClearDiagnosticPayload {
    notion: string;
    isCorrect: boolean;
  }

  export interface Diagnostic {
    userId: string;
    courseId: string;
    notionCleared: string;
    newOverallScore: number;
    remainingSkills: string[];
    updatedAt: string;
  }

  export interface ClearDiagnosticResponse {
    diagnostic: Diagnostic;
    progressPercentage: number;
    message?: string; 
  }

  export interface MethodCardStep {
    stepNumber: number;
    title: string;
    description: string;
    warning?: string;
    formula?: string;
  }

  export interface MethodCardExample {
    problem: string;
    solution: string;
    explanation: string;
  }

  export interface MethodCard {
    title: string;
    context: string;
    steps: MethodCardStep[];
    examples: MethodCardExample[];
    tips: string[];
    generatedAt: string;
  }

  export interface MethodCardPayload {
    passage: string;
  }

  export interface MethodCardResponse {
    methodCard: MethodCard;
    processingTime: number;
  }

  export interface NotionProgress {
    notion: string;
    mastered: boolean;
    attempts: number;
    lastAttempt: string;
  }
  export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
  }