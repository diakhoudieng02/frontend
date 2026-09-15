import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error?: string;
  onBack: () => void;
}

export function ErrorState({ error, onBack }: ErrorStateProps) {
  return (
    <div className="text-center max-w-md">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
      </div>
      <h2 className="text-base sm:text-lg font-semibold mb-2">Cours introuvable</h2>
      <p className="text-xs sm:text-sm text-muted-foreground mb-4">
        {error || 'Ce cours n\'existe pas ou a été supprimé'}
      </p>
      <Button onClick={onBack} variant="outline" size="sm" className="sm:h-10">
        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        Retour aux cours
      </Button>
    </div>
  );
}