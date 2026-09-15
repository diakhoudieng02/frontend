import { api } from './api';

export interface SessionResponse {
  sessionId: string;
  startTime: string;
  message: string;
}

export interface HeartbeatResponse {
  success: boolean;
  minutesAdded: number;
  sessionId: string;
}

export interface ActionResponse {
  success: boolean;
  data: {
    success: boolean;
    actionType: 'chats' | 'exercises' | 'analyses';
    newCount: number;
  };
}

export interface DailyActivity {
  date: string;
  totalMinutes: number;
  actions: {
    chats: number;
    exercises: number;
    analyses: number;
  };
}

export interface AnalyticsResponse {
  today: string;
  todayActivity: DailyActivity;
  last7Days: DailyActivity[];
  totalMinutes: number;
  totalActions: {
    chats: number;
    exercises: number;
    analyses: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class TrackingService {
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private currentSessionId: string | null = null;
  private onSessionExpiredCallback: (() => void) | null = null;
  private heartbeatStartLock = false;

  async createSession(): Promise<SessionResponse> {
    try {
      console.log('📤 Création nouvelle session...');
      const response = await api.post<ApiResponse<SessionResponse>>('/tracking/session');

      console.log('📦 Réponse brute création session:', response);

      if (!response.success || !response.data) {
        throw new Error('Réponse invalide du serveur');
      }

      if (!response.data.sessionId) {
        console.error('❌ Réponse sans sessionId:', response);
        throw new Error('Session ID manquant dans la réponse');
      }

      this.currentSessionId = response.data.sessionId;
      console.log('✅ Session de tracking créée:', response.data.sessionId);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création session:', error);
      throw error;
    }
  }

  async getActiveSession(): Promise<string | null> {
    try {
      console.log('🔍 Recherche session active...');
      const response = await api.get<ApiResponse<{ sessionId: string } | null>>('/tracking/session/active');

      console.log('📦 Réponse session active:', response);

      if (response.success && response.data && response.data.sessionId) {
        this.currentSessionId = response.data.sessionId;
        console.log('✅ Session active trouvée:', response.data.sessionId);
        return response.data.sessionId;
      }

      console.log('ℹ️ Aucune session active trouvée');
      return null;
    } catch (error) {
      console.error('❌ Erreur récupération session active:', error);
      return null;
    }
  }

  async sendHeartbeat(sessionId: string): Promise<HeartbeatResponse> {
    try {
      if (!sessionId) throw new Error('Session ID manquant');

      console.log(`💓 Envoi heartbeat pour session: ${sessionId}`);
      const response = await api.post<ApiResponse<HeartbeatResponse>>('/tracking/heartbeat', { sessionId });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur heartbeat');
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur heartbeat:', error.message || error);

      if (error.status === 404 || error.status === 400) {
        console.log('⏰ Session expirée ou invalide, arrêt heartbeat');
        
        // ✅ Stopper le heartbeat AVANT de notifier pour éviter la boucle
        this.stopHeartbeat();
        
        // ✅ Récupérer et null-ifier le callback avant de l'appeler
        const cb = this.onSessionExpiredCallback;
        this.onSessionExpiredCallback = null;
        if (cb) cb();
      }

      throw error;
    }
  }

  async trackAction(actionType: 'chats' | 'exercises' | 'analyses'): Promise<ActionResponse> {
    try {
      console.log(`📤 Tracking action: ${actionType}`);
      const response = await api.post<ApiResponse<ActionResponse>>('/tracking/action', { actionType });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur tracking action');
      }

      console.log(`✅ Action trackée: ${actionType} (total: ${response.data.data.newCount})`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur tracking action ${actionType}:`, error);
      throw error;
    }
  }

  async getStats(days: number = 7): Promise<AnalyticsResponse> {
    try {
      console.log(`📊 Récupération statistiques (${days} jours)...`);
      const response = await api.get<ApiResponse<AnalyticsResponse>>(`/analytics/stats?days=${days}`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur récupération stats');
      }

      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération stats:', error);
      throw error;
    }
  }
startHeartbeat(sessionId: string, onExpired?: () => void) {
  // ✅ Évite les démarrages multiples en très peu de temps
  if (this.heartbeatStartLock) {
    console.log('🔒 Heartbeat déjà en cours de démarrage, ignoré');
    return;
  }
  
  // ✅ Vérification sessionId
  if (!sessionId) {
    console.error('❌ Impossible de démarrer heartbeat: sessionId manquant');
    return;
  }

  // ✅ Active le lock
  this.heartbeatStartLock = true;

  try {
    // ✅ Toujours stopper l'ancien heartbeat avant d'en démarrer un nouveau
    this.stopHeartbeat();

    this.currentSessionId = sessionId;
    this.onSessionExpiredCallback = onExpired || null;

    console.log('▶️ Démarrage heartbeat tracking avec session:', sessionId);

    // ✅ Premier heartbeat immédiat
    this.sendHeartbeat(sessionId).catch(error => {
      console.error('❌ Erreur premier heartbeat:', error);
      // Le callback onExpired est déjà géré dans sendHeartbeat
    });

    // ✅ Puis toutes les 60 secondes
    this.heartbeatInterval = setInterval(async () => {
      try {
        if (!this.currentSessionId) {
          console.warn('⚠️ Pas de session active pour heartbeat');
          this.stopHeartbeat();
          return;
        }

        // ✅ Vérifie que c'est toujours la même session
        if (this.currentSessionId !== sessionId) {
          console.warn('⚠️ Session changée, arrêt ancien heartbeat');
          this.stopHeartbeat();
          return;
        }

        const response = await this.sendHeartbeat(this.currentSessionId);
        console.log(`💓 Heartbeat réussi: +${response.minutesAdded} minute(s)`);
      } catch (error) {
        console.error('❌ Erreur heartbeat interval:', error);
        // sendHeartbeat gère déjà le callback onExpired et stopHeartbeat
      }
    }, 60000);

  } finally {
    // ✅ Libère le lock après un délai pour éviter les démarrages en rafale
    setTimeout(() => {
      this.heartbeatStartLock = false;
      console.log('🔓 Lock heartbeat libéré');
    }, 2000); // Délai de 2 secondes
  }
}

stopHeartbeat() {
  if (this.heartbeatInterval) {
    clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = null;
    console.log('⏹️ Heartbeat arrêté');
  }
}

clearSession() {
  this.currentSessionId = null;
  this.onSessionExpiredCallback = null;
  this.stopHeartbeat();
  this.heartbeatStartLock = false; // Reset du lock
}

getCurrentSessionId(): string | null {
  return this.currentSessionId;
}
}

export const trackingService = new TrackingService();