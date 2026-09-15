// components/revision/MethodCardGenerator.tsx
import { motion } from 'framer-motion';
import { BookMarked, Download, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { MethodCard } from '@/hooks/useRevision';

interface MethodCardGeneratorProps {
  passage: string;
  onPassageChange: (value: string) => void;
  onGenerate: () => void;
  loading: boolean;
  methodCard: MethodCard | null;
  onDownload: () => void;
}

export function MethodCardGenerator({ 
  passage, 
  onPassageChange, 
  onGenerate, 
  loading, 
  methodCard,
  onDownload 
}: MethodCardGeneratorProps) {
  return (
    <div className="glass-card p-5">
      <h3 className="font-display font-semibold text-base mb-4 flex items-center gap-2">
        <BookMarked className="h-4 w-4 text-primary" />
        Générateur de fiche méthode
      </h3>
      
      <Textarea
        placeholder="Collez un passage complexe pour obtenir une méthode pas-à-pas (min 50 caractères)..."
        value={passage}
        onChange={(e) => onPassageChange(e.target.value)}
        rows={3}
        className="resize-none text-sm mb-3"
      />
      
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={onGenerate}
          disabled={loading || passage.length < 50}
          className="gap-2 text-xs"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          Générer une fiche méthode
        </Button>
      </div>

      {/* ✅ Affichage de la fiche méthode */}
      {methodCard && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-muted/30 rounded-lg space-y-3"
        >
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-sm">{methodCard.title}</h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onDownload}
              title="Télécharger"
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">{methodCard.context}</p>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {methodCard.steps.map((step) => (
              <div key={step.stepNumber} className="text-xs pl-4 border-l-2 border-primary/30">
                <span className="font-medium">{step.stepNumber}. {step.title}</span>
                <p className="text-muted-foreground mt-1">{step.description}</p>
                {step.warning && (
                  <p className="text-amber-500 text-[10px] mt-1">⚠️ {step.warning}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}