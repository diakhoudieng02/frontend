// pages/AuthCallback.tsx

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { googleLogin, googleRegister } = useAuth();
  const processedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (processedRef.current) return;

    const handleCallback = async () => {
      processedRef.current = true;

      try {
        // Récupérer la session Supabase
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.user) {
          console.error('❌ Erreur session Supabase:', error);
          throw new Error('Impossible de récupérer les informations Google');
        }

        const user = session.user;
        const metadata = user.user_metadata;

        console.log('✅ Session Supabase récupérée:', {
          email: user.email,
          id: user.id,
          metadata
        });

        // Construire les données utilisateur
        const fullName = metadata.full_name || metadata.name || '';
        const nameParts = fullName.split(' ');
        
        const googleData = {
          email: user.email || '',
          firstName: nameParts[0] || metadata.given_name || metadata.first_name || 'User',
          lastName: nameParts.slice(1).join(' ') || metadata.family_name || metadata.last_name || '',
          googleId: user.id,
          photoUrl: metadata.avatar_url || metadata.picture || metadata.photoUrl,
        };

        console.log('📦 Données Google préparées:', googleData);

        // Déterminer le flux
        const params = new URLSearchParams(location.search);
        const mode = params.get('mode');
        const isRegisterFlow = mode === 'register';

        // ✅ TENTER L'OPÉRATION SUR NOTRE BACKEND
        try {
          if (isRegisterFlow) {
            console.log('📝 Tentative inscription...');
            await googleRegister(googleData);
            toast({
              title: '🎉 Inscription réussie !',
              description: `Bienvenue ${googleData.firstName} !`,
            });
          } else {
            console.log('🔑 Tentative connexion...');
            await googleLogin(googleData);
            toast({
              title: '🎉 Connexion réussie !',
              description: `Bon retour ${googleData.firstName} !`,
            });
          }

          // ✅ SUCCÈS - Nettoyer et rediriger
          await supabase.auth.signOut().catch(() => {});
          navigate('/dashboard', { replace: true });
          
        } catch (backendError: any) {
          console.error('❌ Erreur backend:', backendError);
          
          // Vérifier si l'utilisateur existe déjà dans notre base
          const errorMsg = backendError.message || '';
          const errorStatus = backendError.status;

          // CAS 1: L'utilisateur existe déjà (conflit)
          if (errorStatus === 409 || errorMsg.includes('existe déjà')) {
            if (isRegisterFlow) {
              // Essayer la connexion à la place
              console.log('🔄 Compte existe déjà, tentative de connexion...');
              try {
                await googleLogin(googleData);
                toast({
                  title: '✅ Connexion réussie',
                  description: `Bienvenue ${googleData.firstName} !`,
                });
                await supabase.auth.signOut().catch(() => {});
                navigate('/dashboard', { replace: true });
                return;
              } catch (loginError) {
                console.error('❌ Connexion échouée:', loginError);
              }
            } else {
              toast({
                title: '❌ Erreur de connexion',
                description: 'Problème lors de la connexion. Veuillez réessayer.',
                variant: 'destructive',
              });
            }
          }
          
          // CAS 2: Compte non trouvé (connexion)
          else if (errorStatus === 404 || errorMsg.includes('introuvable')) {
            if (!isRegisterFlow) {
              toast({
                title: '💡 Pas encore de compte',
                description: 'Aucun compte trouvé. Redirection vers l\'inscription...',
                className: 'bg-orange-50 border-orange-300 text-orange-900',
                duration: 5000,
              });
              setTimeout(() => navigate('/register?mode=google'), 2500);
              return;
            }
          }
          
          // CAS 3: Erreur réseau ou serveur
          else {
            // Si on est en mode inscription et que ça échoue, 
            // l'utilisateur est peut-être quand même créé en base
            if (isRegisterFlow) {
              console.log('⚠️ Erreur mais vérification si utilisateur créé...');
              
              // Attendre un peu et essayer de se connecter
              setTimeout(async () => {
                try {
                  await googleLogin(googleData);
                  toast({
                    title: '✅ Compte créé avec succès !',
                    description: `Bienvenue ${googleData.firstName} !`,
                  });
                  await supabase.auth.signOut().catch(() => {});
                  navigate('/dashboard', { replace: true });
                  return;
                } catch (loginError) {
                  console.error('❌ Connexion de vérification échouée:', loginError);
                  setError('Problème de connexion. Veuillez réessayer.');
                }
              }, 2000);
            }
          }
          
          setError(backendError.message || 'Erreur lors de l\'authentification');
        }
        
      } catch (err: any) {
        console.error('❌ Erreur critique:', err);
        setError(err.message || 'Erreur lors de l\'authentification');
      }
    };

    handleCallback();
  }, [navigate, location.search, toast, googleLogin, googleRegister]);

  // Réessayer
  const handleRetry = () => {
    setError(null);
    processedRef.current = false;
    setRetryCount(prev => prev + 1);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erreur d'authentification</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full">
              Réessayer
            </Button>
            <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
              Retour à la connexion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">
          {retryCount > 0 ? 'Nouvelle tentative...' : 'Connexion en cours...'}
        </p>
      </div>
    </div>
  );
}