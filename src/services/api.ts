export interface ApiError {
  message: string;
  status: number;
  error?: string;
}

type RequestOptions = RequestInit & {
  timeoutMs?: number;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://srv1346125.hstgr.cloud/api';

// ─────────────────────────────────────────────────────────────
// ✅ Constantes de validation (partagées avec les composants)
// ─────────────────────────────────────────────────────────────
export const UPLOAD_LIMITS = {
  MAX_SIZE_MB: 15,
  MAX_SIZE_BYTES: 15 * 1024 * 1024,
  MAX_FILES: 5,
} as const;

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null): void {
  if (import.meta.env.DEV) {
    console.debug('[api] setAccessToken:', token ? `${token.length} chars` : 'null');
  }
  accessToken = token;
}

export function setOnUnauthorized(callback: () => void): void {
  onUnauthorized = callback;
}

// ─────────────────────────────────────────────────────────────
// ✅ Validation taille fichier(s) — à appeler AVANT fetch()
// ─────────────────────────────────────────────────────────────

/**
 * Valide un fichier unique.
 * Retourne un message d'erreur lisible, ou null si OK.
 */
export function validateFileSize(file: File): string | null {
  if (file.size > UPLOAD_LIMITS.MAX_SIZE_BYTES) {
    const fileMB = (file.size / (1024 * 1024)).toFixed(2);
    return `"${file.name}" est trop lourd (${fileMB} Mo). La limite est de ${UPLOAD_LIMITS.MAX_SIZE_MB} Mo.`;
  }
  return null;
}

/**
 * Valide un tableau de fichiers (taille individuelle + taille cumulée).
 * Retourne un message d'erreur lisible, ou null si OK.
 */
export function validateFiles(files: File[]): string | null {
  for (const file of files) {
    const err = validateFileSize(file);
    if (err) return err;
  }

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  if (totalBytes > UPLOAD_LIMITS.MAX_SIZE_BYTES) {
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
    return `La taille totale des fichiers (${totalMB} Mo) dépasse la limite de ${UPLOAD_LIMITS.MAX_SIZE_MB} Mo.`;
  }

  if (files.length > UPLOAD_LIMITS.MAX_FILES) {
    return `Vous ne pouvez pas envoyer plus de ${UPLOAD_LIMITS.MAX_FILES} fichiers à la fois.`;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// ✅ Extraction du message d'erreur serveur
// ─────────────────────────────────────────────────────────────

/**
 * Transforme n'importe quelle erreur capturée en message lisible.
 * Priorité : message serveur > status connu > fallback générique.
 */
export function extractErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Une erreur inattendue est survenue.';
  }

  const err = error as Record<string, unknown>;

  // Erreur déjà structurée par api.ts (ApiError)
  if (typeof err.message === 'string' && err.message.trim()) {
    return err.message;
  }

  // Réponse Axios (error.response.data.message)
  const data = err.response && typeof err.response === 'object'
    ? (err.response as Record<string, unknown>).data
    : null;

  if (data && typeof data === 'object') {
    const msg = (data as Record<string, unknown>).message;
    if (Array.isArray(msg) && msg.length > 0) return String(msg[0]);
    if (typeof msg === 'string' && msg.trim()) return msg;
  }

  // Status HTTP connus
  const status = typeof err.status === 'number' ? err.status : null;
  if (status === 413) return `Fichier trop volumineux. La limite est de ${UPLOAD_LIMITS.MAX_SIZE_MB} Mo.`;
  if (status === 415) return 'Format de fichier non supporté.';
  if (status === 422) return 'Le document envoyé n\'est pas valide.';
  if (status === 429) return 'Trop de requêtes. Veuillez patienter avant de réessayer.';
  if (status === 408) return 'La requête a expiré. La génération peut encore être en cours.';
  if (status === 500) return 'Erreur serveur. Veuillez réessayer plus tard.';
  if (status === 503) return 'Service temporairement indisponible.';

  return 'Une erreur inattendue est survenue.';
}

// ─────────────────────────────────────────────────────────────
// ✅ Fonction request() principale
// ─────────────────────────────────────────────────────────────
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else if (import.meta.env.DEV) {
    console.warn('[api] Requête sans token :', options.method ?? 'GET', endpoint);
  }

  // FormData → laisser le navigateur définir Content-Type (boundary multipart)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  if (import.meta.env.DEV) {
    console.debug('[api] →', options.method ?? 'GET', endpoint, {
      auth: !!accessToken,
      formData: options.body instanceof FormData,
    });
  }

  const { timeoutMs, ...fetchOptions } = options;
  const controller = timeoutMs ? new AbortController() : null;
  const timeoutId = timeoutMs
    ? window.setTimeout(() => controller?.abort(), timeoutMs)
    : null;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
      signal: controller?.signal ?? fetchOptions.signal,
    });
  } catch (networkError) {
    // Erreur réseau (pas de connexion, CORS, etc.)
    if (import.meta.env.DEV) {
      console.error('[api] Erreur réseau :', networkError);
    }
    if (
      typeof networkError === 'object' &&
      networkError !== null &&
      'name' in networkError &&
      (networkError as { name?: string }).name === 'AbortError'
    ) {
      throw {
        message: 'La requête a expiré. La génération peut encore être en cours.',
        status: 408,
        error: 'TIMEOUT',
      } as ApiError;
    }
    throw { message: 'Impossible de joindre le serveur. Vérifiez votre connexion.', status: 0 } as ApiError;
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }

  if (import.meta.env.DEV) {
    console.debug('[api] ←', response.status, endpoint);
  }

  // ── 401 Unauthorized ──────────────────────────────────────
  if (response.status === 401) {
    onUnauthorized?.();
    throw { message: 'Session expirée. Veuillez vous reconnecter.', status: 401 } as ApiError;
  }

  // ── 413 Request Entity Too Large ──────────────────────────
  if (response.status === 413) {
    throw {
      message: `Fichier trop volumineux. La limite est de ${UPLOAD_LIMITS.MAX_SIZE_MB} Mo.`,
      status: 413,
    } as ApiError;
  }

  // ── Autres erreurs HTTP ───────────────────────────────────
  if (!response.ok) {
    let errorMessage = 'Une erreur inattendue est survenue.';

    try {
      const body = await response.json();

      if (body?.message) {
        errorMessage = Array.isArray(body.message)
          ? body.message[0]           // class-validator renvoie un tableau
          : String(body.message);
      } else if (body?.error) {
        errorMessage = String(body.error);
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    if (import.meta.env.DEV) {
      console.error('[api] Erreur', response.status, ':', errorMessage);
    }

    throw {
      message: errorMessage,
      status: response.status,
      error: response.statusText,
    } as ApiError;
  }

  // ── 204 No Content ────────────────────────────────────────
  if (response.status === 204) return {} as T;

  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────
// ✅ API publique
// ─────────────────────────────────────────────────────────────
export const api = {
  get: <T>(endpoint: string, options: RequestOptions = {}): Promise<T> =>
    request<T>(endpoint, options),

  post: <T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> =>
    request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    }),

  put: <T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    }),

  patch: <T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    }),

  delete: <T>(endpoint: string, options: RequestOptions = {}): Promise<T> =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};