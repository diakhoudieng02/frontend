import { useState, useEffect, useCallback, useRef } from 'react';
import { trackingService } from '@/services/tracking.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { AnalyticsResponse } from '@/services/tracking.service';

export function useTracking() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AnalyticsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  
  // ✅ Références pour le contrôle d'état
  const initializedRef = useRef(false);
  const isTrackingRef = useRef(false);
  const isCreatingRef = useRef(false);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout>();
  const lastVisibilityChangeRef = useRef<number>(0);
  // ✅ Ajout de heartbeatStartedRef manquant
  const heartbeatStartedRef = useRef(false);

  // ✅ Déplacer fetchStats avant son utilisation
  const fetchStats = useCallback(async (days: number = 7) => {
    if (!isAuthenticated) return;

    setLoadingStats(true);
    try {
      const data = await trackingService.getStats(days);
      setStats(data);
    } catch (error) {
      console.error('❌ Erreur chargement stats:', error);
      setStats({
        today: new Date().toISOString().split('T')[0],
        todayActivity: {
          date: new Date().toISOString().split('T')[0],
          totalMinutes: 0,
          actions: { chats: 0, exercises: 0, analyses: 0 }
        },
        last7Days: [],
        totalMinutes: 0,
        totalActions: { chats: 0, exercises: 0, analyses: 0 }
      });
    } finally {
      setLoadingStats(false);
    }
  }, [isAuthenticated]);

  const createNewSession = useCallback(async () => {
    if (isCreatingRef.current) {
      console.log('⚠️ Création session déjà en cours, ignoré');
      return;
    }
    
    if (isTrackingRef.current) {
      console.log('⚠️ Tracking déjà actif, création ignorée');
      return;
    }

    isCreatingRef.current = true;

    try {
      console.log('🆕 Création nouvelle session...');
      const session = await trackingService.createSession();

      if (!session?.sessionId) {
        console.error('❌ Session créée sans ID');
        return;
      }

      console.log('✅ Nouvelle session créée:', session.sessionId);

      trackingService.startHeartbeat(session.sessionId, () => {
        console.log('⏰ Session expirée');
        isTrackingRef.current = false;
        heartbeatStartedRef.current = false;
        isCreatingRef.current = false;
        
        setTimeout(() => {
          if (document.visibilityState === 'visible' && isAuthenticated) {
            createNewSession();
          }
        }, 5000);
      });

      setIsTrackingActive(true);
      isTrackingRef.current = true;
      heartbeatStartedRef.current = true;
    } catch (error) {
      console.error('❌ Erreur création session:', error);
    } finally {
      isCreatingRef.current = false;
    }
  }, [isAuthenticated]);

  const initializeTracking = useCallback(async () => {
    if (!isAuthenticated) return;
    if (isTrackingRef.current) {
      console.log('⚠️ Tracking déjà actif, initialisation ignorée');
      return;
    }
    if (isCreatingRef.current) {
      console.log('⚠️ Création en cours, initialisation ignorée');
      return;
    }

    try {
      const activeSessionId = await trackingService.getActiveSession();

      if (activeSessionId) {
        console.log('✅ Session active trouvée:', activeSessionId);
        
        trackingService.startHeartbeat(activeSessionId, () => {
          console.log('⏰ Session expirée');
          isTrackingRef.current = false;
          heartbeatStartedRef.current = false;
          setTimeout(() => {
            if (document.visibilityState === 'visible' && isAuthenticated) {
              createNewSession();
            }
          }, 5000);
        });
        
        setIsTrackingActive(true);
        isTrackingRef.current = true;
        heartbeatStartedRef.current = true;
      } else {
        await createNewSession();
      }
    } catch (error) {
      console.error('❌ Erreur initialisation tracking:', error);
    }
  }, [isAuthenticated, createNewSession]);

  const resumeTracking = useCallback(() => {
    const now = Date.now();
    if (now - lastVisibilityChangeRef.current < 1000) {
      console.log('⏱️ Reprise ignorée (trop rapprochée)');
      return;
    }
    lastVisibilityChangeRef.current = now;

    const sessionId = trackingService.getCurrentSessionId();
    
    if (!isAuthenticated) return;
    if (isTrackingRef.current) {
      console.log('⚠️ Tracking déjà actif, reprise ignorée');
      return;
    }
    if (isCreatingRef.current) {
      console.log('⚠️ Création en cours, reprise ignorée');
      return;
    }
    if (heartbeatStartedRef.current) {
      console.log('⚠️ Heartbeat déjà démarré, reprise ignorée');
      return;
    }

    if (sessionId) {
      console.log('🔄 Reprise heartbeat avec session:', sessionId);
      trackingService.startHeartbeat(sessionId, () => {
        isTrackingRef.current = false;
        heartbeatStartedRef.current = false;
        setTimeout(() => {
          if (document.visibilityState === 'visible' && isAuthenticated) {
            createNewSession();
          }
        }, 5000);
      });
      setIsTrackingActive(true);
      isTrackingRef.current = true;
      heartbeatStartedRef.current = true;
    } else {
      console.log('🔄 Pas de session, création...');
      createNewSession();
    }
  }, [isAuthenticated, createNewSession]);

  const pauseTracking = useCallback(() => {
    console.log('👀 Page cachée, pause tracking');
    trackingService.stopHeartbeat();
    setIsTrackingActive(false);
    heartbeatStartedRef.current = false;
  }, []);

  const trackAction = useCallback(async (
    actionType: 'chats' | 'exercises' | 'analyses',
    showToast: boolean = false
  ) => {
    if (!isAuthenticated) return;

    try {
      const response = await trackingService.trackAction(actionType);

      if (showToast) {
        toast({
          title: "✅ Action enregistrée",
          description: `${response.data.newCount} ${actionType} aujourd'hui`,
        });
      }

      if (stats) fetchStats();
      return response;
    } catch (error) {
      console.error(`❌ Erreur tracking ${actionType}:`, error);
    }
  }, [isAuthenticated, stats, toast, fetchStats]); // ✅ Ajout de fetchStats dans les dépendances

  const formatTime = useCallback((minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes > 0 ? remainingMinutes : ''}`;
  }, []);

  const stopTracking = useCallback(() => {
    trackingService.stopHeartbeat();
    trackingService.clearSession();
    setIsTrackingActive(false);
    isTrackingRef.current = false;
    isCreatingRef.current = false;
    heartbeatStartedRef.current = false;
  }, []);

  // ✅ Initialisation unique
  useEffect(() => {
    if (isAuthenticated && !initializedRef.current) {
      initializedRef.current = true;
      initializeTracking();
      fetchStats();
    }

    return () => {
      if (!isAuthenticated) {
        stopTracking();
        initializedRef.current = false;
      }
    };
  }, [isAuthenticated, initializeTracking, fetchStats, stopTracking]); // ✅ Ajout des dépendances manquantes

  // ✅ Gestion visibilityChange
  useEffect(() => {
    let isFirstVisible = true;
    
    const handleVisibilityChange = () => {
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }

      if (document.hidden) {
        pauseTracking();
      } else {
        visibilityTimeoutRef.current = setTimeout(() => {
          if (isFirstVisible) {
            isFirstVisible = false;
            return;
          }
          
          if (!document.hidden && isAuthenticated) {
            resumeTracking();
          }
        }, 800);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [isAuthenticated, pauseTracking, resumeTracking]);

  return {
    stats,
    loadingStats,
    isTrackingActive,
    trackAction,
    fetchStats,
    formatTime,
    stopTracking,
  };
}