import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token JWT
    this.client.interceptors.request.use(
      (config) => {
        // ✅ Récupérer le token depuis plusieurs sources
        let token = localStorage.getItem('authToken');
        
        // Si pas trouvé, essayer edupass_session
        if (!token) {
          const sessionStr = localStorage.getItem('edupass_session');
          if (sessionStr) {
            try {
              const session = JSON.parse(sessionStr);
              token = session.token;
              // Optionnel: sauvegarder aussi sous authToken pour la prochaine fois
              localStorage.setItem('authToken', token);
              console.log('✅ Token extrait de edupass_session');
            } catch (e) {
              console.error('❌ Erreur parsing session:', e);
            }
          }
        }
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Token ajouté aux headers:', token.substring(0, 20) + '...');
        } else {
          console.warn('⚠️ Aucun token trouvé pour la requête');
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer les erreurs
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        console.error('❌ Erreur API:', {
          status: error.response?.status,
          url: error.config?.url,
          token: error.config?.headers?.Authorization ? 'présent' : 'absent'
        });
        
        // ✅ Pour le debug, on ne redirige pas immédiatement
        if (error.response?.status === 401) {
          console.error('🔴 Token invalide ou expiré');
          // localStorage.removeItem('authToken');
          // window.location.href = '/login';
        }
        
        // Formater l'erreur
        const errorData = error.response?.data as any;
        const formattedError = {
          message: errorData?.message || error.message || 'Une erreur est survenue',
          status: error.response?.status || 500,
          error: errorData?.error || error.code,
        };
        
        return Promise.reject(formattedError);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }
}

export const api = new ApiClient();