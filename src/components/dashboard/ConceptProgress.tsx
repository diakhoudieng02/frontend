// components/dashboard/ConceptProgress.tsx
import { Brain, ChevronRight } from 'lucide-react';
import { useExerciseStats } from '@/hooks/useExerciseStats';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils'; // ✅ AJOUTER CET IMPORT

export function ConceptProgress() {
  const { getConceptProgress, loading } = useExerciseStats();
  
  if (loading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/80 p-5">
        <div className="h-40 animate-pulse bg-muted/20 rounded-lg" />
      </div>
    );
  }

  const concepts = getConceptProgress().sort((a, b) => b.averageScore - a.averageScore);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
          <Brain className="h-4 w-4 text-purple-500" />
        </div>
        <div>
          <h3 className="font-display font-bold text-foreground text-sm">Maîtrise par concept</h3>
          <p className="text-[10px] text-muted-foreground">Forces et faiblesses</p>
        </div>
      </div>

      <div className="space-y-3">
        {concepts.map((concept) => (
          <div key={concept.concept} className="space-y-1 group cursor-pointer hover:bg-muted/30 p-2 rounded-lg transition-colors">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">{concept.concept}</span>
                <span className="text-[10px] text-muted-foreground">({concept.attempts} ex.)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={cn(
                  "text-xs font-bold",
                  concept.averageScore >= 80 ? 'text-accent' :
                  concept.averageScore >= 60 ? 'text-amber-500' :
                  'text-destructive'
                )}>
                  {concept.averageScore}%
                </span>
                <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <Progress 
              value={concept.averageScore} 
              className={cn(
                "h-1.5",
                concept.averageScore >= 80 ? 'bg-accent/20' :
                concept.averageScore >= 60 ? 'bg-amber-500/20' :
                'bg-destructive/20'
              )}
              // ✅ indicatorClassName n'existe pas, on utilise style personnalisé
              style={{
                backgroundColor: concept.averageScore >= 80 ? 'rgba(34, 197, 94, 0.2)' :
                               concept.averageScore >= 60 ? 'rgba(245, 158, 11, 0.2)' :
                               'rgba(239, 68, 68, 0.2)'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}