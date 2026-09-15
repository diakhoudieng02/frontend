/**
 * Types pour l'API Backend NestJS
 */

// ═══════════════════════════════════════════════════════════
// TYPES DE BASE
// ═══════════════════════════════════════════════════════════

// types/api.ts ou dans le fichier
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: {
    total?: number;
    exercises?: T;
    [key: string]: any;
  };
}
export interface EmptyResponse {
  // Aucune propriété, ou vous pouvez ajouter:
  acknowledged?: boolean;
}
export interface ApiError {
  message: string;
  error?: string;
  status: number;
  statusCode?: number;
}

// ═══════════════════════════════════════════════════════════
// AUTH - Types
// ═══════════════════════════════════════════════════════════

export type SchoolLevel = 'Seconde' | 'Premiere' | 'Terminale';
export type UserRole = 'ADMIN' | 'USER';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string;
  role: string;
  photoUrl?: string | null;
  schoolLevel?: 'Seconde' | 'Premiere' | 'Terminale' | null;
  supabaseId?: string | null;
  googleId?: string | null;
  createdAt: Date;  // ✅ Maintenant reconnu
  updatedAt: Date;  // ✅ Maintenant reconnu
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

// Payloads - Inscription & Connexion OTP
export interface RegisterRequestPayload {
  phoneNumber: string;
}

export interface RegisterVerifyPayload {
  phoneNumber: string;
  otp: string;
  firstName: string;
  lastName: string;
  schoolLevel?: SchoolLevel;
}

export interface LoginRequestPayload {
  phoneNumber: string;
}

export interface LoginVerifyPayload {
  phoneNumber: string;
  otp: string;
}

// Payload - Google OAuth
export interface GoogleAuthPayload {
  email: string;
  firstName: string;
  lastName: string;
  googleId: string;
  photoUrl?: string;
  schoolLevel?: SchoolLevel;
}

// Note: GoogleAuthResponse = AuthResponse (même structure)

// ═══════════════════════════════════════════════════════════
// COURSES - Types
// ═══════════════════════════════════════════════════════════

export type CourseSubject = 'math' | 'Langues';

export type DocumentType = 'COURS' | 'EPREUVE';

export interface Course {
  id: string;
  title: string;
  subject: CourseSubject;
  status: 'processing' | 'ready' | 'error';
  fileUrl?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  type: DocumentType; // ✅ Nouveau champ
  examDate?: string; // ✅ Optionnel pour les épreuves
}

export interface CourseDetail extends Course {
  userId: string;
  updatedAt: string;
}

export interface CoursesListResponse {
  total: number;
  courses: Course[];
}

export interface UploadCoursePayload {
  title: string;
  subject: CourseSubject;
  file: File;
  type: DocumentType;      // ✅ Nouveau
  examDate?: string;       // ✅ Optionnel
}

export interface CorrectionData {
  id: string;
  courseId: string;
  content: string;
  correction_latex?: string;  // ✅ Ajout optionnel
  originalText?: string;
  metadata?: {
    model: string;
    generatedAt: string;
    processingTime: number;
    pageCount?: number;
    wordCount?: number;
  };
  createdAt: string;
  updatedAt: string;
}


// ═══════════════════════════════════════════════════════════
// ADMIN - Types
// ═══════════════════════════════════════════════════════════

export interface UserListItem {
  id: string;
  phoneNumber: string;
  email?: string;
  schoolLevel: SchoolLevel | null;
  role: UserRole;
  passBalance: number;
  createdAt: string;
}

export interface UserDetail extends UserListItem {
  firstName?: string;
  lastName?: string;
  googleId?: string;
  photoUrl?: string;
  coursesCount: number;
  recentCourses: Array<{
    id: string;
    title: string;
    subject: string;
    createdAt: string;
  }>;
}

