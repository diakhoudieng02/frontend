// services/payment.service.ts
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { 
  CreatePaymentPayload,
  CreatePaymentResponse,
  PaymentStatusResponse,
  PackagesResponse,
  PassPackage
} from '@/types/payment.types';

export const paymentService = {
  /**
   * Récupérer les packs disponibles
   * GET /api/payments/packages
   */
  getPackages: async (): Promise<PassPackage[]> => {
    try {
      const response = await api.get<ApiResponse<PackagesResponse>>('/payments/packages');
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur chargement forfaits');
      }

      // ✅ Cast explicite à cause de la structure ApiResponse
      return response.data.packages as unknown as PassPackage[];
    } catch (error) {
      console.error('❌ Erreur chargement forfaits:', error);
      
      // Fallback pour le développement
      return [
        {
          id: 'pack-1',
          name: 'Pack Découverte',
          passAmount: 3,
          tokenEquivalent: 3_000_000,
          priceCfa: 350,
          pricePerPass: 116.67,
          savings: 0,
          isActive: true
        },
        {
          id: 'pack-2',
          name: 'Pack Standard',
          passAmount: 10,
          tokenEquivalent: 10_000_000,
          priceCfa: 500,
          pricePerPass: 50,
          savings: 10,
          recommended: true,
          isActive: true
        },
        {
          id: 'pack-3',
          name: 'Pack Avancé',
          passAmount: 25,
          tokenEquivalent: 25_000_000,
          priceCfa: 1000,
          pricePerPass: 40,
          savings: 20,
          isActive: true
        }
      ];
    }
  },

  /**
   * Créer un paiement
   * POST /api/payments/create
   */
  createPayment: async (payload: CreatePaymentPayload): Promise<CreatePaymentResponse> => {
    const response = await api.post<ApiResponse<CreatePaymentResponse>>('/payments/initialize', payload);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur création paiement');
    }

    // ✅ Cast explicite
    return response.data as unknown as CreatePaymentResponse;
  },

  /**
   * Vérifier le statut d'un paiement
   * GET /api/payments/{id}/status
   */
  // Dans payment.service.ts - Ajouter plus de logs
checkPaymentStatus: async (transactionId: string): Promise<PaymentStatusResponse> => {
  console.log(`🔍 Vérification statut pour transaction: ${transactionId}`);
  try {
    const response = await api.get<ApiResponse<PaymentStatusResponse>>(`/payments/status/${transactionId}`);
    console.log('📥 Réponse statut:', response);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur vérification paiement');
    }

    return response.data as unknown as PaymentStatusResponse;
  } catch (error) {
    console.error('❌ Erreur checkPaymentStatus:', error);
    throw error;
  }
},
};