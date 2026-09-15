// services/settings.service.ts
import { api } from './api';

export interface UserSettings {
  appearance: {
    darkMode: boolean;
  };
  notifications: {
    revisionReminders: boolean;
    quizResults: boolean;
    chatMessages: boolean;
    appUpdates: boolean;
  };
  language: string;
  updatedAt: string;
}

export interface UpdateSettingsPayload {
  darkMode?: boolean;
  notificationsRevision?: boolean;
  notificationsQuiz?: boolean;
  notificationsChat?: boolean;
  notificationsUpdates?: boolean;
  language?: string;
}

class SettingsService {
  /**
   * Récupère les paramètres de l'utilisateur
   */
  async getSettings(): Promise<UserSettings> {
    try {
      console.log('📤 Récupération des paramètres...');
      const response = await api.get<{ data: UserSettings }>('/users/me/settings');
      console.log('✅ Paramètres reçus:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération paramètres:', error);
      throw error;
    }
  }

  /**
   * Met à jour les paramètres de l'utilisateur
   */
  async updateSettings(payload: UpdateSettingsPayload): Promise<UserSettings> {
    try {
      console.log('📤 Mise à jour des paramètres:', payload);
      const response = await api.patch<{ data: UserSettings }>('/users/me/settings', payload);
      console.log('✅ Paramètres mis à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour paramètres:', error);
      throw error;
    }
  }

  /**
   * Réinitialise les paramètres aux valeurs par défaut
   */
  async resetSettings(): Promise<UserSettings> {
    try {
      console.log('📤 Réinitialisation des paramètres...');
      const response = await api.post<{ data: UserSettings }>('/users/me/settings/reset');
      console.log('✅ Paramètres réinitialisés:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur réinitialisation paramètres:', error);
      throw error;
    }
  }
}

export const settingsService = new SettingsService();