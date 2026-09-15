// services/pass.service.ts
import { api } from './api';
import type { ApiResponse } from '@/types/api';
import type { 
  PassBalance,
  PassHistoryResponse,
  PassTransaction
} from '@/types';

class PassService {
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ✅ Récupérer le solde (API /pass/balance)
  async getBalance(): Promise<PassBalance> {
    try {
      const response = await api.get<ApiResponse<PassBalance>>('/pass/balance');
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur chargement solde');
      }

      return response.data;
    } catch (error) {
      console.error('❌ Erreur getBalance:', error);
      throw error; // Ne pas utiliser de fallback en production
    }
  }

  // ✅ Récupérer l'historique des transactions (API /pass/ledger)
  async getHistory(limit: number = 50): Promise<PassHistoryResponse> {
    try {
      console.log(`📡 Chargement historique avec limit=${limit}`);
      
      const response = await api.get<ApiResponse<PassHistoryResponse>>('/pass/history', {
        params: { limit }
      });
      
      console.log('✅ Réserve brute:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Erreur chargement historique');
      }

      // La réponse a la structure { success: true, data: { total, transactions } }
      const historyData = response.data;
      
      if (!historyData || !historyData.transactions) {
        console.warn('⚠️ Structure inattendue:', historyData);
        return {
          total: 0,
          transactions: []
        };
      }

      // ✅ Formater les transactions si nécessaire
      const transactions = historyData.transactions.map(tx => ({
        ...tx,
        // S'assurer que le montant est bien un nombre
        amount: typeof tx.amount === 'string' ? parseInt(tx.amount, 10) : tx.amount,
        // S'assurer que la date est au bon format
        createdAt: tx.createdAt || new Date().toISOString()
      }));

      console.log(`✅ ${transactions.length} transactions chargées`);

      return {
        total: historyData.total || transactions.length,
        transactions
      };
    } catch (error) {
      console.error('❌ Erreur getHistory:', error);
      
      // En production, on propage l'erreur
      throw error;
    }
  }

  // ✅ Consommer des passes
  async consumePass(amount: number = 1, actionType: string = 'IA_CHAT', metadata?: any): Promise<{ success: boolean; remaining?: number }> {
    try {
      const response = await api.post<ApiResponse<{ remaining: number }>>('/pass/balance', { 
        amount,
        actionType,
        metadata
      });

      if (!response.success) {
        throw new Error(response.message || 'Erreur consommation');
      }

      return { 
        success: true, 
        remaining: response.data?.remaining 
      };
    } catch (error) {
      console.error('❌ Erreur consumePass:', error);
      return { success: false };
    }
  }

  // ✅ Consommer des tokens (équivalent en tokens)
  async consumeTokens(tokensUsed: number, actionType: string, metadata?: any): Promise<void> {
    try {
      const response = await api.post<ApiResponse<void>>('/pass/estimate', {
        tokensUsed,
        actionType,
        metadata
      });

      if (!response.success) {
        throw new Error(response.message || 'Erreur consommation tokens');
      }
    } catch (error) {
      console.error('❌ Erreur consumeTokens:', error);
      throw error;
    }
  }

  // ✅ Vérifier si assez de passes
  async checkBalance(requiredTokens: number): Promise<{ hasEnough: boolean; remaining: number }> {
    try {
      const balance = await this.getBalance();
      const hasEnough = balance.totalTokens >= requiredTokens;
      
      return {
        hasEnough,
        remaining: balance.totalTokens - requiredTokens
      };
    } catch (error) {
      console.error('❌ Erreur checkBalance:', error);
      return { hasEnough: false, remaining: 0 };
    }
  }

  // Heartbeat
  startHeartbeat() {
    if (this.heartbeatInterval) return;
    this.heartbeatInterval = setInterval(async () => {
      try {
        await api.post('/tracking/heartbeat', {
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    }, 60000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export const passService = new PassService();
