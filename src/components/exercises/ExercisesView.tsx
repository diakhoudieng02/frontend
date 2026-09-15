// components/exercises/ExercisesView.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, AlertCircle, 
  Dumbbell, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ExerciseStats } from './ExerciseStats';
import { DifficultyLevels } from './DifficultyLevels';
import { QuizView } from './QuizView';
import { ExerciseHistory } from './ExerciseHistory';
import { exercisesService, type ApiExercise } from '@/services/exercises.service';
import { exerciseHistoryService } from '@/services/exercise-history.service';
import { useAuth } from '@/contexts/AuthContext';

interface QuizExercise {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  concept_tag: string;
  difficultyLevel: 1 | 2 | 3;
}

function convertExercise(apiExercise: ApiExercise): QuizExercise | null {
  if (!apiExercise.questionData) {
    console.warn('⚠️ questionData manquant pour exercice', apiExercise.id);
    return null;
  }

  const { question, options, correctAnswer, explanation } = apiExercise.questionData;
  const correct_index = options.indexOf(correctAnswer);

  return {
    id: apiExercise.id,
    question,
    options,
    correct_index: correct_index >= 0 ? correct_index : 0,
    explanation,
    concept_tag: apiExercise.conceptTag,
    difficultyLevel: apiExercise.difficultyLevel,
  };
}

type DifficultyLevel = 'bronze' | 'silver' | 'gold';
type View = 'home' | 'quiz';

interface ExercisesViewProps {
  courseId: string;
}

