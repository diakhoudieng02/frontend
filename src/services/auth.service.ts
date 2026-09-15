// services/auth.service.ts

import { api } from './api';
import type {
  ApiResponse,
  RegisterRequestPayload,
  RegisterVerifyPayload,
  LoginRequestPayload,
  LoginVerifyPayload,
  GoogleAuthPayload,
  AuthResponse,
  AuthUser,
} from '@/types/api';

export const authService = {
  /**
   * INSCRIPTION - Étape 1 : Demande d'OTP
   */
  registerRequest: async (payload: RegisterRequestPayload): Promise<void> => {
    // ✅ Spécifier le type générique ApiResponse<void>
    const response = await api.post<ApiResponse<void>>('/auth/register', payload);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de l\'envoi de l\'OTP');
    }
  },

  /**
   * INSCRIPTION - Étape 2 : Vérification OTP
   */
  registerVerify: async (payload: RegisterVerifyPayload): Promise<AuthResponse> => {
    // ✅ Spécifier le type générique ApiResponse<AuthResponse>
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/register/verify',
      payload
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de la vérification');
    }
    
    return response.data;
  },

  /**
   * CONNEXION - Étape 1 : Demande d'OTP
   */
  loginRequest: async (payload: LoginRequestPayload): Promise<void> => {
    // ✅ Spécifier le type générique ApiResponse<void>
    const response = await api.post<ApiResponse<void>>('/auth/login', payload);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de l\'envoi de l\'OTP');
    }
  },

  /**
   * CONNEXION - Étape 2 : Vérification OTP
   */
  loginVerify: async (payload: LoginVerifyPayload): Promise<AuthResponse> => {
    // ✅ Spécifier le type générique ApiResponse<AuthResponse>
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/login/verify',
      payload
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de la connexion');
    }
    
    return response.data;
  },

  /**
   * INSCRIPTION GOOGLE OAUTH
   */
  googleRegister: async (payload: GoogleAuthPayload): Promise<AuthResponse> => {
    console.log('📤 Envoi inscription Google:', payload);
    
    try {
      // ✅ Spécifier le type générique ApiResponse<AuthResponse>
      const response = await api.post<ApiResponse<AuthResponse>>(
        '/auth/google/register',
        payload
      );

      console.log('📥 Réponse inscription Google:', response);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur inscription Google');
      }

      return response.data;
    } catch (error) {
      console.error('❌ Erreur googleRegister:', error);
      throw error;
    }
  },

  /**
   * CONNEXION GOOGLE OAUTH
   */
  googleLogin: async (payload: GoogleAuthPayload): Promise<AuthResponse> => {
    // ✅ Spécifier le type générique ApiResponse<AuthResponse>
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/google/login',
      payload
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur connexion Google');
    }

    return response.data;
  },

  /**
   * DÉCONNEXION
   */
  logout: async (): Promise<void> => {
    // JWT stateless - nettoyage côté client uniquement
  },

  /**
   * MISE À JOUR DU PROFIL
   */
  updateProfile: async (userData: Partial<AuthUser>): Promise<AuthUser> => {
    // ✅ Spécifier le type générique ApiResponse<AuthUser>
    const response = await api.post<ApiResponse<AuthUser>>('/users/profile', userData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de la mise à jour du profil');
    }
    
    return response.data;
  }
};