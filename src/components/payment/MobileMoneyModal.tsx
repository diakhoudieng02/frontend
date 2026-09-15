import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  Smartphone, 
  Check,
  Loader2,
  Sparkles,
  Zap
} from 'lucide-react';

interface MobileMoneyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (amount: number) => void;
}

const passPackages = [
  { passes: 5, price: 500, popular: false },
  { passes: 15, price: 1200, popular: true, savings: '20%' },
  { passes: 30, price: 2000, popular: false, savings: '33%' },
];

const paymentMethods = [
  { id: 'orange', name: 'Orange Money', color: 'bg-orange-500' },
  { id: 'wave', name: 'Wave', color: 'bg-blue-500' },
  { id: 'mtn', name: 'MTN Money', color: 'bg-yellow-500' },
];

type Step = 'packages' | 'payment' | 'processing' | 'success';

export function MobileMoneyModal({ open, onOpenChange, onSuccess }: MobileMoneyModalProps) {
  const [step, setStep] = useState<Step>('packages');
  const [selectedPackage, setSelectedPackage] = useState<typeof passPackages[0] | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePurchase = async () => {
    if (!selectedPackage || !selectedMethod || !phoneNumber) return;
    
    setStep('processing');
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setStep('success');
    
    // Auto close after success
    setTimeout(() => {
      onSuccess?.(selectedPackage.passes);
      resetAndClose();
    }, 2000);
  };

  const resetAndClose = () => {
    setStep('packages');
    setSelectedPackage(null);
    setSelectedMethod(null);
    setPhoneNumber('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'packages' && (
            <motion.div
              key="packages"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <DialogHeader>
                <DialogTitle className="font-display text-xl flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  Recharger mes Pass
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 mt-6">
                {passPackages.map((pkg) => (
                  <motion.button
                    key={pkg.passes}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`
                      w-full p-4 rounded-2xl border-2 text-left transition-all relative
                      ${selectedPackage?.passes === pkg.passes 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-card hover:border-primary/50'
                      }
                    `}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2 right-4 bg-accent text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                        Populaire
                      </span>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {pkg.passes} Pass
                          </p>
                          {pkg.savings && (
                            <p className="text-xs text-accent font-medium">
                              Économise {pkg.savings}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-foreground">
                          {pkg.price} F
                        </p>
                        <p className="text-xs text-muted-foreground">
                          CFA
                        </p>
                      </div>
                    </div>
                    
                    {selectedPackage?.passes === pkg.passes && (
                      <div className="absolute top-1/2 -translate-y-1/2 right-4">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              <Button
                onClick={() => setStep('payment')}
                disabled={!selectedPackage}
                className="w-full mt-6 btn-primary-gradient h-12 rounded-xl"
              >
                Continuer
              </Button>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <DialogHeader>
                <DialogTitle className="font-display text-xl flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Mode de paiement
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-6">
                <Label>Choisis ton opérateur</Label>
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <motion.button
                      key={method.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`
                        p-3 rounded-xl border-2 text-center transition-all
                        ${selectedMethod === method.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border bg-card hover:border-primary/50'
                        }
                      `}
                    >
                      <div className={`w-10 h-10 ${method.color} rounded-lg mx-auto mb-2`} />
                      <p className="text-xs font-medium text-foreground">
                        {method.name}
                      </p>
                    </motion.button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="07 XX XX XX XX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="h-12 pl-12 rounded-xl"
                    />
                  </div>
                </div>

                {selectedPackage && (
                  <div className="bg-muted rounded-xl p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total à payer</span>
                      <span className="font-bold text-xl text-foreground">
                        {selectedPackage.price} F CFA
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep('packages')}
                  className="flex-1 h-12 rounded-xl"
                >
                  Retour
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={!selectedMethod || phoneNumber.length < 8}
                  className="flex-1 btn-success-gradient h-12 rounded-xl"
                >
                  Payer
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-12 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 mx-auto mb-6"
              >
                <Loader2 className="w-20 h-20 text-primary" />
              </motion.div>
              <p className="font-semibold text-foreground text-lg">
                Paiement en cours...
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Confirme sur ton téléphone
              </p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-20 h-20 bg-accent/10 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-accent" />
              </motion.div>
              <p className="font-semibold text-foreground text-lg">
                Paiement réussi ! 🎉
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                +{selectedPackage?.passes} Pass ajoutés
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
