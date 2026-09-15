import { useEffect } from 'react'

// ✅ Incrémenter à chaque déploiement en production
export const APP_VERSION = '1.2.9'

/**
 * Détecte si une nouvelle version a été déployée et force
 * un rechargement propre (cache JS + Service Worker).
 *
 * Usage : appeler useAppVersion() en premier dans App.tsx
 */
export function useAppVersion() {
  useEffect(() => {
    const VERSION_KEY = 'app_version'
    const savedVersion = localStorage.getItem(VERSION_KEY)

    if (savedVersion === null) {
      // Premier lancement — on stocke sans recharger
      localStorage.setItem(VERSION_KEY, APP_VERSION)
      return
    }

    if (savedVersion !== APP_VERSION) {
      console.log(`[Version] Mise à jour détectée : ${savedVersion} → ${APP_VERSION}`)

      // ✅ Invalide le cache du Service Worker existant (sw.js)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((reg) => reg.unregister())
        })
      }

      // ✅ Vide tous les caches navigateur
      if ('caches' in window) {
        caches.keys().then((names) => names.forEach((name) => caches.delete(name)))
      }

      localStorage.setItem(VERSION_KEY, APP_VERSION)
      window.location.reload()
    }
  }, [])
}