// components/payment/PricingCard.tsx
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, Star, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PassPackage } from '@/types/payment.types';

// ✅ Logo Wave depuis le dossier public
const waveLogo = '/images/images.png';

const icons = {
  'Pack Découverte': Star,
  'Pack Standard': Sparkles,
  'Pack Avancé': Crown,
  'Pack Pro': Zap,
};

interface PricingCardProps {
  pack: PassPackage;
  onSelect: (pack: PassPackage) => void;
  disabled?: boolean;
  className?: string;
}

export function PricingCard({ pack, onSelect, disabled, className }: PricingCardProps) {
  const Icon = icons[pack.name as keyof typeof icons] || Sparkles;
  const isFree = pack.priceCfa === 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={cn(
        "relative rounded-2xl border bg-card p-6 shadow-sm transition-all",
        pack.recommended && "border-primary shadow-lg shadow-primary/10",
        className
      )}
    >
      {pack.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
            Populaire
          </span>
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          pack.recommended ? "bg-primary/10" : "bg-muted"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            pack.recommended ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg">{pack.name}</h3>
          <p className="text-sm text-muted-foreground">{pack.passAmount} Pass</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{pack.priceCfa.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">FCFA</span>
        </div>
        {pack.tokenEquivalent && (
          <p className="text-xs text-muted-foreground mt-1">
            ≈ {pack.tokenEquivalent.toLocaleString()} tokens
          </p>
        )}
        {pack.savings ? (
          <p className="text-xs text-green-500 mt-1">
            Économisez {pack.savings}%
          </p>
        ) : null}
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 text-primary shrink-0" />
          <span>{pack.passAmount} Pass d'analyse</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 text-primary shrink-0" />
          <span>Valable 1 an</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 text-primary shrink-0" />
          <span>Support prioritaire</span>
        </div>
      </div>

      {/* ✅ Badge Wave avec le vrai logo pour les packs payants */}
      {!isFree && (
        <div className="flex items-center justify-center gap-1.5 mb-3 text-xs">
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-full">
            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
              <img 
                src={waveLogo} 
                alt="Wave" 
                className="w-3 h-3 object-contain"
              />
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">Wave</span>
          </div>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground flex items-center gap-0.5">
            <Smartphone className="w-3 h-3" />
            Mobile
          </span>
        </div>
      )}

      <Button
        onClick={() => onSelect(pack)}
        disabled={disabled || isFree}
        className={cn(
          "w-full h-11 rounded-xl transition-all duration-200 font-medium",
          
          // ✅ MÊME STYLE POUR TOUS LES BOUTONS NON-RECOMMANDÉS (350, 1000, etc.)
          !pack.recommended && [
            // Style de base (outline avec fond blanc)
            "border-purple-200 dark:border-purple-800",
            "text-purple-700 dark:text-purple-300",
            "bg-white dark:bg-transparent",
            
            // ✅ SURVOL : dégradé violet/rose comme le pack 500
            "hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500",
            "hover:text-white",
            "hover:border-transparent",
            "hover:shadow-lg hover:shadow-purple-500/25",
            
            // Désactivé
            "disabled:opacity-50 disabled:pointer-events-none"
          ],
          
          // ✅ Pack recommandé (500) - garde son style existant
          pack.recommended && 
            "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/25"
        )}
        variant={pack.recommended ? "default" : "outline"}
      >
        {isFree ? "Offert" : "Acheter"}
      </Button>

      {isFree && (
        <p className="text-xs text-center text-muted-foreground mt-2">
          Offert à l'inscription
        </p>
      )}
    </motion.div>
  );
}