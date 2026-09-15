// src/components/payment/PaymentModal.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ExternalLink,
  Zap,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '@/services/payment.service';
import type { PassPackage } from '@/types/payment.types';
import QRCode from 'react-qr-code';

// ✅ Logo Wave depuis le dossier public
const waveLogo = '/images/images.png';

type Step = 'payment_method' | 'processing' | 'success' | 'error';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  selectedPack: PassPackage | null;
}

export function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  selectedPack
}: PaymentModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('payment_method');
  const [processing, setProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Réinitialiser quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('payment_method');
        setProcessing(false);
        setTransactionId('');
        setPaymentUrl('');
        setErrorMessage('');
      }, 300);
    }
  }, [isOpen]);

  if (!selectedPack) return null;

  const createPayment = async () => {
    setProcessing(true);
    setStep('processing');

    try {
      const response = await paymentService.createPayment({
        provider: 'wave',
        packageId: selectedPack.id,
        phoneNumber: ''
      });

      setTransactionId(response.transactionId);
      setPaymentUrl(response.paymentUrl);

    } catch (error: any) {
      console.error('❌ Erreur paiement:', error);

      setErrorMessage(error.message || "Impossible d'initier le paiement");
      setStep('error');

      toast({
        title: "Erreur",
        description: error.message || "Impossible d'initier le paiement",
        variant: "destructive"
      });
      setProcessing(false);
    }
  };

  const handleVerifyManually = async () => {
    try {
      const status = await paymentService.checkPaymentStatus(transactionId);

      if (status.status === 'completed') {
        setStep('success');
        toast({
          title: '✅ Paiement confirmé !',
          description: `${selectedPack?.passAmount} Pass ajoutés.`,
        });
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: '⏳ En attente',
          description: `Statut: ${status.status}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de vérifier le statut',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Désactiver la croix par défaut de shadcn/ui */}
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4 border-b">
          <DialogTitle className="text-2xl font-display flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary" />
            Paiement Wave
          </DialogTitle>
          
        </DialogHeader>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* Étape 1: Confirmation et résumé */}
            {step === 'payment_method' && (
              <motion.div
                key="payment_method"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Résumé du forfait */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base text-muted-foreground">Forfait</span>
                    <span className="font-semibold text-lg">{selectedPack.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base text-muted-foreground">Pass</span>
                    <span className="font-medium text-lg">{selectedPack.passAmount} pass</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-purple-200/30">
                    <span className="font-medium text-lg">Total à payer</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {selectedPack.priceCfa.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                {/* Information Wave */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-xl">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm p-1.5">
                      <img
                        src={waveLogo}
                        alt="Wave"
                        className="w-7 h-7 object-contain"
                      />
                    </div>
                    <p className="font-medium text-lg">Paiement par Wave</p>
                  </div>
                  <p className="text-base text-muted-foreground">
                    Vous allez être redirigé vers Wave pour finaliser le paiement.
                    Vous pourrez payer par QR code ou directement dans l'application.
                  </p>
                </div>

                {/* Boutons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className={cn(
                      "flex-1 border-2 transition-all py-6 text-base",
                      "border-purple-200 dark:border-purple-800",
                      "text-purple-700 dark:text-purple-300",
                      "bg-white dark:bg-transparent",
                      "hover:bg-purple-100 dark:hover:bg-purple-900/50",
                      "hover:text-purple-800 dark:hover:text-purple-200",
                      "hover:border-purple-300 dark:hover:border-purple-700"
                    )}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={createPayment}
                    disabled={processing}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/25 py-6 text-base"
                  >
                    {processing ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      'Continuer vers Wave'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Étape 2: QR Code et attente - VERSION RÉORGANISÉE */}
            {step === 'processing' && paymentUrl && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* En-tête avec titre seulement - plus compact */}
                <div className="text-center">
                  <p className="font-semibold text-xl">En attente du paiement</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scannez ce QR code avec l'application Wave
                  </p>
                </div>

                {/* Zone principale organisée en 2 colonnes sur desktop */}
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* Colonne gauche : QR Code et logo Wave */}
                  <div className="flex-1 flex flex-col items-center space-y-3">
                    {/* Logo Wave plus compact */}
                    <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center p-2">
                      <img
                        src={waveLogo}
                        alt="Wave"
                        className="w-12 h-12 object-contain" 
                      />
                    </div>

                    {/* QR Code avec taille adaptée */}
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-50"></div>
                      <div className="relative bg-white p-4 rounded-xl shadow-lg">
                        <QRCode
                          value={paymentUrl}
                          size={200}
                          level="H"
                        />
                      </div>
                    </div>

                    {/* Transaction ID compact */}
                    <p className="text-xs text-muted-foreground">
                      ID: {transactionId.substring(0, 8)}...
                    </p>
                  </div>

                  {/* Colonne droite : Instructions et boutons */}
                  <div className="flex-1 space-y-4">
                    {/* Instructions simplifiées */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        1. Ouvrez l'application Wave<br />
                        2. Scannez le QR code ou cliquez sur le lien<br />
                        3. Confirmez le paiement de <span className="font-semibold text-purple-600 dark:text-purple-400">{selectedPack.priceCfa.toLocaleString()} FCFA</span>
                      </p>
                    </div>

                    {/* Boutons verticaux */}
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full gap-2 border-2 border-purple-300 hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/30 dark:hover:to-pink-950/30 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200 py-5 text-base"
                        onClick={() => window.open(paymentUrl, '_blank')}
                      >
                        <Smartphone className="h-5 w-5" />
                        Payer avec l'app Wave
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full gap-2 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200 font-medium py-5 text-base"
                        onClick={handleVerifyManually}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        J'ai déjà payé, vérifier
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Étape 3: Succès */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-xl opacity-20"></div>
                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Paiement réussi !
                  </p>
                  <p className="mt-2 text-base text-muted-foreground">
                    {selectedPack.passAmount} Pass ont été ajoutés à votre compte.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <img src={waveLogo} alt="Wave" className="w-5 h-5 object-contain" />
                  <span>Paiement Wave confirmé</span>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg py-6 text-base"
                  onClick={() => {
                    onClose();
                    if (onSuccess) onSuccess();
                  }}
                >
                  Terminé
                </Button>
              </motion.div>
            )}

            {/* Étape 4: Erreur */}
            {step === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full blur-xl opacity-20"></div>
                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                    <AlertCircle className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-red-500">
                    Paiement échoué
                  </p>
                  <p className="mt-2 text-base text-muted-foreground">
                    {errorMessage || "Une erreur est survenue"}
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 border-2 transition-all py-6 text-base",
                      "border-purple-200 dark:border-purple-800",
                      "text-purple-700 dark:text-purple-300",
                      "bg-white dark:bg-transparent",
                      "hover:bg-purple-100 dark:hover:bg-purple-900/50",
                      "hover:text-purple-800 dark:hover:text-purple-200",
                      "hover:border-purple-300 dark:hover:border-purple-700"
                    )}
                    onClick={onClose}
                  >
                    Fermer
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 py-6 text-base"
                    onClick={() => setStep('payment_method')}
                  >
                    Réessayer
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}