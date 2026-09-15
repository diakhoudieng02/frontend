// src/services/maintenance.service.ts
import axios from 'axios';

class MaintenanceService {
  private isMaintenanceMode = false;
  private isDebugMode = false;

  constructor() {
    this.checkDebugMode();
    this.setupInterceptor();
  }

  // Vérifier les conditions de debug automatique
  private checkDebugMode() {
    const urlParams = new URLSearchParams(window.location.search);
    this.isDebugMode = 
      urlParams.get('debug') === 'true' ||
      localStorage.getItem('debug_mode') === 'true' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    
    if (this.isDebugMode) {
      console.log('🐛 Mode debug activé');
    }
  }

  // Intercepter les réponses pour détecter la maintenance
  private setupInterceptor() {
    axios.interceptors.response.use(
      (response) => {
        // Vérifier si le header de debug est présent
        if (response.headers['x-debug-mode'] === 'true') {
          this.isDebugMode = true;
        }
        return response;
      },
      (error) => {
        if (error.response?.status === 503) {
          this.isMaintenanceMode = true;
          
          // Si en mode debug, on log mais on bloque pas
          if (this.isDebugMode) {
            console.warn('🚧 Mode maintenance détecté mais contourné (debug)', error.response.data);
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Vérifier si on doit afficher la page de maintenance
  public shouldShowMaintenance(): boolean {
    return this.isMaintenanceMode && !this.isDebugMode;
  }

  // Obtenir le statut
  public getStatus() {
    return {
      maintenance: this.isMaintenanceMode,
      debug: this.isDebugMode
    };
  }

  // Activer/désactiver le debug manuellement
  public toggleDebug(enable: boolean) {
    this.isDebugMode = enable;
    if (enable) {
      localStorage.setItem('debug_mode', 'true');
    } else {
      localStorage.removeItem('debug_mode');
    }
    window.location.reload();
  }
}

export default new MaintenanceService();