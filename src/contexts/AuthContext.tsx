import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { authService } from '@/services/auth.service';
import { setAccessToken, setOnUnauthorized } from '@/services/api';
import type { AuthUser, AuthResponse, GoogleAuthPayload } from '@/types/api';

interface AuthSession {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  registerRequest: (phoneNumber: string) => Promise<void>;
  registerVerify: (
    phoneNumber: string,
    otp: string,
    firstName: string,
    lastName: string,
    schoolLevel?: string
  ) => Promise<void>;
  loginRequest: (phoneNumber: string) => Promise<void>;
  loginVerify: (phoneNumber: string, otp: string) => Promise<void>;
  googleRegister: (payload: GoogleAuthPayload) => Promise<void>;
  googleLogin: (payload: GoogleAuthPayload) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<AuthUser>) => Promise<void>; 
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'edupass_session';

function saveSession(session: AuthSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    // ✅ Synchroniser aussi authToken pour compatibilité
    localStorage.setItem('authToken', session.token);
  } catch (error) {
    console.error('Erreur sauvegarde session', error);
  }
}

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

// ✅ Fonction améliorée pour vider TOUS les tokens
function clearAllAuthData() {
  console.log('🧹 Nettoyage complet des données auth...');
  
  // Supprimer la session principale
  localStorage.removeItem(SESSION_KEY);
  
  // Supprimer tous les tokens possibles
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Nettoyer sessionStorage aussi
  sessionStorage.clear();
  
  console.log('✅ Nettoyage terminé');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentSessionRef = useRef<string | null>(null);

  // ✅ Version améliorée de handleLogout
  const handleLogout = useCallback(() => {
    console.log('🔴 Déconnexion...');
    
    // Vider les states
    setUser(null);
    setToken(null);
    
    // Vider le token dans l'API
    setAccessToken(null);
    
    // Vider TOUT le localStorage
    clearAllAuthData();
    
    currentSessionRef.current = null;
    
    console.log('✅ Déconnecté');
  }, []);

  // ✅ AJOUTER LA FONCTION updateProfile ICI
  const updateProfile = useCallback(async (userData: Partial<AuthUser>) => {
    try {
      // Appel API pour mettre à jour le profil
      const updatedUser = await authService.updateProfile(userData);
      
      // Mettre à jour l'état local
      setUser(updatedUser);
      
      // Mettre à jour la session sauvegardée
      const currentSession = loadSession();
      if (currentSession) {
        saveSession({
          ...currentSession,
          user: updatedUser,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }, []);

  const applySession = useCallback((session: AuthResponse) => {
    if (!session.user || !session.token) return;

    const sessionString = JSON.stringify(session);
    if (currentSessionRef.current === sessionString) return;

    setUser(session.user);
    setToken(session.token);
    setAccessToken(session.token);

    // ✅ Sauvegarder la session ET authToken
    saveSession({
      token: session.token,
      refreshToken: session.refreshToken,
      expiresIn: session.expiresIn,
      user: session.user,
    });

    currentSessionRef.current = sessionString;
    
    console.log('✅ Session appliquée avec succès');
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const session = loadSession();
        if (session?.token) {
          // ✅ Vérifier si le token n'est pas expiré
          try {
            const payload = JSON.parse(atob(session.token.split('.')[1]));
            const isExpired = Date.now() > payload.exp * 1000;
            
            if (isExpired) {
              console.log('⚠️ Token expiré, nettoyage...');
              clearAllAuthData();
            } else {
              setUser(session.user);
              setToken(session.token);
              setAccessToken(session.token);
              // ✅ Synchroniser authToken
              localStorage.setItem('authToken', session.token);
            }
          } catch (e) {
            console.error('Erreur décodage token:', e);
            clearAllAuthData();
          }
        }
      } catch (error) {
        console.error('Erreur initialisation auth', error);
        clearAllAuthData();
      } finally {
        setTimeout(() => setIsLoading(false), 50);
      }
    };
    init();
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      console.log('🔴 401 reçu - Déconnexion automatique');
      handleLogout();
      // Optionnel: rediriger vers login
      window.location.href = '/login';
    });

    return () => setOnUnauthorized(() => {});
  }, [handleLogout]);

  const registerRequest = useCallback(async (phoneNumber: string) => {
    await authService.registerRequest({ phoneNumber });
  }, []);

  const registerVerify = useCallback(
    async (
      phoneNumber: string,
      otp: string,
      firstName: string,
      lastName: string,
      schoolLevel?: string
    ) => {
      const response = await authService.registerVerify({
        phoneNumber,
        otp,
        firstName,
        lastName,
        schoolLevel: schoolLevel as 'Seconde' | 'Premiere' | 'Terminale' | undefined,
      });
      applySession(response);
    },
    [applySession]
  );

  const loginRequest = useCallback(async (phoneNumber: string) => {
    await authService.loginRequest({ phoneNumber });
  }, []);

  const loginVerify = useCallback(
    async (phoneNumber: string, otp: string) => {
      const response = await authService.loginVerify({ phoneNumber, otp });
      applySession(response);
    },
    [applySession]
  );

 const googleRegister = useCallback(async (payload: GoogleAuthPayload) => {
  console.log('🚀 Début googleRegister avec payload:', payload);
  
  try {
    console.log('📤 Appel du service googleRegister...');
    const response = await authService.googleRegister(payload);
    
    console.log('📥 Réponse reçue du service:', response);
    
    // ✅ Vérifier que la réponse contient bien les données attendues
    if (!response || !response.token || !response.user) {
      console.error('❌ Réponse invalide:', response);
      throw new Error('Réponse invalide du serveur');
    }
    
    console.log('✅ Application de la session...');
    applySession(response);
    
    console.log('✅ Inscription Google réussie pour:', response.user.email);
    
  } catch (error: any) {
    console.error('❌ Erreur détaillée googleRegister:', {
      message: error.message,
      status: error.status,
      response: error.response?.data,
      stack: error.stack
    });
    
    // ✅ Même en cas d'erreur, vérifier si l'utilisateur a été créé
    try {
      // Essayer de se connecter directement avec les mêmes identifiants
      console.log('🔄 Tentative de connexion après erreur...');
      const loginResponse = await authService.googleLogin(payload);
      if (loginResponse?.token) {
        console.log('✅ Connexion réussie après erreur!');
        applySession(loginResponse);
        return;
      }
    } catch (loginError) {
      console.error('❌ Connexion également échouée:', loginError);
    }
    
    throw error;
  }
}, [applySession]);

  const googleLogin = useCallback(async (payload: GoogleAuthPayload) => {
    const response = await authService.googleLogin(payload);
    applySession(response);
  }, [applySession]);

  // ✅ Version finale de logout
  const logout = useCallback(() => {
    // Appeler le service de déconnexion (optionnel)
    authService.logout().catch(console.error);
    
    // Nettoyer localement
    handleLogout();
    
    // Rediriger vers login
    window.location.href = '/login';
  }, [handleLogout]);

  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user]);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      accessToken: token,
      isAuthenticated: !!token,
      isLoading,
      isAdmin,
      registerRequest,
      registerVerify,
      loginRequest,
      loginVerify,
      googleRegister,
      googleLogin,
      logout,
      updateProfile,
    }),
    [
      user,
      setUser,
      token,
      isLoading,
      isAdmin,
      registerRequest,
      registerVerify,
      loginRequest,
      loginVerify,
      googleRegister,
      googleLogin,
      logout,
      updateProfile,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// ✅ Export nommé pour useAuth
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return context;
}