export function ExercisesView({ courseId }: ExercisesViewProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const [view, setView] = useState<View>('home');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [exercises, setExercises] = useState<ApiExercise[]>([]);
  const [quizExercises, setQuizExercises] = useState<QuizExercise[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);

  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [masteredExercises, setMasteredExercises] = useState<Set<string>>(new Set());

  const difficultyToLevel: Record<DifficultyLevel, 1 | 2 | 3> = {
    'bronze': 1,
    'silver': 2,
    'gold': 3
  };

  const currentQuizExercise = quizExercises[currentQuestionIndex];
  const progress = quizExercises.length > 0 
    ? ((currentQuestionIndex + 1) / quizExercises.length) * 100 
    : 0;

  // Initialiser le service avec l'utilisateur
  useEffect(() => {
    if (user?.id) {
      exerciseHistoryService.setCurrentUser(user.id);
    }
  }, [user]);

  // Charger les exercices maîtrisés
  const loadMasteredExercises = async () => {
    const mastered = exerciseHistoryService.getMasteredExercises(courseId);
    setMasteredExercises(new Set(mastered));
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const cached = exerciseHistoryService.getCachedExercises(courseId);
        if (cached) {
          console.log('⚡ Exercices chargés depuis le cache local');
          setExercises(cached);
        } else {
          const exercisesResponse = await exercisesService.list(courseId);
          console.log("📦 Exercices reçus depuis l'API:", exercisesResponse);

          const hasQuestionData = exercisesResponse.exercises.length > 0
            && exercisesResponse.exercises[0].questionData != null;

          if (hasQuestionData) {
            setExercises(exercisesResponse.exercises);
            exerciseHistoryService.saveExercises(courseId, exercisesResponse.exercises);
          } else if (exercisesResponse.exercises.length > 0) {
            console.log('⚠️ questionData absent depuis /list, appel de /generate...');
            try {
              const generateResponse = await exercisesService.generate(courseId, {
                force: false,
                targetCount: 12,
                language: 'fr'
              });
              setExercises(generateResponse.exercises);
              exerciseHistoryService.saveExercises(courseId, generateResponse.exercises);
            } catch {
              setExercises(exercisesResponse.exercises);
            }
          } else {
            setExercises([]);
          }
        }
        
        await loadMasteredExercises();
        
        const statsData = await exerciseHistoryService.getStats(courseId);
        setStats(statsData);
        
        const historyData = await exerciseHistoryService.getHistory(courseId);
        setHistory(historyData);
        
      } catch (err: any) {
        console.error('❌ Erreur chargement:', err);
        if (err.status === 404) {
          setExercises([]);
        } else {
          setError("Erreur lors du chargement des exercices");
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [courseId]);

  const generateExercises = async () => {
    try {
      setGenerating(true);
      const response = await exercisesService.generate(courseId, {
        force: false,
        targetCount: 12,
        language: 'fr'
      });
      
      console.log('📦 Exercices générés (complets):', response.exercises);

      exerciseHistoryService.invalidateExercisesCache(courseId);
      exerciseHistoryService.saveExercises(courseId, response.exercises);
      setExercises(response.exercises);
      
      toast({
        title: "✅ Exercices générés !",
        description: `${response.exercisesGenerated} exercices disponibles`,
      });
      
    } catch (err: any) {
      console.error('❌ Error generating exercises:', err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de générer les exercices",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getCompletedCountByDifficulty = (difficulty: 1 | 2 | 3): number => {
    const filteredExercises = exercises.filter(ex => ex.difficultyLevel === difficulty);
    return filteredExercises.filter(ex => masteredExercises.has(ex.id)).length;
  };

  const isLevelCompleted = (difficulty: 1 | 2 | 3): boolean => {
    const total = exercises.filter(ex => ex.difficultyLevel === difficulty).length;
    const completed = getCompletedCountByDifficulty(difficulty);
    return total > 0 && completed >= total;
  };

  const handleStartQuiz = (difficulty: DifficultyLevel) => {
    const level = difficultyToLevel[difficulty];
    const filteredExercises = exercises.filter(ex => ex.difficultyLevel === level);
    
    if (filteredExercises.length === 0) {
      toast({
        title: "Aucun exercice",
        description: `Aucun exercice de niveau ${difficulty} disponible`,
        variant: "destructive"
      });
      return;
    }

    const converted = filteredExercises.map(ex => convertExercise(ex));
    const convertedExercises = converted.filter((ex): ex is QuizExercise => ex !== null);

    if (convertedExercises.length === 0) {
      toast({
        title: "Données incomplètes",
        description: "Regénérez les exercices pour obtenir les questions complètes",
        variant: "destructive"
      });
      return;
    }

    console.log(`✅ ${convertedExercises.length} exercices pour le niveau ${difficulty}`);
    
    setSelectedDifficulty(difficulty);
    setQuizExercises(convertedExercises);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setView('quiz');
  };

  const handleSelectAnswer = async (index: number) => {
    if (showFeedback || submitting) return;
    
    const currentExercise = quizExercises[currentQuestionIndex];
    const isCorrect = index === currentExercise.correct_index;

    setSelectedAnswer(index);
    setShowFeedback(true);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    try {
      setSubmitting(true);

      const attempt = await exerciseHistoryService.saveAttempt({
        exerciseId: currentExercise.id,
        courseId,
        userId: user?.id ?? 'anonymous',
        selectedAnswer: index,
        isCorrect,
        timeSpent: 30,
        difficultyLevel: currentExercise.difficultyLevel,
        conceptTag: currentExercise.concept_tag,
      });

      if (isCorrect) {
        await exerciseHistoryService.markAsMastered(currentExercise.id, courseId);
        setMasteredExercises(prev => {
          const newSet = new Set(prev);
          newSet.add(currentExercise.id);
          return newSet;
        });
        
        console.log(`⭐ Exercice ${currentExercise.id} automatiquement marqué comme maîtrisé`);
      }

      const updatedStats = await exerciseHistoryService.getStats(courseId);
      setStats(updatedStats);
      
      setHistory(prev => [attempt, ...prev]);

    } catch (err: any) {
      console.error('❌ Error saving attempt:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuizComplete = async (finalScore: number) => {
    setView('home');

    toast({
      title: "🎉 Quiz terminé !",
      description: `Score final : ${finalScore}/${quizExercises.length}`,
    });

    try {
      const evaluation = await exercisesService.evaluateSession(courseId, { minAttempts: 1 });
      
      console.log('📊 Évaluation session:', evaluation);
      
      if (evaluation.evaluation.overallScore !== undefined) {
        toast({
          title: "📊 Diagnostic mis à jour",
          description: `Score global : ${Math.round(evaluation.evaluation.overallScore)}%`,
        });
      }
      
      if (evaluation.evaluation.weakConcepts && evaluation.evaluation.weakConcepts.length > 0) {
        toast({
          title: "📚 Points à réviser",
          description: evaluation.evaluation.weakConcepts.slice(0, 3).join(', '),
        });
      }
      
    } catch (err: any) {
      console.warn('⚠️ Erreur évaluation session:', err);
      
      if (err.status === 404) {
        console.log('ℹ️ Pas encore de tentatives enregistrées - c\'est normal pour un premier quiz');
      } else {
        toast({
          title: "Info",
          description: "Les statistiques seront disponibles après quelques exercices",
        });
      }
    }
    
    const updatedStats = await exerciseHistoryService.getStats(courseId);
    setStats(updatedStats);
    
    await loadMasteredExercises();
    
    const bronzeTotal = exercises.filter(ex => ex.difficultyLevel === 1).length;
    const bronzeCompleted = getCompletedCountByDifficulty(1);
    const silverTotal = exercises.filter(ex => ex.difficultyLevel === 2).length;
    
    if (bronzeTotal > 0 && bronzeCompleted >= bronzeTotal && silverTotal > 0) {
      toast({
        title: "🏆 Niveau Bronze complété !",
        description: "Le niveau Argent est maintenant débloqué !",
      });
    }
  };

  const handleContinue = () => {
    if (currentQuestionIndex < quizExercises.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      handleQuizComplete(score);
    }
  };

  const handleMarkAsMastered = async () => {
    if (!currentQuizExercise) return;
    
    await exerciseHistoryService.markAsMastered(currentQuizExercise.id, courseId);
    setMasteredExercises(prev => {
      const newSet = new Set(prev);
      newSet.add(currentQuizExercise.id);
      return newSet;
    });
    
    handleContinue();
    
    toast({
      title: "⭐ Exercice maîtrisé !",
      description: "Il ne sera plus proposé prioritairement",
    });
  };

  const getExerciseStats = () => {
    if (!stats) {
      return { correct: 0, total: 0, streak: 0, bestStreak: 0, successRate: 0 };
    }
    return {
      correct: stats.correctAttempts,
      total: stats.totalAttempts,
      streak: stats.streak,
      bestStreak: stats.bestStreak,
      successRate: stats.successRate
    };
  };

  const getDifficultyLevels = () => {
    if (!Array.isArray(exercises) || exercises.length === 0) {
      return [
        { difficulty: 'bronze' as const, title: 'Niveau Bronze', description: 'Questions de base pour consolider', 
          questionsCount: 0, completedCount: 0, locked: false, isCompleted: false },
        { difficulty: 'silver' as const, title: 'Niveau Argent', description: 'Questions intermédiaires', 
          questionsCount: 0, completedCount: 0, locked: true, isCompleted: false },
        { difficulty: 'gold' as const, title: 'Niveau Or', description: 'Questions avancées type Bac', 
          questionsCount: 0, completedCount: 0, locked: true, isCompleted: false },
      ];
    }

    const countsByDifficulty = {
      bronze: exercises.filter(ex => ex.difficultyLevel === 1).length,
      silver: exercises.filter(ex => ex.difficultyLevel === 2).length,
      gold: exercises.filter(ex => ex.difficultyLevel === 3).length,
    };

    const completedByDifficulty = {
      bronze: getCompletedCountByDifficulty(1),
      silver: getCompletedCountByDifficulty(2),
      gold: getCompletedCountByDifficulty(3),
    };

    const bronzeCompleted = isLevelCompleted(1);
    const silverCompleted = isLevelCompleted(2);

    return [
      {
        difficulty: 'bronze' as const,
        title: 'Niveau Bronze',
        description: 'Questions de base pour consolider',
        questionsCount: countsByDifficulty.bronze,
        completedCount: completedByDifficulty.bronze,
        locked: false,
        isCompleted: bronzeCompleted,
      },
      {
        difficulty: 'silver' as const,
        title: 'Niveau Argent',
        description: 'Questions intermédiaires',
        questionsCount: countsByDifficulty.silver,
        completedCount: completedByDifficulty.silver,
        locked: countsByDifficulty.silver === 0 || !bronzeCompleted,
        isCompleted: silverCompleted,
      },
      {
        difficulty: 'gold' as const,
        title: 'Niveau Or',
        description: 'Questions avancées type Bac',
        questionsCount: countsByDifficulty.gold,
        completedCount: completedByDifficulty.gold,
        locked: countsByDifficulty.gold === 0 || !silverCompleted,
        isCompleted: false,
      },
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  if (exercises.length === 0 && !generating) {
    return (
      <div className="text-center py-12">
        <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucun exercice disponible</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Générez des exercices pour ce cours
        </p>
        <Button onClick={generateExercises} disabled={generating}>
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Générer des exercices
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <ExerciseStats stats={getExerciseStats()} />
            
            {history.length > 0 && (
              <ExerciseHistory attempts={history} />
            )}
            
            <DifficultyLevels
              levels={getDifficultyLevels()}
              onSelectDifficulty={handleStartQuiz}
              generating={generating}
            />
          </motion.div>
        )}

        {view === 'quiz' && currentQuizExercise && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <QuizView
              currentExercise={currentQuizExercise}
              currentIndex={currentQuestionIndex}
              totalQuestions={quizExercises.length}
              score={score}
              progress={progress}
              selectedAnswer={selectedAnswer}
              showFeedback={showFeedback}
              submitting={submitting}
              onSelectAnswer={handleSelectAnswer}
              onContinue={handleContinue}
              onBack={() => setView('home')}
              onMarkAsMastered={handleMarkAsMastered}
              isMastered={exerciseHistoryService.isMastered(currentQuizExercise.id, courseId)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}