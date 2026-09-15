// pages/Diagnostic.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { diagnosticService } from '@/services/diagnostic.service';
import { coursesService } from '@/services/courses.service';
import { PassBadge } from "@/components/pass/PassBadge";
import { usePasses } from "@/hooks/usePasses";
import type { Diagnostic, Weakness, DiagnosticSummary } from '@/services/diagnostic.service';
import {
  Stethoscope,
  ArrowLeft,
  CheckCircle2,
  Trophy,
  Brain,
  AlertTriangle,
  MessageSquare,
  Loader2,
  BookOpen,
  RefreshCw,
  ChevronRight,
  GraduationCap,
  ChevronDown,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  subject?: string;
}

// Nombre de cours affichés initialement dans la liste diagnostic
const INITIAL_DISPLAY = 10;
const LOAD_MORE_COUNT = 10;

function isNoExerciseError(err: any): boolean {
  if (!err) return false;
  const msg: string = (err?.message || err?.error || '').toLowerCase();
  return (
    msg.includes('exercice') ||
    msg.includes('exercise') ||
    msg.includes('aucun') ||
    msg.includes('no attempt') ||
    err?.status === 404 ||
    err?.statusCode === 404
  );
}

function CourseCard({
  course,
  summary,
  loadingSummary,
  hasNoData,
  onClick,
}: {
  course: Course;
  summary?: DiagnosticSummary;
  loadingSummary: boolean;
  hasNoData: boolean;
  onClick: () => void;
}) {
  const score = summary?.overallScore;

  const scoreColor =
    score === undefined ? 'text-muted-foreground' :
    score >= 70 ? 'text-green-500' :
    score >= 40 ? 'text-amber-500' : 'text-destructive';

  return (
    <button
      onClick={onClick}
      className="glass-card w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left"
    >
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        hasNoData ? 'bg-muted/40' : 'bg-primary/10'
      )}>
        <GraduationCap className={cn("h-5 w-5", hasNoData ? 'text-muted-foreground' : 'text-primary')} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{course.title}</p>
        {course.subject && (
          <p className="text-xs text-muted-foreground">{course.subject}</p>
        )}
        {hasNoData && (
          <p className="text-xs text-muted-foreground mt-0.5">Aucun exercice tenté</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {loadingSummary ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : score !== undefined ? (
          <span className={cn('text-sm font-bold', scoreColor)}>{score}%</span>
        ) : hasNoData ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            À commencer
          </span>
        ) : null}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </button>
  );
}

