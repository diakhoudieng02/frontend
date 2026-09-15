// pages/Pricing.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, Zap, Award, History, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/payment/PricingCard';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { TransactionHistory } from '@/components/pass/TransactionHistory';
import { usePassBalance } from '@/hooks/usePassBalance';
import { paymentService } from '@/services/payment.service';
import type { PassPackage } from '@/types/payment.types';
import { cn } from '@/lib/utils';

export default function Pricing() {
  const navigate = useNavigate();
  const { balance, refresh } = usePassBalance();
  const [packages, setPackages] = useState<PassPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<PassPackage | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getPackages();
      setPackages(data);
    } catch (error) {
      console.error('❌ Erreur chargement forfaits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPack = (pack: PassPackage) => {
    setSelectedPack(pack);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    refresh();
    setShowPaymentModal(false);
    setSelectedPack(null);
  };

  const handleModalClose = () => {
    setShowPaymentModal(false);
    setSelectedPack(null);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory && historyRef.current) {
      setTimeout(() => {
        historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  };

  const features = [
    { icon: Zap, text: "Analyse de documents PDF" },
    { icon: Sparkles, text: "Résumés générés par IA" },
    { icon: Award, text: "Flashcards personnalisées" },
    { icon: Shield, text: "Données sécurisées" },
  ];

  return (
    <div className="min-h-screen bg-background">
   
      
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <main className="relative container mx-auto px-4 py-8 md:py-12">
        {/* En-tête */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Passez à l'action
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Des forfaits adaptés à vos besoins. 1 Pass = 1 000 000 tokens = analyse complète d'un document.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8 md:mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">{feature.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Grille des forfaits - CENTRÉE PARFAITEMENT */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement des forfaits...</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <div className={cn(
              "grid gap-6 w-full",
              // Adaptation selon le nombre de packs
              packages.length === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-6xl",
              packages.length === 3 && "grid-cols-1 md:grid-cols-3 max-w-4xl",
              packages.length === 2 && "grid-cols-1 md:grid-cols-2 max-w-2xl",
              packages.length === 1 && "grid-cols-1 max-w-md"
            )}>
              {packages.map((pack) => (
                <PricingCard
                  key={pack.id}
                  pack={pack}
                  onSelect={handleSelectPack}
                />
              ))}
            </div>
          </div>
        )}

        {/* Solde actuel - REMONTÉ POUR COMBLER L'ESPACE */}
        <div className="flex justify-center mt-10 md:mt-8">
          <div className="p-6 bg-card rounded-2xl border max-w-md w-full text-center">
            <p className="text-sm text-muted-foreground mb-2">Votre solde actuel</p>
            <p className="text-4xl font-bold text-primary mb-2">{balance}</p>
            <p className="text-sm text-muted-foreground">Pass disponibles</p>
            <Button 
              variant="link" 
              onClick={() => navigate('/dashboard')}
              className="mt-2"
            >
              Retour au tableau de bord
            </Button>
          </div>
        </div>

        {/* Bouton pour afficher/masquer l'historique */}
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={toggleHistory}
            className={cn(
              "gap-2 transition-all",
              showHistory && "bg-primary/10 border-primary"
            )}
          >
            <History className={cn("h-4 w-4", showHistory && "text-primary")} />
            {showHistory ? "Masquer l'historique" : "Voir l'historique"}
            {showHistory ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Historique des transactions - Conteneur défilant */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              ref={historyRef}
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-6"
            >
              <div className="flex justify-center">
                <div className="bg-card rounded-2xl border p-6 max-w-2xl w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      Historique des transactions
                    </h2>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      Dernières transactions
                    </span>
                  </div>
                  
                  {/* Conteneur avec hauteur fixe et défilement */}
                  <div className="relative">
                    {/* Gradient de fondu en haut */}
                    <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-card to-transparent pointer-events-none z-10" />
                    
                    {/* Zone défilante */}
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40">
                      <TransactionHistory />
                    </div>
                    
                    {/* Gradient de fondu en bas */}
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-card to-transparent pointer-events-none z-10" />
                  </div>
                  
                  {/* Indicateur de défilement */}
                  <div className="flex items-center justify-center gap-1 mt-3 text-xs text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="mx-1">Défilez pour voir plus</span>
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal de paiement */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleModalClose}
        onSuccess={handlePaymentSuccess}
        selectedPack={selectedPack}
      />
    </div>
  );
}