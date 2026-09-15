// src/services/corrections.service.ts
import { api } from './api';
import type {
  ApiResponse,
  ChatMessage,
  CorrectionData,
  CorrectionGenerateResponse,
  ChatResponse,
  ChatHistoryResponse,
} from '@/types/api';

export const correctionsService = {
  /**
   * POST /api/corrections/generate
   * Génère un corrigé pour une épreuve
   */
  generateCorrection: async (courseId: string): Promise<CorrectionData> => {
    console.log('📝 Génération corrigé pour:', courseId);

    const GENERATION_TIMEOUT_MS = 25000;

    const response = await api.post<ApiResponse<CorrectionGenerateResponse>>(
      '/corrections/generate',
      { course_id: courseId },
      { timeoutMs: GENERATION_TIMEOUT_MS }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de la génération du corrigé');
    }

    const responseData = response.data as any;
    const correctionData = responseData.correction || responseData;

    return {
      id: courseId,
      courseId,
      content: correctionData.correction_latex || correctionData.content || '',
      correction_latex: correctionData.correction_latex,
      originalText: '',
      metadata: correctionData.metadata,
      createdAt: correctionData.metadata?.generated_at || new Date().toISOString(),
      updatedAt: correctionData.metadata?.generated_at || new Date().toISOString(),
    };
  },

  /**
   * GET /api/corrections/:courseId/history
   * Retourne l'historique des messages du chat
   */
  getHistory: async (courseId: string): Promise<ChatHistoryResponse> => {
    try {
      console.log('📜 Chargement historique pour:', courseId);
      const response = await api.get<ApiResponse<ChatHistoryResponse>>(
        `/corrections/${courseId}/history`
      );

      if (!response.success || !response.data) {
        return { course_id: courseId, messages: [] };
      }

      const data = response.data as any;
      const messages = data.messages || data.data?.messages || [];

      return {
        course_id: courseId,
        messages: messages.map((m: any) => ({
          id: m.id,
          courseId: m.courseId || courseId,
          userId: m.userId || '',
          role: m.role,
          content: m.content,
          createdAt: m.createdAt || m.created_at,
        })) as ChatMessage[],
      };
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      return { course_id: courseId, messages: [] };
    }
  },

  /**
   * POST /api/corrections/:courseId/chat
   * Envoie un message au tuteur IA
   */
  chat: async (courseId: string, message: string): Promise<ChatResponse> => {
    console.log('💬 Envoi message pour:', courseId);

    const response = await api.post<ApiResponse<ChatResponse>>(
      `/corrections/${courseId}/chat`,
      { message }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de la communication avec le tuteur IA');
    }

    const data = response.data as any;

    return {
      reply: data.reply || data.message?.content || '',
      timestamp: data.timestamp || new Date().toISOString(),
    };
  },

  /**
   * Vérifie si un corrigé existe déjà pour un cours
   */
  hasCorrection: async (courseId: string): Promise<boolean> => {
    try {
      console.log('🔍 Vérification existence corrigé:', courseId);
      const content = await correctionsService.getCorrectionContent(courseId);
      const hasCorrection = Boolean(content && content.trim().length > 0);
      console.log(`📊 Corrigé ${hasCorrection ? 'existe' : "n'existe pas"}`);
      return hasCorrection;
    } catch (error: any) {
      if (error?.status === 404 || error?.response?.status === 404) {
        console.log("📊 Corrigé n'existe pas (404)");
        return false;
      }
      console.error('Erreur vérification corrigé:', error);
      return false;
    }
  },

  /**
   * Récupère le contenu du corrigé depuis l'historique
   */
  getCorrectionContent: async (courseId: string): Promise<string | null> => {
    try {
      console.log('📖 Récupération contenu corrigé pour:', courseId);

      const history = await correctionsService.getHistory(courseId);

      const correctionMessage = history.messages.find(
        (msg) => msg.role === 'assistant'
      );

      if (correctionMessage?.content?.trim()) {
        console.log('✅ Contenu corrigé trouvé dans l\'historique');
        return correctionMessage.content;
      }

      console.log('⚠️ Aucun contenu corrigé trouvé');
      return null;
    } catch (error) {
      console.error('Erreur récupération contenu:', error);
      return null;
    }
  },
};
