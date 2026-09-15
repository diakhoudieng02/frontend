// pages/DiagnosticDetail.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Navbar } from "@/components/layout/Navbar";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Stethoscope,
  ArrowLeft,
  CheckCircle2,
  Trophy,
  Brain,
  AlertTriangle,
  MessageSquare,
  BookOpen,
  RefreshCw,
  Target,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Award,
  Calendar,
  Download,
  Share2,
  Printer,
  ChevronRight,
  Layers,
  FileText,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { diagnosticService } from '@/services/diagnostic.service';
import type { Diagnostic, Weakness, DiagnosticSummary } from '@/services/diagnostic.service';

export default function DiagnosticDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [summary, setSummary] = useState<DiagnosticSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (courseId) {
      loadDiagnosticData();
    } else {
      setError("ID du cours manquant");
      setLoading(false);
    }
  }, [courseId]);

  const loadDiagnosticData = async () => {
    if (!courseId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [diag, weak, summ] = await Promise.allSettled([
        diagnosticService.getDiagnostic(courseId, { minAttempts: 3, includeExercises: true }),
        diagnosticService.getWeaknesses(courseId),
        diagnosticService.getSummary(courseId)
      ]);

      if (diag.status === 'fulfilled') {
        setDiagnostic(diag.value);
      } else {
        console.error('Erreur diagnostic:', diag.reason);
      }

      if (weak.status === 'fulfilled') {
        setWeaknesses(weak.value);
      }

      if (summ.status === 'fulfilled') {
        setSummary(summ.value);
      }

      if (diag.status === 'rejected') {
        setError("Impossible de charger le diagnostic");
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshDiagnostic = async () => {
    if (!courseId) return;
    
    setRefreshing(true);
    try {
      const updated = await diagnosticService.refreshDiagnostic(courseId, 3);
      setDiagnostic(updated);
      
      const weak = await diagnosticService.getWeaknesses(courseId);
      setWeaknesses(weak);
      
      toast({
        title: "✅ Diagnostic mis à jour",
        description: "Les données ont été recalculées",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 40) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 70) return 'Excellent niveau !';
    if (score >= 40) return 'En progression';
    return 'À renforcer';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-60 w-full rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !diagnostic) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-8">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erreur</h2>
            <p className="text-muted-foreground mb-6">{error || "Diagnostic non trouvé"}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/diagnostics')}>
                Voir tous les diagnostics
              </Button>
              <Button variant="outline" onClick={loadDiagnosticData}>
                Réessayer
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const overallScore = diagnostic.overallScore || 0;
  const skillsToReview = diagnostic.skillsToReview || [];
  const strengths = summary?.strengths || diagnostic.strengths || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* En-tête avec navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/diagnostics')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Diagnostic détaillé
              </h1>
              <p className="text-sm text-muted-foreground">
                {diagnostic.courseName || `Cours ${diagnostic.courseId}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshDiagnostic}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Partager
            </Button>
          </div>
        </div>

        {/* Carte de score principal */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 border-blue-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Score circulaire */}
            <div className="relative">
              <svg className="w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 58}`}
                  strokeDashoffset={2 * Math.PI * 58 * (1 - overallScore / 100)}
                  className={cn(
                    "transition-all duration-1000",
                    getScoreColor(overallScore)
                  )}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl font-bold">{overallScore}</span>
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            {/* Informations */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-semibold mb-2">
                {getScoreMessage(overallScore)}
              </h2>
              <p className="text-muted-foreground mb-4">
                Basé sur l'analyse de votre progression dans ce cours
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Points forts</p>
                    <p className="font-semibold">{strengths.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">À réviser</p>
                    <p className="font-semibold">{skillsToReview.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dernière màj</p>
                    <p className="text-sm font-semibold">
                      {new Date(diagnostic.lastUpdated).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs pour différentes vues */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Aperçu</span>
            </TabsTrigger>
            <TabsTrigger value="weaknesses" className="gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Points faibles</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Statistiques</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Aperçu */}
          <TabsContent value="overview" className="space-y-6">
            {/* Points forts */}
            {strengths.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-lg">Points forts</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Points à réviser */}
            {skillsToReview.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="font-semibold text-lg">Points à réviser</h3>
                </div>
                
                <div className="space-y-2">
                  {skillsToReview.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm">{skill}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Actions rapides */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Actions recommandées</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  className="w-full justify-start gap-3 h-auto py-4"
                  variant="outline"
                  onClick={() => navigate(`/course/${courseId}`)}
                >
                  <BookOpen className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Revoir le cours</p>
                    <p className="text-xs text-muted-foreground">Consultez les leçons</p>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                
                <Button
                  className="w-full justify-start gap-3 h-auto py-4 bg-primary hover:bg-primary/90"
                  onClick={() => navigate('/chat', { 
                    state: { 
                      courseId,
                      initialMessage: `J'ai besoin d'aide pour réviser : ${skillsToReview.slice(0, 3).join(', ')}`
                    } 
                  })}
                >
                  <MessageSquare className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Coach IA</p>
                    <p className="text-xs text-white/80">Révision personnalisée</p>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Tab Points faibles */}
          <TabsContent value="weaknesses" className="space-y-6">
            {weaknesses.length > 0 ? (
              weaknesses.map((weakness, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                      getPriorityColor(weakness.priority)
                    )}>
                      <Brain className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{weakness.notion}</h3>
                        <Badge className={cn(
                          weakness.priority === 'high' ? 'bg-red-500' :
                          weakness.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                        )}>
                          {weakness.priority === 'high' ? 'Priorité haute' :
                           weakness.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        {weakness.recommendation}
                      </p>
                      
                      <Button variant="outline" size="sm" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Voir les exercices recommandés
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun point faible détecté</h3>
                <p className="text-muted-foreground">
                  Vous maîtrisez tous les concepts de ce cours. Continuez à vous entraîner !
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Tab Statistiques */}
          <TabsContent value="stats" className="space-y-6">
            {/* Stats par niveau */}
            {diagnostic.statsByLevel && (
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Performance par niveau</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Niveau 1 (Facile)</span>
                      <span className="text-sm font-medium text-green-600">
                        {diagnostic.statsByLevel.level1}%
                      </span>
                    </div>
                    <Progress value={diagnostic.statsByLevel.level1} className="h-2 bg-green-100">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${diagnostic.statsByLevel.level1}%` }} />
                    </Progress>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Niveau 2 (Intermédiaire)</span>
                      <span className="text-sm font-medium text-amber-600">
                        {diagnostic.statsByLevel.level2}%
                      </span>
                    </div>
                    <Progress value={diagnostic.statsByLevel.level2} className="h-2 bg-amber-100">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${diagnostic.statsByLevel.level2}%` }} />
                    </Progress>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Niveau 3 (Avancé)</span>
                      <span className="text-sm font-medium text-red-600">
                        {diagnostic.statsByLevel.level3}%
                      </span>
                    </div>
                    <Progress value={diagnostic.statsByLevel.level3} className="h-2 bg-red-100">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${diagnostic.statsByLevel.level3}%` }} />
                    </Progress>
                  </div>
                </div>
              </Card>
            )}

            {/* Progression dans le temps (simulée) */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Évolution de la progression</h3>
              <div className="h-40 flex items-end justify-between gap-2">
                {[65, 70, 68, 72, 75, 80, 78, 82, 85, 88, 90, overallScore].slice(-6).map((score, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-blue-500 rounded-t-lg transition-all"
                      style={{ height: `${score}px` }}
                    />
                    <span className="text-xs text-muted-foreground">S{i+1}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Évolution sur les 6 dernières semaines
              </p>
            </Card>

            {/* Résumé */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Résumé détaillé</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Score global</dt>
                  <dd className="text-2xl font-bold">{overallScore}%</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Points forts</dt>
                  <dd className="text-2xl font-bold">{strengths.length}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Points à réviser</dt>
                  <dd className="text-2xl font-bold">{skillsToReview.length}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Dernière mise à jour</dt>
                  <dd className="text-sm font-medium">
                    {new Date(diagnostic.lastUpdated).toLocaleString('fr-FR')}
                  </dd>
                </div>
              </dl>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}