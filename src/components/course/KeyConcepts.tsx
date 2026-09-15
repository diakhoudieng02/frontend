// src/components/course/KeyConcepts.tsx
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles, CheckCircle2, BookOpen, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface KeyConceptsProps {
  concepts: string[];
  variant?: 'badges' | 'cards' | 'compact' | 'gradient' | 'sidebar';
  showIcons?: boolean;
  maxDisplay?: number;
  onConceptClick?: (concept: string) => void;
  className?: string;
}

export function KeyConcepts({ 
  concepts, 
  variant = 'badges', 
  showIcons = true,
  maxDisplay,
  onConceptClick,
  className
}: KeyConceptsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(maxDisplay || concepts.length);
  
  if (!concepts.length) return null;
  
  const displayConcepts = maxDisplay ? concepts.slice(0, visibleCount) : concepts;
  const hasMore = maxDisplay ? concepts.length > visibleCount : false;
  const remainingCount = maxDisplay ? concepts.length - visibleCount : 0;

  // Version "sidebar" - OPTIMISÉE POUR L'AFFICHAGE À GAUCHE
  if (variant === 'sidebar' || variant === 'cards') {
    return (
      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "space-y-4 w-full max-w-full",
          className
        )}
      >
        {/* En-tête compact mais informatif */}
        <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-sm sm:text-base text-foreground">
            Points clés
          </h3>
          <span className="ml-auto text-[10px] sm:text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
            {visibleCount}/{concepts.length}
          </span>
        </div>
        
        {/* Liste verticale des concepts - IDÉAL POUR LA GAUCHE */}
        <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {displayConcepts.map((concept, index) => (
            <motion.div
              key={`${concept}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ x: 4 }}
              className={cn(
                "group relative p-3 rounded-lg transition-all duration-200",
                "bg-gradient-to-r from-primary/5 to-transparent",
                "border-l-2 border-primary/30 hover:border-primary",
                "hover:bg-primary/10",
                onConceptClick && "cursor-pointer"
              )}
              onClick={() => onConceptClick?.(concept)}
            >
              <div className="flex items-start gap-3">
                {/* Numéro avec cercle élégant */}
                <div className="relative flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">{index + 1}</span>
                  </div>
                </div>
                
                {/* Contenu textuel */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed break-words">
                    {concept}
                  </p>
                  
                  {/* Indicateur de lecture (optionnel) */}
                  <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] text-primary">Lire plus</span>
                    <ArrowRight className="h-2.5 w-2.5 text-primary" />
                  </div>
                </div>

                {/* Checkmark pour progression (optionnel) */}
                <motion.div 
                  className="flex-shrink-0"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.03 + 0.3 }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </div>

              {/* Barre de progression individuelle (optionnelle) */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted overflow-hidden rounded-b-lg">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: '60%' }}
                  transition={{ delay: index * 0.03 + 0.5, duration: 0.5 }}
                />
              </div>
            </motion.div>
          ))}
          
          {/* Bouton "Voir plus" si nécessaire */}
          {hasMore && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setVisibleCount(prev => Math.min(prev + 5, concepts.length))}
              className="w-full mt-2 p-2 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1 border border-dashed border-primary/30"
            >
              <BookOpen className="h-3 w-3" />
              Voir {remainingCount} autre{remainingCount > 1 ? 's' : ''} notion{remainingCount > 1 ? 's' : ''}
            </motion.button>
          )}
        </div>

        {/* Pied de page avec progression globale */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Progression</span>
            <span>{Math.round((visibleCount / concepts.length) * 100)}%</span>
          </div>
          <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${(visibleCount / concepts.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Version "gradient" pour la gauche - alternative plus sobre
  if (variant === 'gradient') {
    return (
      <div className={cn("space-y-3 w-full", className)}>
        <h3 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full" />
          Notions essentielles
        </h3>
        
        <div className="space-y-1.5">
          {concepts.slice(0, maxDisplay || concepts.length).map((concept, index) => (
            <div
              key={`${concept}-${index}`}
              className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 transition-colors group"
            >
              <div className="w-1 h-1 mt-2 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
              <p className="text-xs text-foreground/80 group-hover:text-foreground transition-colors leading-relaxed">
                {concept}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Version badges (inchangée)
  if (variant === 'badges') {
    return (
      <div className={cn("space-y-3", className)}>
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Notions clés
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {concepts.map((concept, index) => (
            <span
              key={`${concept}-${index}`}
              className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20"
            >
              {concept}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Version compact
  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
        {concepts.map((concept, index) => (
          <span
            key={`${concept}-${index}`}
            className="text-xs bg-primary/5 px-2 py-0.5 rounded-full text-primary border border-primary/10"
          >
            {concept}
          </span>
        ))}
      </div>
    );
  }

  return null;
}