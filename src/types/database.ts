export type SchoolLevel = 'Seconde' | 'Premiere' | 'Terminale';

export interface Profile {
  id: string;
  phone_number: string | null;
  school_level: SchoolLevel | null;
  created_at: string;
}

export interface PassBalance {
  user_id: string;
  balance: number;
  updated_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  file_url: string;
  extracted_text: string | null;
  created_at: string;
}

export interface CourseChunk {
  id: string;
  course_id: string;
  chunk_index: number;
  content: string;
  embedding: number[] | null;
}

export interface ChatMessage {
  id: string;
  course_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: ChatSource[] | null;
  created_at: string;
}

export interface ChatSource {
  chunk_id: string;
  content: string;
  relevance_score: number;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  coursesCount: number;
}

// Mock user for simulation
export interface MockUser {
  id: string;
  phone_number: string;
  school_level: SchoolLevel;
  pass_balance: number;
}

