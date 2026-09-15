// services/support.service.ts
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { 
  SupportTicket,
  CreateTicketPayload,
  CreateTicketResponse,
  SupportStats
} from '@/types/support.types';

export const supportService = {
  /**
   * Créer un ticket de support
   * POST /api/support/contact
   */
  createTicket: async (payload: CreateTicketPayload): Promise<CreateTicketResponse> => {
    try {
      const response = await api.post<ApiResponse<CreateTicketResponse>>('/support/contact', payload);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur lors de l\'envoi du message');
      }

      return response.data as unknown as CreateTicketResponse;
    } catch (error) {
      console.error('❌ Erreur création ticket:', error);
      throw error;
    }
  },

  /**
   * Récupérer mes tickets
   * GET /api/support/my-tickets
   */
  getMyTickets: async (): Promise<SupportTicket[]> => {
    try {
      const response = await api.get<ApiResponse<SupportTicket[]>>('/support/my-tickets');

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur lors du chargement des tickets');
      }

      return response.data as unknown as SupportTicket[];
    } catch (error) {
      console.error('❌ Erreur chargement tickets:', error);
      return [];
    }
  },

  /**
   * Récupérer un ticket spécifique
   * GET /api/support/tickets/{id}
   */
  getTicketById: async (ticketId: string): Promise<SupportTicket> => {
    try {
      const response = await api.get<ApiResponse<SupportTicket>>(`/support/tickets/${ticketId}`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur lors du chargement du ticket');
      }

      return response.data as unknown as SupportTicket;
    } catch (error) {
      console.error('❌ Erreur chargement ticket:', error);
      throw error;
    }
  },

  /**
   * Récupérer les statistiques (admin)
   * GET /api/support/stats
   */
  getStats: async (): Promise<SupportStats> => {
    try {
      const response = await api.get<ApiResponse<SupportStats>>('/support/stats');

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur lors du chargement des statistiques');
      }

      return response.data as unknown as SupportStats;
    } catch (error) {
      console.error('❌ Erreur chargement stats:', error);
      throw error;
    }
  }
};