// src/components/diagnostic/DiagnosticDashboard.tsx
import { useState, useEffect } from 'react';
import { diagnosticService } from '@/services/diagnostic.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  RefreshCw,
  Filter,
  Loader2,
  Calendar,
  Target,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface DiagnosticDashboardProps {
  courseId: string;
  onError?: (error: string) => void;
}

const PRIORITY_COLORS = {
  High: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  Low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
};

const PRIORITY_LABELS = {
  High: 'Haute priorité',
  Medium: 'Priorité moyenne',
  Low: 'Priorité basse',
};

export function DiagnosticDashboard({ courseId, onError }: DiagnosticDashboardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [weaknesses, setWeaknesses] = useState<any[]>([]);
  const [pedagogicalDiagnostic, setPedagogicalDiagnostic] = useState<any>(null);
  const [selectedPriority, setSelectedPriority] = useState<'high' | 'medium' | 'low' | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDiagnosticData();
  }, [courseId]);

  const loadDiagnosticData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Charger les données en parallèle
      const [summaryData, weaknessesData, diagnosticData] = await Promise.all([
        diagnosticService.getDiagnosticSummary(courseId),
        diagnosticService.getWeaknesses(courseId),
        diagnosticService.getPedagogicalDiagnostic(courseId, { 
          minAttempts: 3,
          includeExercises: true 
        }),
      ]);
      
      setSummary(summaryData);
      setWeaknesses(weaknessesData);
      setPedagogicalDiagnostic(diagnosticData);
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du chargement du diagnostic';
      setError(errorMessage);
      if (onError) onError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const updated = await diagnosticService.refreshDiagnostic(courseId, 3);
      setPedagogicalDiagnostic(updated);
      
      // Recharger aussi les points faibles
      const weaknessesData = await diagnosticService.getWeaknesses(courseId);
      setWeaknesses(weaknessesData);
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du rafraîchissement';
      setError(errorMessage);
      if (onError) onError(errorMessage);
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRevision = (notion: string) => {
    navigate(`/revision/${courseId}/${encodeURIComponent(notion)}`);
  };

  const filteredWeaknesses = selectedPriority === 'all'
    ? weaknesses
    : weaknesses.filter(w => w.priority.toLowerCase() === selectedPriority);

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Chargement du diagnostic...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-destructive">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive font-medium mb-2">Erreur de chargement</p>
        <p className="text-muted-foreground text-sm mb-4">{error}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={loadDiagnosticData} variant="outline">
            Réessayer
          </Button>
          <Button onClick={() => navigate('/courses')} variant="ghost">
            Voir mes cours
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Carte de résumé */}
      {summary && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <Brain className="h-4 w-4" />
                Résumé du diagnostic
              </p>
              <p className="text-base md:text-lg font-medium leading-relaxed">
                {summary.summary}
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">Progression globale</p>
              <p className="text-3xl md:text-4xl font-bold text-primary">{summary.overall_progress}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-accent/10 rounded-lg p-4 text-center">
              <CheckCircle2 className="h-6 w-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-accent">{summary.strengths_count}</p>
              <p className="text-xs text-muted-foreground">Points forts</p>
            </div>
            <div className="bg-amber-500/10 rounded-lg p-4 text-center">
              <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-500">{summary.weaknesses_count}</p>
              <p className="text-xs text-muted-foreground">Points à réviser</p>
            </div>
          </div>

          {summary.last_diagnostic_date && (
            <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Dernière mise à jour : {new Date(summary.last_diagnostic_date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </Card>
      )}

      {/* Points faibles avec filtres */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Points à réviser
          </h3>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
              Actualiser
            </Button>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as any)}
                className="text-sm bg-muted rounded-lg px-3 py-2 border-none focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="all">Toutes priorités</option>
                <option value="high">Haute priorité</option>
                <option value="medium">Priorité moyenne</option>
                <option value="low">Priorité basse</option>
              </select>
            </div>
          </div>
        </div>

        {filteredWeaknesses.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-4" />
            <p className="font-display font-semibold text-lg mb-2">
              Aucun point faible à afficher
            </p>
            <p className="text-muted-foreground">
              {selectedPriority !== 'all' 
                ? `Aucun point faible avec cette priorité` 
                : 'Bravo ! Vous maîtrisez toutes les notions pour le moment.'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredWeaknesses.map((weakness, index) => (
              <Card 
                key={index} 
                className={cn(
                  'p-5 hover:shadow-md transition-shadow cursor-pointer group',
                  weakness.priority === 'High' ? 'border-l-4 border-l-rose-500' :
                  weakness.priority === 'Medium' ? 'border-l-4 border-l-amber-500' :
                  'border-l-4 border-l-emerald-500'
                )}
                onClick={() => handleRevision(weakness.notion)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={cn(
                      'text-xs font-medium px-2 py-1 rounded-full',
                      PRIORITY_COLORS[weakness.priority as keyof typeof PRIORITY_COLORS]
                    )}>
                      {PRIORITY_LABELS[weakness.priority as keyof typeof PRIORITY_LABELS]}
                    </span>
                  </div>
                  {weakness.attempts_count !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {weakness.attempts_count} tentative{weakness.attempts_count > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                <h4 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {weakness.notion}
                </h4>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {weakness.recommendation}
                </p>

                {weakness.success_rate !== undefined && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Taux de réussite</span>
                      <span className={cn(
                        'font-medium',
                        weakness.success_rate >= 70 ? 'text-accent' :
                        weakness.success_rate >= 40 ? 'text-amber-500' : 'text-destructive'
                      )}>
                        {weakness.success_rate}%
                      </span>
                    </div>
                    <Progress value={weakness.success_rate} className="h-1.5" />
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 text-sm text-primary">
                  <BookOpen className="h-4 w-4" />
                  <span>Réviser cette notion</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Diagnostic pédagogique détaillé */}
      {pedagogicalDiagnostic && (
        <Card className="p-6">
          <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Analyse détaillée
          </h3>

          {/* Score global */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Score global</span>
              <span className="font-bold text-lg">
                {Math.round(pedagogicalDiagnostic.overall_score * 100)}%
              </span>
            </div>
            <Progress value={pedagogicalDiagnostic.overall_score * 100} className="h-2.5" />
          </div>

          {/* Stats par niveau */}
          <div className="space-y-4 mb-6">
            <p className="text-sm font-medium text-muted-foreground">Performance par niveau</p>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Niveau 1 <span className="text-muted-foreground">(Fondamental)</span></span>
                <span className="font-medium">{pedagogicalDiagnostic.stats_by_level.level_1}</span>
              </div>
              <Progress 
                value={parseInt(pedagogicalDiagnostic.stats_by_level.level_1)} 
                className="h-2" 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Niveau 2 <span className="text-muted-foreground">(Application)</span></span>
                <span className="font-medium">{pedagogicalDiagnostic.stats_by_level.level_2}</span>
              </div>
              <Progress 
                value={parseInt(pedagogicalDiagnostic.stats_by_level.level_2)} 
                className="h-2" 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Niveau 3 <span className="text-muted-foreground">(Maîtrise)</span></span>
                <span className="font-medium">{pedagogicalDiagnostic.stats_by_level.level_3}</span>
              </div>
              <Progress 
                value={parseInt(pedagogicalDiagnostic.stats_by_level.level_3)} 
                className="h-2" 
              />
            </div>
          </div>

          {/* Progression */}
          {pedagogicalDiagnostic.progression !== 0 && (
            <div className={cn(
              'p-4 rounded-lg mb-4 flex items-center gap-3',
              pedagogicalDiagnostic.progression > 0 
                ? 'bg-accent/10 text-accent' 
                : 'bg-destructive/10 text-destructive'
            )}>
              <TrendingUp className="h-5 w-5" />
              <div>
                <p className="font-medium">
                  Progression : {pedagogicalDiagnostic.progression > 0 ? '+' : ''}
                  {pedagogicalDiagnostic.progression.toFixed(1)}%
                </p>
                <p className="text-xs opacity-80">
                  {pedagogicalDiagnostic.progression > 0 
                    ? ' par rapport au dernier diagnostic' 
                    : ' depuis le dernier diagnostic'}
                </p>
              </div>
            </div>
          )}

          {/* Actions recommandées */}
          {pedagogicalDiagnostic.recommended_actions.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Actions recommandées
              </p>
              <ul className="space-y-2">
                {pedagogicalDiagnostic.recommended_actions.map((action, index) => (
                  <li key={index} className="text-sm text-foreground/80 flex items-start gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {index + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Nombre d'exercices tentés */}
          {pedagogicalDiagnostic.exercises_attempted !== undefined && (
            <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
              Diagnostic basé sur {pedagogicalDiagnostic.exercises_attempted} exercices tentés
            </p>
          )}
        </Card>
      )}
    </div>
  );
}