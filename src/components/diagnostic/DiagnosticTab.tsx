// components/diagnostic/DiagnosticTab.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Stethoscope,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Clock,
  ChevronRight,
  RefreshCw,
  FileQuestion,
  Brain,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { diagnosticService } from '@/services/diagnostic.service';
import type { Diagnostic } from '@/services/diagnostic.service';

interface DiagnosticTabProps {
  courseId: string;
  courseName: string;
}

export function DiagnosticTab({ courseId, courseName }: DiagnosticTabProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkDiagnostic();
  }, [courseId]);

  const checkDiagnostic = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const diag = await diagnosticService.getDiagnostic(courseId, { minAttempts: 1 });
      setDiagnostic(diag);
    } catch (err: any) {
      if (err.status === 404) {
        // Pas de diagnostic, c'est normal
        setDiagnostic(null);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDiagnostic = async () => {
    setGenerating(true);
    
    try {
      const result = await diagnosticService.refreshDiagnostic(courseId, 3);
      setDiagnostic(result);
      
      toast({
        title: "✅ Diagnostic généré",
        description: `Score: ${result.overallScore}% - ${result.skillsToReview?.length || 0} points à réviser`,
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de générer le diagnostic",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleViewFullDiagnostic = () => {
    navigate(`/diagnostic/${courseId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Erreur de chargement</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={checkDiagnostic}>Réessayer</Button>
      </Card>
    );
  }

  if (!diagnostic) {
    return (
      <Card className="p-8 text-center">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Stethoscope className="h-10 w-10 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold mb-3">Diagnostic non disponible</h2>
        
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Aucun diagnostic n'a encore été généré pour ce cours. 
          Pour obtenir une analyse personnalisée de votre progression, 
          générez votre diagnostic maintenant.
        </p>

        <div className="bg-muted/30 p-6 rounded-lg mb-6 max-w-md mx-auto">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Ce que le diagnostic vous apportera :
          </h3>
          <ul className="text-sm text-left space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Score global de maîtrise du cours</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Identification des points forts et faibles</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Recommandations personnalisées de révision</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Suivi de progression dans le temps</span>
            </li>
          </ul>
        </div>

        <Button
          onClick={handleGenerateDiagnostic}
          disabled={generating}
          size="lg"
          className="gap-2 px-8"
        >
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Stethoscope className="h-5 w-5" />
              Générer mon diagnostic
            </>
          )}
        </Button>
      </Card>
    );
  }

  const scoreColor = diagnostic.overallScore >= 70 ? 'text-green-600' :
                     diagnostic.overallScore >= 40 ? 'text-amber-600' : 'text-red-600';

  const scoreBg = diagnostic.overallScore >= 70 ? 'bg-green-100' :
                  diagnostic.overallScore >= 40 ? 'bg-amber-100' : 'bg-red-100';

  return (
    <div className="space-y-6 p-6">
      {/* Score global */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className={cn(
              "h-24 w-24 rounded-full flex items-center justify-center text-2xl font-bold",
              scoreBg,
              scoreColor
            )}>
              {diagnostic.overallScore}%
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-semibold mb-2">Votre progression</h2>
            <p className="text-muted-foreground mb-4">
              Dernière mise à jour : {new Date(diagnostic.lastUpdated).toLocaleDateString('fr-FR')}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Points forts</p>
                <p className="text-2xl font-bold text-green-600">
                  {diagnostic.strengths?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">À réviser</p>
                <p className="text-2xl font-bold text-amber-600">
                  {diagnostic.skillsToReview?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Points forts */}
      {diagnostic.strengths && diagnostic.strengths.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-500" />
            Points forts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {diagnostic.strengths.map((strength, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">{strength}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Points à réviser */}
      {diagnostic.skillsToReview && diagnostic.skillsToReview.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-500" />
            Points à réviser
          </h3>
          <div className="space-y-3">
            {diagnostic.skillsToReview.map((skill, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold">
                  {index + 1}
                </span>
                <span className="text-sm">{skill}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Stats par niveau */}
      {diagnostic.statsByLevel && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Performance par niveau</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Niveau 1 (Facile)</span>
                <span className="text-sm font-medium text-green-600">
                  {diagnostic.statsByLevel.level1}%
                </span>
              </div>
              <Progress value={diagnostic.statsByLevel.level1} className="h-2 bg-green-100" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Niveau 2 (Intermédiaire)</span>
                <span className="text-sm font-medium text-amber-600">
                  {diagnostic.statsByLevel.level2}%
                </span>
              </div>
              <Progress value={diagnostic.statsByLevel.level2} className="h-2 bg-amber-100" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Niveau 3 (Avancé)</span>
                <span className="text-sm font-medium text-red-600">
                  {diagnostic.statsByLevel.level3}%
                </span>
              </div>
              <Progress value={diagnostic.statsByLevel.level3} className="h-2 bg-red-100" />
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={checkDiagnostic}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
        <Button
          onClick={handleViewFullDiagnostic}
          className="flex-1 gap-2"
        >
          Voir le diagnostic détaillé
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}