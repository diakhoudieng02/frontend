/**
 * Configuration de l'API backend
 */
export const API_CONFIG = {
  // URL de base de l'API
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // Timeout des requêtes (30 secondes)
  TIMEOUT: 30000,
  
  // Headers par défaut
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

/**
 * Clés de stockage local
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'docusage_access_token',
  REFRESH_TOKEN: 'docusage_refresh_token',
  USER_DATA: 'docusage_user_data',
};