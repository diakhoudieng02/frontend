// services/revision.service.ts
import { api } from './api';
import { AxiosResponse } from 'axios';

// services/revision.service.ts - Types corrigés

export interface MicroSummaryResponse {
  notion: string;
  microSummary: {
    notion: string;
    microSummary: string;
    relatedChunks: Array<{
      chunkId: string;
      content: string;
      pageNumber: number;
      relevanceScore: number;
    }>;
    generatedAt: string;
    cacheKey: string;
  };
  chunks: Array<{
    chunkId: string;
    content: string;
    pageNumber: number;
    relevanceScore: number;
  }>;
  fromCache: boolean;
}

export interface MethodCardResponse {
  methodCard: {
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
    generatedAt: string;
  };
  processingTime: number;
}

export interface ClearDiagnosticResponse {
  diagnostic: {
    userId: string;
    courseId: string;
    notionCleared: string;
    newOverallScore: number;
    remainingSkills: string[];
    updatedAt: string;
  };
  progressPercentage: number;
}

class RevisionService {
  /**
   * Récupérer une micro-synthèse
   * GET /api/revision/{courseId}/{notion}
   */
  async getMicroSummary(courseId: string, notion: string): Promise<MicroSummaryResponse> {
    try {
      const encodedNotion = encodeURIComponent(notion.trim());
      console.log(`🔍 Appel API: /revision/${courseId}/${encodedNotion}`);
      
      const response: AxiosResponse<MicroSummaryResponse> = await api.get(`/revision/${courseId}/${encodedNotion}`);
      console.log('📥 Réponse micro-summary:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getMicroSummary:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le diagnostic après révision
   * POST /api/revision/{courseId}/clear
   */
  async clearDiagnostic(courseId: string, data: { notion: string; isCorrect: boolean }): Promise<ClearDiagnosticResponse> {
    try {
      const response: AxiosResponse<ClearDiagnosticResponse> = await api.post(`/revision/${courseId}/clear`, data);
      console.log('📥 Réponse clear diagnostic:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur clearDiagnostic:', error);
      throw error;
    }
  }

  /**
   * Générer une fiche méthode
   * POST /api/revision/{courseId}/method-card
   */
  async generateMethodCard(courseId: string, data: { passage: string }): Promise<MethodCardResponse> {
    try {
      console.log('📤 Génération fiche méthode pour:', { 
        courseId, 
        passageLength: data.passage.length 
      });
      
      const response: AxiosResponse<MethodCardResponse> = await api.post(
        `/revision/${courseId}/method-card`, 
        data
      );
      
      console.log('📥 Réponse brute API:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur generateMethodCard:', error);
      throw error;
    }
  }
}

export const revisionService = new RevisionService();