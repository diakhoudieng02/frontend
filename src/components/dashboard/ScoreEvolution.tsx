// components/dashboard/ScoreEvolution.tsx
import { TrendingUp, Calendar, BarChart3, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useExerciseStats } from '@/hooks/useExerciseStats';

interface ScoreEvolutionProps {
  days?: number;
}

export function ScoreEvolution({ days = 30 }: ScoreEvolutionProps) {
  const { getScoreEvolutionData, loading, stats } = useExerciseStats();
  const [data, setData] = useState<{ date: string; score: number; attempts: number }[]>([]);
  const [viewMode, setViewMode] = useState<'score' | 'attempts'>('score');

  useEffect(() => {
    setData(getScoreEvolutionData(days));
  }, [getScoreEvolutionData, days]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/80 p-5 space-y-4">
        <div className="h-40 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const latest = data.length > 0 ? data[data.length - 1].score : 0;
  const previous = data.length > 1 ? data[data.length - 2].score : latest;
  const trend = latest - previous;

  // Filtrer les données pour n'avoir que les jours avec activité
  const activeData = viewMode === 'score' 
    ? data.filter(d => d.score > 0)
    : data.filter(d => d.attempts > 0);

  const maxScore = Math.max(...data.map(d => d.score), 100);
  const maxAttempts = Math.max(...data.map(d => d.attempts), 1);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-5 space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-sm">Progression</h3>
            <p className="text-[10px] text-muted-foreground">Évolution des scores</p>
          </div>
        </div>

        {/* Sélecteur de vue */}
        <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
          <button
            onClick={() => setViewMode('score')}
            className={cn(
              "px-2 py-1 rounded-md text-xs font-medium transition-colors",
              viewMode === 'score' 
                ? 'bg-primary text-white' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Scores
          </button>
          <button
            onClick={() => setViewMode('attempts')}
            className={cn(
              "px-2 py-1 rounded-md text-xs font-medium transition-colors",
              viewMode === 'attempts' 
                ? 'bg-primary text-white' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Exercices
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 rounded-lg bg-muted/30">
          <p className="text-[10px] text-muted-foreground">Moyenne</p>
          <p className="text-sm font-bold text-foreground">{stats?.averageScore || 0}%</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/30">
          <p className="text-[10px] text-muted-foreground">Meilleur</p>
          <p className="text-sm font-bold text-accent">{stats?.bestScore || 0}%</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/30">
          <p className="text-[10px] text-muted-foreground">Série</p>
          <p className="text-sm font-bold text-amber-500">{stats?.streakDays || 0}j</p>
        </div>
      </div>

      {/* Graphique */}
      <div className="h-40 px-2">
        {activeData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">Aucune donnée</p>
            <p className="text-[10px] text-muted-foreground">Fais des exercices pour voir ta progression</p>
          </div>
        ) : (
          <div className="flex items-end justify-between h-full gap-1">
            {data.map((item, index) => {
              const value = viewMode === 'score' ? item.score : item.attempts;
              const maxValue = viewMode === 'score' ? maxScore : maxAttempts;
              const heightPct = (value / maxValue) * 100;
              const isLatest = index === data.length - 1;
              const hasActivity = item.attempts > 0;
              
              return (
                <div key={item.date} className="flex flex-col items-center flex-1 group">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs rounded-lg p-2 pointer-events-none whitespace-nowrap z-10">
                    <div className="font-medium">{new Date(item.date).toLocaleDateString('fr-FR')}</div>
                    <div className="text-muted-foreground">
                      {item.attempts} exercice{item.attempts > 1 ? 's' : ''}
                    </div>
                    <div className="text-primary font-bold">{item.score}% de réussite</div>
                  </div>

                  {/* Barre */}
                  <div className="w-full max-w-[24px] relative">
                    <div 
                      className={cn(
                        "w-full rounded-t-md transition-all duration-300",
                        hasActivity 
                          ? viewMode === 'score'
                            ? item.score >= 80 
                              ? 'bg-gradient-to-t from-accent to-accent/60'
                              : item.score >= 60
                                ? 'bg-gradient-to-t from-amber-500 to-amber-500/60'
                                : 'bg-gradient-to-t from-destructive to-destructive/60'
                            : 'bg-gradient-to-t from-purple-500 to-pink-500'
                          : 'bg-muted/20'
                      )}
                      style={{ height: `${heightPct}%`, minHeight: hasActivity ? '4px' : '2px' }}
                    />
                    
                    {/* Indicateur d'activité */}
                    {item.attempts > 0 && viewMode === 'score' && (
                      <div 
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse"
                        style={{ opacity: item.attempts > 3 ? 1 : 0.5 }}
                      />
                    )}
                  </div>

                  {/* Date */}
                  <div className={cn(
                    "text-[8px] mt-2 truncate max-w-full",
                    isLatest ? 'font-bold text-primary' : 'text-muted-foreground'
                  )}>
                    {new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground pt-2 border-t border-border/50">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span>Excellent (≥80%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Moyen (60-79%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          <span>À réviser (&lt;60%)</span>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}