export interface UsersListResponse {
  users: UserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateUserPayload {
  phoneNumber: string;
  schoolLevel?: SchoolLevel;
  role?: UserRole;
  initialPassBalance?: number;
}

export interface UpdateUserPayload {
  schoolLevel?: SchoolLevel;
  role?: UserRole;
  passBalanceAdjustment?: number;
}

export interface CreateUserResponse {
  user: AuthUser & { createdAt: string };
  token: string;
  refreshToken: string;
  expiresIn: number;
}
// À AJOUTER à la fin du fichier api.ts existant

// ═══════════════════════════════════════════════════════════
// COURSES - Types supplémentaires pour les outputs
// ═══════════════════════════════════════════════════════════

export interface CourseSection {
  id: string;
  title: string;
  level: 'h1' | 'h2' | 'h3';
  children?: CourseSection[];
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  mastered?: boolean;
  hint?: string;
}

export interface QuestionData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
export interface Exercise {
  id: string;
  courseId: string;
  difficultyLevel: 1 | 2 | 3;  // 1: Facile, 2: Moyen, 3: Difficile
  conceptTag: string;  // Note: camelCase, pas snake_case
  questionData: QuestionData;  // ✅ Les données sont dans questionData
  createdAt?: string;
  updatedAt?: string;
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface CourseOutputs {
  summary: string; // Markdown
  keyConcepts: string[];
  flashcards: Flashcard[];
  structure: CourseSection[];
  // ✅ Nouveaux champs optionnels
  exercises?: Exercise[];
  quiz?: Quiz[];
}


// Extension du type Course existant
export interface CourseWithOutputs extends Course {
  outputs?: CourseOutputs;
}

// Types pour le chat
export interface ChatSource {
  chunk_id: string;
  content: string;
  relevance_score: number;
}

export interface ChatMessage {
  id: string;
  courseId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[] | null;
  createdAt: string;
}

// src/types/api.ts - Ajouter ces types

// Types pour le résumé structuré (GET /summary)
export interface KeyTakeaway {
  statement: string;
  importance: number;
  reference: string;
}

export interface SummaryFlashcard {
  term: string;
  definition: string;
  type: 'concept' | 'question' | 'example';
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  mastered?: boolean;
}

export interface SuggestedTopic {
  title: string;
  description: string;
}

export interface SummaryMetadata {
  generatedAt: string;
  model: string;
  targetLevel: string;
}

export interface CourseSummary {
  courseId: string;
  markdownBody: string;
  keyTakeaways: KeyTakeaway[];
  flashcards: SummaryFlashcard[];
  suggestedTopics: SuggestedTopic[];
  metadata: SummaryMetadata;
}

export interface SummaryResponse {
  summary: CourseSummary;
  wasGenerated: boolean;
  fromCache: boolean;
}

// Payload pour la génération (POST /generate-summary)
export interface GenerateSummaryPayload {
  force?: boolean;
  targetLevel?: 'Seconde' | 'Premiere' | 'Terminale';
  language?: 'fr' | 'en';
}

export interface GenerateSummaryResponse {
  summary: CourseSummary;
  processingTime: number;
}

// Async summary jobs (Option B + stockage DB)
export type SummaryJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface SummaryJobResponse {
  jobId: string;
  status: SummaryJobStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  errorMessage?: string | null;
  summary?: CourseSummary | null;
  fromCache?: boolean;
}

// Dans votre fichier de types
export interface ExercisesResponse {
  total: number;
  exercises: Exercise[];
}

export interface ApiResponseWithExercises {
  success: boolean;
  message?: string;
  data: ExercisesResponse;
}

// types/index.ts
export interface PassTransaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  // ✅ Remplacer 'type' par 'transactionType' ou autre selon votre type réel
  transactionType?: 'PURCHASE' | 'CONSUMPTION' | 'REFUND';
}

export interface UserBalance {
  balance: number;
  transactions: PassTransaction[];
}

export interface PassPackage {
  id: string;
  amount: number;
  price: number;
  label: string;
  popular?: boolean;
}

export interface PaymentMethod {
  id: 'wave' | 'orange_money' | 'card';
  name: string;
  color: string;
  icon: string;
  description: string;
}

export interface ScanUploadResponse {
  courseId: string;
  title: string;
  subject: string;
  totalImages: number;
  totalSize: number;
  extractedTextLength: number;
  processingTime: number;
  passDebited: boolean;
}

export interface ScanUploadPayload {
  title: string;
  subject: string;
  notes?: string;
  images: File[];
  type?: DocumentType;    // ✅ Optionnel, défaut 'COURS'
  examDate?: string;      // ✅ Optionnel
}

export interface CorrectionGenerateResponse {
  course_id: string;
  type: string;
  correction_latex: string;
  metadata: {
    model: string;
    status: string;
    generated_at: string;
  };
}

export interface ChatResponse {
  reply: string;
  timestamp: string;
}

export interface ChatHistoryResponse {
  course_id: string;
  messages: ChatMessage[];
}

// ═══════════════════════════════════════════════════════════
// SSE STREAMING — Types pour GET /courses/:id/summary/stream
// ═══════════════════════════════════════════════════════════

export type SseEventType =
  | 'status'
  | 'content_chunk'
  | 'map_progress'
  | 'structured_data'
  | 'complete'
  | 'error';

export type SsePhase =
  | 'cache_check'
  | 'billing'
  | 'classification'
  | 'map'
  | 'reduce'
  | 'flashcards'
  | 'saving';

export interface SseStatusData {
  phase: SsePhase;
  message: string;
  progress?: number; // 0-100
}

export interface SseChunkData {
  delta: string;
  totalChars: number;
}

export interface SseMapProgressData {
  chunkIndex: number;
  totalChunks: number;
  tokensUsed: number;
  message: string;
}

export interface SseStructuredData {
  keyTakeaways: KeyTakeaway[];
  flashcards: SummaryFlashcard[];
  suggestedTopics: SuggestedTopic[];
}

export interface SseCompleteData {
  courseId: string;
  totalTokensUsed: number;
  remainingPasses: number;
  processingTimeMs: number;
  fromCache: boolean;
  model: string;
}

export interface SseErrorData {
  code: 'INSUFFICIENT_BALANCE' | 'NOT_FOUND' | 'INVALID_CONTENT' | 'AI_ERROR' | 'INTERNAL_ERROR';
  message: string;
  rolledBack?: boolean;
}

export interface SummaryStreamCallbacks {
  onStatus?: (data: SseStatusData) => void;
  onChunk?: (data: SseChunkData) => void;
  onMapProgress?: (data: SseMapProgressData) => void;
  onStructuredData?: (data: SseStructuredData) => void;
  onComplete?: (data: SseCompleteData) => void;
  onError?: (data: SseErrorData) => void;
}