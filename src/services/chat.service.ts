// src/services/chat.service.ts - Version corrigée
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  courseId?: string;
  courseTitle?: string;
  citations?: Array<{
    chunkId: string;
    page: number;
    content: string;
  }>;
  passCost?: number;
}

export interface CourseReference {
  id: string;
  title: string;
  subject: string;
  relevance?: number;  // ✅ Optionnel
  fileUrl?: string;
}

export interface SendMessageParams {
  message: string;
  courseId: string;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  passDebited: boolean;
  remainingPasses: number;
}

class ChatService {
  /**
   * Récupérer les cours de l'utilisateur
   * GET /courses
   */
  async getUserCourses(): Promise<CourseReference[]> {
    try {
      const response = await api.get<ApiResponse<{ courses: CourseReference[] }>>('/courses');
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur lors du chargement des cours');
      }

      // ✅ Cast explicite en deux étapes
      const data = response.data as unknown as { courses: CourseReference[] };
      
      return data.courses.map((course: any) => ({
        id: course.id,
        title: course.title,
        subject: course.subject,
        // ✅ Valeur par défaut si relevance n'existe pas
        relevance: course.relevance || 1.0,
        fileUrl: course.fileUrl
      }));
    } catch (error) {
      console.error('❌ Erreur chargement cours:', error);
      return [];
    }
  }

  /**
   * Envoyer un message au chat IA
   * POST /courses/{courseId}/chat
   */
  async sendMessage({ message, courseId }: SendMessageParams): Promise<SendMessageResponse> {
    if (!courseId) {
      throw new Error('Un cours doit être sélectionné pour envoyer un message');
    }

    try {
      console.log('📡 Envoi message au cours:', courseId);
      
      const response = await api.post<ApiResponse<SendMessageResponse>>(
        `/courses/${courseId}/chat`,
        { message }
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Erreur lors de l'envoi du message");
      }

      // ✅ Cast explicite pour le type de retour
      return response.data as unknown as SendMessageResponse;
      
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();