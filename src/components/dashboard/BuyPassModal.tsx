// src/components/dashboard/BuyPassModal.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { passService } from '@/services/pass.service';
import { Zap, CheckCircle2, Smartphone, ArrowRight, History, ChevronRight, Loader2 } from 'lucide-react';
import type { PassTransaction } from '@/types';

type Step = 'select_pack' | 'select_payment' | 'confirm' | 'success';

interface BuyPassModalProps {
  trigger: React.ReactNode;
  onPurchase?: (tx: PassTransaction) => void;
  transactions?: PassTransaction[];
}

export function BuyPassModal({ trigger, onPurchase, transactions = [] }: BuyPassModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('select_pack');
  const [selectedPack, setSelectedPack] = useState<typeof PASS_PACKS[0] | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<typeof PAYMENT_METHODS[0] | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  // Récupérer les données depuis le service
  const PASS_PACKS = passService.getPackages();
  const PAYMENT_METHODS = passService.getPaymentMethods();

  const reset = () => {
    setStep('select_pack');
    setSelectedPack(null);
    setSelectedPayment(null);
    setProcessing(false);
    setShowHistory(false);
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) reset();
  };

  const handleConfirm = async () => {
    if (!selectedPack || !selectedPayment) return;
    
    setProcessing(true);
    
    try {
      const result = await passService.purchasePasses(selectedPack.id, selectedPayment.id);
      
      if (result.success && result.transaction) {
        setStep('success');
        onPurchase?.(result.transaction);
        
        toast({
          title: '✅ Paiement réussi !',
          description: `${selectedPack.amount} pass ajoutés à votre compte.`,
        });
      } else {
        throw new Error('Échec de l\'achat');
      }
    } catch (error) {
      toast({
        title: '❌ Erreur',
        description: 'Le paiement a échoué. Veuillez réessayer.',
        variant: 'destructive',
      });
      setStep('select_pack');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="corporate-header px-6 pt-6 pb-5">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white font-display text-lg">
              {step === 'select_pack' && '🎟️ Acheter des Pass'}
              {step === 'select_payment' && '💳 Mode de paiement'}
              {step === 'confirm' && '📋 Confirmation'}
              {step === 'success' && '🎉 Succès !'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">
          {/* HISTORIQUE - Toujours visible en haut du formulaire */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-border/50">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
              <span className="text-xs font-medium text-gray-700 dark:text-foreground">
                Mes achats
              </span>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Voir l'historique
              <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${
                showHistory ? 'rotate-90' : ''
              }`} />
            </button>
          </div>

          {/* SECTION HISTORIQUE (dépliable) */}
          {showHistory && (
            <div className="bg-gray-50 dark:bg-muted/30 rounded-xl p-3 max-h-48 overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="text-xs text-center text-gray-500 dark:text-muted-foreground py-2">
                  Aucune transaction pour le moment
                </p>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 3).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3 w-3 text-sage-emerald-600" />
                        <span className="font-medium text-gray-900 dark:text-foreground">
                          +{tx.amount} Pass
                        </span>
                      </div>
                      <span className="text-gray-500 dark:text-muted-foreground">
                        {tx.price.toLocaleString()} FCFA
                      </span>
                    </div>
                  ))}
                  {transactions.length > 3 && (
                    <p className="text-[10px] text-center text-gray-500 dark:text-muted-foreground pt-1">
                      +{transactions.length - 3} autres achats
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Select Pack */}
          {step === 'select_pack' && (
            <>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                Choisis le nombre de pass à acheter
              </p>
              <div className="space-y-3">
                {PASS_PACKS.map(pack => (
                  <button
                    key={pack.id}
                    onClick={() => setSelectedPack(pack)}
                    className={`relative w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                      selectedPack?.id === pack.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-gray-200 dark:border-border hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-muted/50'
                    }`}
                  >
                    {pack.popular && (
                      <span className="absolute -top-2.5 right-3 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold text-white">
                        POPULAIRE
                      </span>
                    )}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sage-emerald-50">
                      <Zap className="h-5 w-5 text-sage-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-bold text-gray-900 dark:text-foreground">
                        {pack.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground">
                        {Math.round(pack.price / pack.amount)} FCFA / pass
                      </p>
                    </div>
                    <p className="font-display text-lg font-bold text-primary">
                      {pack.price.toLocaleString()}{' '}
                      <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground">
                        FCFA
                      </span>
                    </p>
                  </button>
                ))}
              </div>
              <Button
                className="w-full btn-primary-gradient h-12 rounded-xl font-semibold text-white"
                disabled={!selectedPack}
                onClick={() => setStep('select_payment')}
              >
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {/* Step 2: Select Payment Method */}
          {step === 'select_payment' && (
            <>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                Comment souhaites-tu payer ?
              </p>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method)}
                    className={`w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                      selectedPayment?.id === method.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-gray-200 dark:border-border hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-muted/50'
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${method.color} text-white text-xl`}
                    >
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-bold text-gray-900 dark:text-foreground">
                        {method.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                    <Smartphone className="h-5 w-5 text-gray-400 dark:text-muted-foreground" />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl text-gray-700 dark:text-foreground border-gray-300 dark:border-border"
                  onClick={() => setStep('select_pack')}
                >
                  Retour
                </Button>
                <Button
                  className="flex-1 btn-primary-gradient rounded-xl font-semibold text-white"
                  disabled={!selectedPayment}
                  onClick={() => setStep('confirm')}
                >
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && selectedPack && selectedPayment && (
            <>
              <div className="rounded-2xl bg-gray-50 dark:bg-muted/50 p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-muted-foreground">Pack</span>
                  <span className="font-semibold text-gray-900 dark:text-foreground">
                    {selectedPack.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-muted-foreground">Paiement</span>
                  <span className="font-semibold text-gray-900 dark:text-foreground flex items-center gap-1.5">
                    <span>{selectedPayment.icon}</span> {selectedPayment.name}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-border pt-3 flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-foreground">Total</span>
                  <span className="font-display text-xl font-bold text-primary">
                    {selectedPack.price.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
              <p className="text-xs text-center text-gray-500 dark:text-muted-foreground">
                En confirmant, tu seras redirigé vers {selectedPayment.name} pour finaliser le
                paiement.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl text-gray-700 dark:text-foreground border-gray-300 dark:border-border"
                  onClick={() => setStep('select_payment')}
                >
                  Retour
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl font-semibold h-12 text-white"
                  onClick={handleConfirm}
                  disabled={processing}
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Traitement...
                    </span>
                  ) : (
                    <>Confirmer le paiement</>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Step 4: Success */}
          {step === 'success' && selectedPack && (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-gray-900 dark:text-foreground">
                  Paiement réussi !
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-muted-foreground">
                  <strong>{selectedPack.amount} pass</strong> ont été ajoutés à ton compte.
                </p>
              </div>
              <Button
                className="w-full btn-primary-gradient rounded-xl h-12 font-semibold text-white"
                onClick={() => handleOpenChange(false)}
              >
                Retour au dashboard
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}