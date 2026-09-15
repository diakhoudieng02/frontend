export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  course_id?: string;
  course_title?: string;
  last_message?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateConversationPayload {
  title: string;
  course_id?: string;
  course_title?: string;
  initial_message?: string;
}

