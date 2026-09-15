// hooks/useSettings.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { settingsService, type UserSettings, type UpdateSettingsPayload } from '@/services/settings.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';

export function useSettings() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // ✅ Utiliser des refs pour éviter les dépendances circulaires
  const fetchedRef = useRef(false);
  const themeRef = useRef(theme);

  // Mettre à jour la ref quand le thème change
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Charger les paramètres
  const fetchSettings = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
      
      // Synchroniser le thème local avec les paramètres
      if (data.appearance.darkMode && themeRef.current === 'light') {
        setTheme('dark');
      } else if (!data.appearance.darkMode && themeRef.current === 'dark') {
        setTheme('light');
      }
    } catch (error) {
      console.error('❌ Erreur chargement paramètres:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos paramètres',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, setTheme, toast]); // ✅ Dépendances stables

  // Charger au montage (une seule fois)
  useEffect(() => {
    if (isAuthenticated && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchSettings();
    }
    
    // Nettoyer à la déconnexion
    return () => {
      if (!isAuthenticated) {
        fetchedRef.current = false;
      }
    };
  }, [isAuthenticated, fetchSettings]); // ✅ Dépendances stables

  // Mettre à jour les paramètres
  const updateSettings = useCallback(async (payload: UpdateSettingsPayload) => {
    if (!isAuthenticated) return;

    setUpdating(true);
    try {
      const updated = await settingsService.updateSettings(payload);
      setSettings(updated);
      
      if (payload.darkMode !== undefined) {
        setTheme(payload.darkMode ? 'dark' : 'light');
      }
      
      toast({
        title: '✅ Paramètres mis à jour',
        description: 'Vos préférences ont été enregistrées',
      });
      
      return updated;
    } catch (error: any) {
      console.error('❌ Erreur mise à jour paramètres:', error);
      
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour vos paramètres',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  }, [isAuthenticated, setTheme, toast]);

  // Réinitialiser les paramètres
  const resetSettings = useCallback(async () => {
    if (!isAuthenticated) return;

    setUpdating(true);
    try {
      const reset = await settingsService.resetSettings();
      setSettings(reset);
      setTheme(reset.appearance.darkMode ? 'dark' : 'light');
      
      toast({
        title: '🔄 Paramètres réinitialisés',
        description: 'Vos préférences ont été restaurées aux valeurs par défaut',
      });
      
      return reset;
    } catch (error) {
      console.error('❌ Erreur réinitialisation paramètres:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de réinitialiser vos paramètres',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  }, [isAuthenticated, setTheme, toast]);

  return {
    settings,
    loading,
    updating,
    fetchSettings,
    updateSettings,
    resetSettings,
  };
}