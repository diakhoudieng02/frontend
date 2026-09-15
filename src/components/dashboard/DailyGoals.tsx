// components/dashboard/DailyGoals.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, Brain, CheckCircle2, Circle, Sparkles, 
  BookOpen, AlertCircle, Loader2, FileText, ChevronRight,
  ChevronDown, ChevronUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { coursesService } from '@/services/courses.service';
import { exerciseHistoryService } from '@/services/exercise-history.service';
import { revisionHistoryService } from '@/services/revision-history.service';
import type { Course } from '@/types';

interface DailyGoalsProps {
  // Props optionnelles si besoin
}

export function DailyGoals({}: DailyGoalsProps) {
  const navigate = useNavigate();
  const getCourseRoute = (course: Course) =>
    course.type === 'EPREUVE' ? `/correction/${course.id}` : `/course/${course.id}`;
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [exercisesByCourse, setExercisesByCourse] = useState<Record<string, number>>({});
  const [revisionStats, setRevisionStats] = useState<Record<string, boolean>>({});
  
  // États pour le pliage/dépliage
  const [expandedSections, setExpandedSections] = useState({
    revision: false,
    exercises: false
  });

  // Charger les cours et les exercices
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les cours
      const coursesData = await coursesService.getMyCourses();
      setCourses(coursesData);
      console.log('📚 Cours chargés:', coursesData.length);

      // Charger les statistiques de révisions pour TOUS les cours
      const courseIds = coursesData.map(c => c.id);
      const stats = revisionHistoryService.getAllCoursesStats(courseIds);
      setRevisionStats(Object.fromEntries(
        Object.entries(stats).map(([id, s]) => [id, s.hasRevisions])
      ));
      
      // Debug: voir tout l'historique
      if (process.env.NODE_ENV === 'development') {
        revisionHistoryService.debug();
      }

      // Charger les exercices pour chaque cours
      const exercisesCount: Record<string, number> = {};
      
      for (const course of coursesData) {
        try {
          const history = await exerciseHistoryService.getHistory(course.id);
          exercisesCount[course.id] = history.length;
        } catch (error) {
          console.error(`❌ Erreur chargement exercices pour cours ${course.id}:`, error);
          exercisesCount[course.id] = 0;
        }
      }
      
      setExercisesByCourse(exercisesCount);
      console.log('📊 Exercices par cours:', exercisesCount);
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si un cours a des révisions
  const hasRevisions = (courseId: string): boolean => {
    return revisionStats[courseId] || false;
  };

  // Debug: Afficher l'état des révisions
  useEffect(() => {
    if (!loading && courses.length > 0) {
      console.log('🔍 État des révisions (via service):');
      courses.forEach(course => {
        const hasRev = hasRevisions(course.id);
        console.log(`- ${course.title}: ${hasRev ? '✅ A des révisions' : '❌ Sans révisions'}`);
      });
    }
  }, [loading, courses, revisionStats]);

  const totalCourses = courses.length;
  
  // Compter les cours sans révisions
  const coursesWithoutRevision = courses.filter(c => !hasRevisions(c.id)).length;
  const coursesWithRevision = courses.filter(c => hasRevisions(c.id)).length;
  
  // Compter les cours sans exercices
  const coursesWithoutExercises = courses.filter(c => 
    !exercisesByCourse[c.id] || exercisesByCourse[c.id] === 0
  ).length;
  const coursesWithExercises = courses.filter(c => 
    exercisesByCourse[c.id] && exercisesByCourse[c.id] > 0
  ).length;

  // Objectifs basés sur les manques
  const goals = [
    { 
      id: 'g1', 
      task: 'Générer des révisions', 
      description: 'Cours sans révision',
      completed: coursesWithRevision, 
      total: totalCourses, 
      icon: '📚',
      type: 'revision',
      color: 'text-blue-500',
      missing: coursesWithoutRevision,
      action: () => navigate('/courses?filter=pending')
    },
    { 
      id: 'g2', 
      task: 'Faire des exercices', 
      description: 'Cours sans exercices',
      completed: coursesWithExercises, 
      total: totalCourses, 
      icon: '✍️',
      type: 'exercise',
      color: 'text-green-500',
      missing: coursesWithoutExercises,
      action: () => navigate('/courses?filter=exercises')
    },
  ];

  const activeGoals = goals.filter(g => g.total > 0);
  const completedCount = activeGoals.filter(g => g.completed >= g.total).length;
  const totalGoals = activeGoals.length;
  const progressPct = totalGoals > 0 ? Math.round((completedCount / totalGoals) * 100) : 0;
  const allDone = completedCount === totalGoals && totalGoals > 0;

  // Fonctions pour basculer l'état des sections
  const toggleSection = (section: 'revision' | 'exercises') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // État de chargement
  if (loading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/80 p-6">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Chargement des objectifs...</span>
        </div>
      </div>
    );
  }

  // Si aucun cours
  if (totalCourses === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/80 overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Target className="h-6 w-6 text-primary/60" />
          </div>
          <h3 className="font-display font-semibold text-sm mb-1">Aucun cours pour l'instant</h3>
          <p className="text-xs text-muted-foreground">
            Importe des cours pour commencer à réviser !
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
                <circle cx="22" cy="22" r="18" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                <circle
                  cx="22" cy="22" r="18" fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 18}`}
                  strokeDashoffset={`${2 * Math.PI * 18 * (1 - progressPct / 100)}`}
                  className="transition-all duration-700 ease-out"
                  opacity={0.7}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {allDone ? (
                  <Sparkles className="h-4 w-4 text-foreground/70" />
                ) : (
                  <Target className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground text-sm">Objectifs du jour</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {allDone ? 'Tous les objectifs sont complétés ! 🎉' : `${completedCount} sur ${totalGoals} objectifs`}
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
            {totalCourses} cours
          </span>
        </div>

        {/* Bouton de debug */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => {
              console.log('🎯 DEBUG MANUEL (via service):');
              courses.forEach(course => {
                const hasRev = hasRevisions(course.id);
                console.log(`- ${course.title}: ${hasRev ? '✅ A révisions' : '❌ Sans révisions'}`);
              });
              revisionHistoryService.debug();
            }}
            className="mt-2 text-[8px] text-muted-foreground underline"
          >
            Debug révisions
          </button>
        )}
      </div>

      {/* Liste des objectifs */}
      <div className="px-3 pb-2">
        {activeGoals.map((goal) => {
          const isDone = goal.completed >= goal.total;
          const progress = Math.round((goal.completed / goal.total) * 100);
          const missing = goal.missing;
          
          return (
            <button
              key={goal.id}
              onClick={goal.action}
              disabled={isDone}
              className={cn(
                'w-full flex items-center gap-3 rounded-xl px-3 py-3 transition-all text-left',
                isDone 
                  ? 'opacity-50 cursor-default' 
                  : 'hover:bg-muted/20 cursor-pointer active:scale-[0.99]'
              )}
            >
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
              )}
              
              <span className="text-base shrink-0">{goal.icon}</span>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm truncate flex items-center gap-1',
                  isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                )}>
                  {goal.task}
                  {!isDone && missing > 0 && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full ml-1",
                      goal.type === 'revision' 
                        ? "bg-amber-500/10 text-amber-500" 
                        : "bg-blue-500/10 text-blue-500"
                    )}>
                      {missing}
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {goal.description} • {goal.completed}/{goal.total} ({progress}%)
                </p>
              </div>

              {!isDone && (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Résumé des cours */}
      <div className="mx-3 mb-3 grid grid-cols-2 gap-2">
        {/* Section Révisions avec bouton de pliage */}
        <div className="bg-muted/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-muted-foreground">Révisions</p>
            {coursesWithoutRevision > 0 && (
              <button
                onClick={() => toggleSection('revision')}
                className="p-1 hover:bg-muted/50 rounded"
              >
                {expandedSections.revision ? (
                  <ChevronUp className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-foreground">{coursesWithRevision}</span>
            <span className="text-[10px] text-muted-foreground">prêtes</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(coursesWithRevision / totalCourses) * 100}%` }}
              />
            </div>
            <span className="text-[8px] text-muted-foreground">
              {coursesWithoutRevision} en attente
            </span>
          </div>

          {/* Liste des cours sans révision (dépliée) */}
          {expandedSections.revision && coursesWithoutRevision > 0 && (
            <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
              {courses.filter(c => !hasRevisions(c.id)).map(course => (
                <button
                  key={course.id}
                  onClick={() => navigate(`/course/${course.id}`)}
                    onClick={() => navigate(getCourseRoute(course))}
                  className="w-full flex items-center gap-2 text-xs bg-background/50 p-2 rounded-lg hover:bg-background/80 transition-colors"
                >
                  <BookOpen className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate flex-1 text-left">{course.title}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section Exercices avec bouton de pliage */}
        <div className="bg-muted/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-muted-foreground">Exercices</p>
            {coursesWithoutExercises > 0 && (
              <button
                onClick={() => toggleSection('exercises')}
                className="p-1 hover:bg-muted/50 rounded"
              >
                {expandedSections.exercises ? (
                  <ChevronUp className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-foreground">{coursesWithExercises}</span>
            <span className="text-[10px] text-muted-foreground">avec exos</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${(coursesWithExercises / totalCourses) * 100}%` }}
              />
            </div>
            <span className="text-[8px] text-muted-foreground">
              {coursesWithoutExercises} sans exos
            </span>
          </div>

          {/* Liste des cours sans exercices (dépliée) */}
          {expandedSections.exercises && coursesWithoutExercises > 0 && (
            <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
              {courses.filter(c => !exercisesByCourse[c.id] || exercisesByCourse[c.id] === 0).map(course => (
                <button
                  key={course.id}
                  onClick={() => navigate(`/course/${course.id}`)}
                    onClick={() => navigate(getCourseRoute(course))}
                  className="w-full flex items-center gap-2 text-xs bg-background/50 p-2 rounded-lg hover:bg-background/80 transition-colors"
                >
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate flex-1 text-left">{course.title}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alertes rapides */}
      <div className="mx-3 mb-3 space-y-2">
        {coursesWithoutRevision > 0 && (
          <button
            onClick={() => navigate('/courses?filter=pending')}
            className="w-full flex items-center justify-between p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                {coursesWithoutRevision} cours {coursesWithoutRevision > 1 ? 'sont en attente' : 'est en attente'} de révision
              </p>
            </div>
            <ChevronRight className="h-3 w-3 text-amber-500" />
          </button>
        )}

        {coursesWithoutExercises > 0 && (
          <button
            onClick={() => navigate('/courses?filter=exercises')}
            className="w-full flex items-center justify-between p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3 text-blue-500 shrink-0" />
              <p className="text-[10px] text-blue-600 dark:text-blue-400">
                {coursesWithoutExercises} cours {coursesWithoutExercises > 1 ? 'n\'ont' : 'n\'a'} pas encore d'exercices
              </p>
            </div>
            <ChevronRight className="h-3 w-3 text-blue-500" />
          </button>
        )}
      </div>

      {/* Tip personnalisé */}
      <div className="mx-3 mb-3 flex items-start gap-2.5 rounded-xl bg-muted/30 p-3">
        <Brain className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Astuce :</span>{' '}
          {coursesWithoutRevision > 0 && coursesWithoutExercises > 0
            ? `Commence par générer des révisions pour tes ${coursesWithoutRevision} cours, puis crée des exercices.`
            : coursesWithoutRevision > 0
              ? `Génère des révisions pour tes ${coursesWithoutRevision} cours en attente.`
              : coursesWithoutExercises > 0
                ? `Crée des exercices pour tes ${coursesWithoutExercises} cours qui n'en ont pas encore.`
                : allDone
                  ? 'Bravo ! Tous tes cours ont des révisions et des exercices. 🎉'
                  : 'Continue comme ça, tu progresses bien !'}
        </p>
      </div>
    </div>
  );
}