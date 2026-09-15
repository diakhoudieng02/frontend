// hooks/useWelcomeModal.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTracking } from '@/hooks/useTracking';

const STORAGE_KEY = 'has_seen_welcome_modal';

/**
 * Déclenche la modal de bienvenue uniquement à la première connexion.
 * Conditions : utilisateur authentifié + jamais vu la modal (localStorage).
 * Persistance : localStorage uniquement.
 */
export function useWelcomeModal() {
  const { user, isAuthenticated } = useAuth();
  const { trackAction } = useTracking();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Clé unique par utilisateur pour éviter les conflits multi-comptes
    const storageKey = `${STORAGE_KEY}_${user.id}`;
    const hasSeen = localStorage.getItem(storageKey);

    if (!hasSeen) {
      // Légère temporisation pour laisser le dashboard se charger d'abord
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
        // Tracker l'événement d'affichage
        trackAction('analyses', false).catch(() => {});
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user]);

  const closeWelcomeModal = () => {
    if (!user) return;
    const storageKey = `${STORAGE_KEY}_${user.id}`;
    localStorage.setItem(storageKey, 'true');
    setShowWelcomeModal(false);
  };

  return { showWelcomeModal, closeWelcomeModal };
}