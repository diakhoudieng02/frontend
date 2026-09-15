// pages/PaymentSuccess.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePassBalance } from '@/hooks/usePassBalance';
import { paymentService } from '@/services/payment.service';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Wallet, Clock } from 'lucide-react';

export default function PaymentSuccess() {
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

    verifyPayment();
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      console.log('🔍 Vérification du paiement:', sessionId);
      
      // Attendre un peu pour que le webhook ait le temps de traiter
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await paymentService.checkPaymentStatus(sessionId);
      console.log('📊 Résultat:', result);

      if (result.status === 'completed') {
        setStatus('success');
        setTransactionDetails(result);
        await refresh(); // Rafraîchir le solde
        
        toast({
          title: "✅ Paiement réussi !",
          description: `${result.passQuantity} pass ont été ajoutés.`,
        });
      } else if (result.status === 'pending') {
        // Réessayer après 3 secondes
        setTimeout(verifyPayment, 3000);
      } else {
        setStatus('failed');
        setError(`Paiement ${result.status}`);
      }
    } catch (error: any) {
      console.error('❌ Erreur vérification:', error);
      setStatus('failed');
      setError(error.message || 'Impossible de vérifier le paiement');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="relative container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-card border rounded-2xl p-8 shadow-lg">
            {status === 'loading' && (
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto relative">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <Clock className="absolute inset-0 m-auto h-8 w-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-display font-bold mb-2">
                  Vérification en cours
                </h2>
                <p className="text-muted-foreground mb-4">
                  Nous vérifions votre paiement auprès de Wave...
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Cela peut prendre quelques secondes</span>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-display font-bold mb-2">
                  Paiement réussi ! 🎉
                </h2>
                <p className="text-muted-foreground mb-6">
                  Votre compte a été crédité avec succès
                </p>

                {transactionDetails && (
                  <div className="bg-card border rounded-2xl p-6 mb-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pass ajoutés</span>
                        <span className="font-bold text-primary text-xl">
                          +{transactionDetails.passQuantity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Montant</span>
                        <span className="font-medium">
                          {transactionDetails.amount.toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                          <Wallet className="h-4 w-4" />
                          <span>ID: {transactionDetails.id.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => navigate('/pricing')}
                    variant="outline"
                    className="rounded-xl"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="rounded-xl bg-gradient-to-r from-primary to-primary/80"
                  >
                    Dashboard
                  </Button>
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="h-12 w-12 text-red-600" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-display font-bold mb-2">
                  Paiement échoué
                </h2>
                <p className="text-muted-foreground mb-4">
                  {error || "Une erreur est survenue"}
                </p>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => navigate('/pricing')}
                    className="rounded-xl bg-gradient-to-r from-primary to-primary/80"
                  >
                    Réessayer
                  </Button>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Dashboard
                  </Button>
                </div>
              </div>
            )}
          </div>

          {status !== 'loading' && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Un email de confirmation vous a été envoyé.
            </p>
          )}
        </motion.div>
      </main>
    </div>
  );
}