// pages/PaymentCallback.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePassBalance } from '@/hooks/usePassBalance';
import { paymentService } from '@/services/payment.service';
import { CheckCircle2, XCircle, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refresh } = usePassBalance();

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('txn');

  useEffect(() => {
    if (!sessionId) {
      setStatus('failed');
      setError('Session de paiement non trouvée');
      return;
    }

    // ✅ IMMÉDIATEMENT : Appeler le backend pour valider
    validatePayment();
  }, [sessionId]);

  const validatePayment = async () => {
    try {
      console.log('🔍 Validation paiement backend:', sessionId);
      
      // Appel immédiat au backend pour vérifier le statut
      const result = await paymentService.checkPaymentStatus(sessionId);
      console.log('📊 Réponse backend:', result);

      if (result.status === 'completed') {
        setStatus('success');
        setTransactionDetails(result);
        await refresh(); // Rafraîchir le solde
        
        toast({
          title: "✅ Paiement confirmé !",
          description: `${result.passQuantity} pass ont été ajoutés.`,
        });

        // ✅ Redirection automatique vers dashboard après 3 secondes
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);

      } else if (result.status === 'pending') {
        // Si encore en attente, on vérifie toutes les 2 secondes
        setStatus('loading');
        setTimeout(validatePayment, 2000);
      } else {
        setStatus('failed');
        setError(`Paiement ${result.status}`);
      }
    } catch (error: any) {
      console.error('❌ Erreur validation backend:', error);
      
      // ✅ Si erreur 404 ou 401, rediriger vers pricing
      if (error.status === 404 || error.status === 401) {
        setStatus('failed');
        setError('Session de paiement invalide');
        setTimeout(() => navigate('/pricing'), 4000);
      } else {
        setStatus('failed');
        setError(error.message || 'Impossible de valider le paiement');
      }
    }
  };

  const handleManualRetry = () => {
    setStatus('loading');
    validatePayment();
  };

  return (
    <div className="min-h-screen bg-background">
      

      <main className="relative container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-card border rounded-2xl p-8 shadow-lg">
            {/* LOADING / VALIDATION */}
            {status === 'loading' && (
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto relative">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-display font-bold mb-2">
                  Validation en cours
                </h2>
                <p className="text-muted-foreground mb-4">
                  Nous vérifions votre paiement auprès de Wave...
                </p>
                
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Session: {sessionId?.substring(0, 8)}...
                </p>
              </div>
            )}

            {/* SUCCÈS */}
            {status === 'success' && (
              <div className="text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mb-6"
                >
                  <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                </motion.div>
                
                <h2 className="text-2xl font-display font-bold mb-2">
                  Paiement réussi ! 🎉
                </h2>
                <p className="text-muted-foreground mb-6">
                  Votre compte a été crédité avec succès
                </p>

                {transactionDetails && (
                  <div className="bg-primary/5 rounded-xl p-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pass ajoutés</span>
                        <span className="font-bold text-primary">
                          +{transactionDetails.passQuantity}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Montant</span>
                        <span className="font-medium">
                          {transactionDetails.amount.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-sm text-muted-foreground mb-4">
                  Redirection vers le dashboard dans quelques secondes...
                </p>

                <Button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-gradient-to-r from-primary to-primary/80"
                >
                  Aller au dashboard maintenant
                </Button>
              </div>
            )}

            {/* ÉCHEC */}
            {status === 'failed' && (
              <div className="text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mb-6"
                >
                  <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="h-12 w-12 text-red-600" />
                  </div>
                </motion.div>
                
                <h2 className="text-2xl font-display font-bold mb-2 text-red-500">
                  Paiement non confirmé
                </h2>
                <p className="text-muted-foreground mb-2">
                  {error || "Impossible de valider votre paiement"}
                </p>
                
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 text-left">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800 dark:text-amber-300">
                      <p className="font-medium mb-1">Que faire ?</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Vérifiez votre application Wave</li>
                        <li>Si le paiement a été prélevé, contactez le support</li>
                        <li>Sinon, réessayez le paiement</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/pricing')}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Réessayer
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleManualRetry}
                    className="flex-1"
                  >
                    <Loader2 className="h-4 w-4 mr-2" />
                    Revalider
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Message d'aide */}
          {status !== 'loading' && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Besoin d'aide ? Contactez-nous à support@etooblo.ai
            </p>
          )}
        </motion.div>
      </main>
    </div>
  );
}