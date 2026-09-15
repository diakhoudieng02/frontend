import { useEffect, useRef, useState } from 'react';
import { Sparkles, Loader2, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SummaryGeneratorProps {
  status: 'processing' | 'ready' | 'error';
  generating: boolean;
  onGenerate: () => void;
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export function SummaryGenerator({ status, generating, onGenerate }: SummaryGeneratorProps) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActive = generating || status === 'processing';

  useEffect(() => {
    if (isActive) {
      setElapsed(0);
      intervalRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  return (
    <div className="glass-card p-6 sm:p-8 text-center space-y-4 mt-4 mx-0">
      <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary/60" />
      </div>
      <h3 className="font-display font-semibold text-base sm:text-lg">
        {status === 'processing'
          ? 'Traitement en cours...'
          : 'Résumé non disponible'}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
        {status === 'processing'
          ? "Votre cours est en cours de traitement par l'IA. Cela peut prendre quelques instants."
          : "Générez un résumé intelligent de votre cours pour mieux comprendre et retenir l'essentiel."}
      </p>
      {isActive && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Timer className="h-3.5 w-3.5" />
          <span>{formatElapsed(elapsed)}</span>
        </div>
      )}
      <Button
        onClick={onGenerate}
        disabled={generating || status === 'processing'}
        className="btn-primary-gradient text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
      >
        {generating ? (
          <>
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
            Génération en cours...
          </>
        ) : status === 'processing' ? (
          <>
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
            Traitement...
          </>
        ) : (
          <>
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Générer le résumé
          </>
        )}
      </Button>
    </div>
  );
}