export default function DiagnosticPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [summaries, setSummaries] = useState<Record<string, DiagnosticSummary>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});
  const [noDataCourses, setNoDataCourses] = useState<Record<string, boolean>>({});

  // ✅ Contrôle du nombre d'éléments affichés dans la liste
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    balance, 
    loading: passesLoading, 
    refreshBalance,
    addTransaction,
  } = usePasses();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoadingCourses(true);
    setDisplayCount(INITIAL_DISPLAY);
    try {
      const data = await coursesService.getMyCourses();
      setCourses(data);
      loadAllSummaries(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les cours",
        variant: "destructive",
      });
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadAllSummaries = async (courseList: Course[]) => {
    const loadingState = courseList.reduce(
      (acc, c) => ({ ...acc, [c.id]: true }),
      {} as Record<string, boolean>
    );
    setLoadingSummaries(loadingState);

    await Promise.allSettled(
      courseList.map(async (course) => {
        try {
          const summary = await diagnosticService.getSummary(course.id);
          if (summary) {
            setSummaries((prev) => ({ ...prev, [course.id]: summary }));
          } else {
            setNoDataCourses((prev) => ({ ...prev, [course.id]: true }));
          }
        } catch (err: any) {
          // Ignorer les erreurs
        } finally {
          setLoadingSummaries((prev) => ({ ...prev, [course.id]: false }));
        }
      })
    );
  };

  const handleSelectCourse = async (course: Course) => {
    setSelectedCourse(course);
    setDiagnostic(null);
    setWeaknesses([]);
    setLoadingDetail(true);

    try {
      const [diag, weak] = await Promise.all([
        diagnosticService.getDiagnostic(course.id, { minAttempts: 1, includeExercises: true }),
        diagnosticService.getWeaknesses(course.id, 'high'),
      ]);
      setDiagnostic(diag);
      setWeaknesses(weak);
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de charger le diagnostic",
        variant: "destructive",
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedCourse) return;
    setRefreshing(true);
    try {
      const [updated, weak] = await Promise.all([
        diagnosticService.refreshDiagnostic(selectedCourse.id, 3),
        diagnosticService.getWeaknesses(selectedCourse.id, 'high'),
      ]);
      setDiagnostic(updated);
      setWeaknesses(weak);
      setSummaries((prev) => ({
        ...prev,
        [selectedCourse.id]: {
          overallScore: updated.overallScore,
          masteredCount: updated.skillsSummary.mastered.length,
          toReviewCount: updated.skillsSummary.toReview.length,
          masteryRate: updated.skillsSummary.masteryRate,
          progressionTrend: updated.progressionTrend,
          lastUpdated: updated.lastUpdated,
        },
      }));
      toast({ title: "✅ Diagnostic mis à jour" });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de rafraîchir le diagnostic",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

 const goBack = () => {
  if (selectedCourse) {
    setSelectedCourse(null);
    setDiagnostic(null);
  } else {
    // ✅ Retour à la page précédente seulement si on est dans la vue détail
    navigate(-1);
  }
};

 const goToCourse = () => {
  if (selectedCourse) {
    // ✅ Rediriger directement vers les exercices du cours
    navigate(`/course/${selectedCourse.id}?tab=exercises`);
  }
};

  const goToChat = () => {
    navigate('/chat', {
      state: {
        courseId: selectedCourse?.id,
        initialMessage: diagnostic?.skillsSummary?.toReview?.length
          ? `J'ai besoin d'aide pour réviser : ${diagnostic.skillsSummary.toReview.map(s => s.concept).join(', ')}`
          : "J'ai besoin d'aide pour réviser",
      },
    });
  };

  // ✅ Cours affichés dans la liste (slice pour limiter l'affichage initial)
  const visibleCourses = courses.slice(0, displayCount);
  const hasMore = displayCount < courses.length;
  const remainingCount = courses.length - displayCount;

  // VUE LISTE
  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">

         {/* Header conditionnel */}
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
    {/* Bouton retour uniquement si un cours est sélectionné */}
    {selectedCourse ? (
      <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8">
        <ArrowLeft className="h-4 w-4" />
      </Button>
    ) : null}
    
    <h1 className="font-display text-2xl font-bold flex items-center gap-2">
      <Stethoscope className="h-5 w-5 text-primary" />
      Diagnostic
    </h1>
  </div>
  
  <div className="w-full sm:w-auto sm:shrink-0">
    <PassBadge
      balance={balance}
      loading={passesLoading}
      onBuyClick={() => navigate('/pricing')}
      showProgress={true}
      maxPass={100}
    />
  </div>
</div>
          <p className="text-sm text-muted-foreground">
            Sélectionnez un cours pour voir votre diagnostic détaillé.
          </p>

          {loadingCourses ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : courses.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium mb-1">Aucun cours trouvé</p>
              <p className="text-sm text-muted-foreground mb-4">
                Inscrivez-vous à un cours pour obtenir un diagnostic.
              </p>
              <Button onClick={() => navigate('/courses')}>Voir les cours</Button>
            </div>
          ) : (
            <>
              {/* ✅ Zone scrollable avec hauteur fixe + scrollbar discrète */}
              <div
                className={cn(
                  "overflow-y-auto pr-1",
                  // Hauteur max : ~5 items visibles (chaque item ~72px + gap)
                  "max-h-[calc(100vh-280px)]",
                  // Scrollbar fine et discrète
                  "scrollbar-thin scrollbar-thumb-border/60 scrollbar-track-transparent",
                  "hover:scrollbar-thumb-primary/30",
                )}
              >
                <div className="space-y-3 pb-2">
                  {visibleCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      summary={summaries[course.id]}
                      loadingSummary={loadingSummaries[course.id] ?? false}
                      hasNoData={noDataCourses[course.id] ?? false}
                      onClick={() => handleSelectCourse(course)}
                    />
                  ))}
                </div>
              </div>

              {/* ✅ Compteur + Bouton "Charger plus" */}
              <div className="flex flex-col items-center gap-2 border-t border-border/40 pt-3">
                <p className="text-xs text-muted-foreground">
                  {visibleCourses.length} / {courses.length} cours affichés
                </p>
                {hasMore && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl text-xs h-8"
                    onClick={() => setDisplayCount(prev => prev + LOAD_MORE_COUNT)}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                    Voir {Math.min(remainingCount, LOAD_MORE_COUNT)} cours de plus
                  </Button>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  // VUE DÉTAIL
  const overallScore = diagnostic?.overallScore ?? 0;
  const skillsToReview = diagnostic?.skillsSummary?.toReview?.map(s => s.concept) ?? [];
  const strengths = diagnostic?.skillsSummary?.mastered?.map(s => s.concept) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Diagnostic
              </h1>
              <p className="text-xs text-muted-foreground">{selectedCourse.title}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loadingDetail}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            Actualiser
          </Button>
        </div>

   

          {loadingDetail ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Chargement du diagnostic...</p>
              </div>
            </div>
          ) : !diagnostic ? (
            <div className="glass-card p-8 text-center">
              <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Aucun diagnostic disponible</h2>
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore fait d'exercices pour ce cours.
              </p>
              <Button onClick={goToCourse} className="gap-2">
                <BookOpen className="h-4 w-4" />
                Commencer les exercices
              </Button>
            </div>
          ) : (
            <>
              {/* ✅ Layout 2 colonnes : Score à gauche, infos à droite */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Colonne gauche - Score global (1/3 de la largeur) */}
                <div className="md:col-span-1">
                  <div className="glass-card p-4 text-center h-full flex flex-col items-center justify-center">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-3">
                      <svg className="w-24 h-24 sm:w-28 sm:h-28 transform -rotate-90">
                        <circle 
                          cx="56" cy="56" r="50" 
                          stroke="currentColor" 
                          strokeWidth="6" 
                          fill="none" 
                          className="text-muted/20" 
                        />
                        <circle
                          cx="56" cy="56" r="50"
                          stroke="currentColor" 
                          strokeWidth="6" 
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 50}`}
                          strokeDashoffset={2 * Math.PI * 50 * (1 - overallScore / 100)}
                          className={cn(
                            'transition-all duration-1000 ease-out',
                            overallScore >= 70 ? 'text-green-500' :
                            overallScore >= 40 ? 'text-amber-500' : 'text-destructive'
                          )}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Trophy className={cn(
                          'h-6 w-6 sm:h-7 sm:w-7',
                          overallScore >= 70 ? 'text-green-500' :
                          overallScore >= 40 ? 'text-amber-500' : 'text-destructive'
                        )} />
                      </div>
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold mb-1">{overallScore}%</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Score global
                    </p>
                    <p className="text-[8px] sm:text-[10px] text-muted-foreground mt-2">
                      Mis à jour le {new Date(diagnostic.lastUpdated).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Colonne droite - Tous les autres éléments (2/3 de la largeur) */}
                <div className="md:col-span-2 space-y-4">
                  {/* Points à réviser */}
                  {skillsToReview.length > 0 && (
                    <div className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <h2 className="font-semibold text-sm">Points à réviser</h2>
                      </div>
                      <div className="space-y-2">
                        {skillsToReview.map((skill, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                              {index + 1}
                            </span>
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Points forts */}
                  {strengths.length > 0 && (
                    <div className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <h2 className="font-semibold text-sm">Points forts</h2>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {strengths.map((strength, index) => (
                          <span key={index} className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[10px] sm:text-xs">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommandations prioritaires */}
                  {weaknesses.length > 0 && (
                    <div className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="h-4 w-4 text-primary" />
                        <h2 className="font-semibold text-sm">Recommandations</h2>
                      </div>
                      <div className="space-y-3">
                        {weaknesses.map((weakness, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-[8px] px-1.5 py-0.5 rounded-full font-medium",
                                weakness.priority === 'high'   ? 'bg-destructive/10 text-destructive' :
                                weakness.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                                                                 'bg-blue-500/10 text-blue-500'
                              )}>
                                {weakness.priority === 'high' ? 'Haute' :
                                 weakness.priority === 'medium' ? 'Moyenne' : 'Basse'}
                              </span>
                              <span className="text-xs font-medium">{weakness.notion}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground pl-6">{weakness.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons d'action - en dessous des deux colonnes */}
             

             
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2 border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-transparent transition-all duration-200" 
                  onClick={goToCourse}
                >
                  <BookOpen className="h-4 w-4" />
                  Voir le cours
                </Button>
                
                <Button 
                  className="flex-1 gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all duration-200 border-0" 
                  onClick={goToChat}
                >
                  <MessageSquare className="h-4 w-4" />
                  Réviser avec le Coach
                </Button>
              </div>
            </>
          )}
      </main>
    </div>
  );
}