import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { DifficultyCard } from '@/components/exercises/DifficultyCard';
import { ExerciseFeedback } from '@/components/exercises/ExerciseFeedback';
import { 
  ClipboardList, 
  Trophy, 
  Target, 
  Flame,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/services/api';
import { diagnosticService } from '@/services/diagnostic.service';
import type { DiagnosticResult } from '@/types/diagnostic';

// Types pour les exercices
interface Exercise {
  id: string;
  courseId: string;
  difficultyLevel: 1 | 2 | 3;
  conceptTag: string;
  questionData: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    errorHint?: string;
    questionType: 'multiple_choice';
  };
  attempts?: ExerciseAttempt[];
  createdAt: string;
}

interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  createdAt: string;
}

type DifficultyLevel = 'bronze' | 'silver' | 'gold';
type View = 'home' | 'quiz';

const difficultyToLevel: Record<DifficultyLevel, number> = {
  'bronze': 1,
  'silver': 2,
  'gold': 3
};

export default function Exercises() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [view, setView] = useState<View>('home');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [stats, setStats] = useState([
    { label: 'Exercices faits', value: 0, icon: ClipboardList, color: 'text-primary' },
    { label: 'Bonnes réponses', value: '0%', icon: Target, color: 'text-accent' },
    { label: 'Série en cours', value: 0, icon: Flame, color: 'text-orange-500' },
  ]);

  // Vérifier si on a un courseId
  useEffect(() => {
    console.log('📍 URL actuelle:', location.pathname);
    console.log('📍 courseId depuis params:', courseId);
    
    if (!courseId) {
      console.log('⚠️ Pas de courseId dans l\'URL');
      const timer = setTimeout(() => {
        if (!courseId) {
          console.log('🔄 Redirection vers /courses car pas de courseId');
          navigate('/courses');
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [courseId, location, navigate]);

  // Fetch exercises seulement si on a un courseId
  useEffect(() => {
    if (courseId) {
      fetchExercises();
      fetchDiagnostic();
    }
  }, [courseId]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      // Utiliser any pour voir la structure réelle
      const response = await api.get<any>(`/exercises/${courseId}`);
      
      console.log('📦 Réponse API exercises:', response);
      
      // 🔍 Examiner la structure de la réponse
      console.log('🔍 Structure complète:', JSON.stringify(response, null, 2));
      
      // Essayer différentes structures possibles
      let exercisesData: Exercise[] = [];
      
      if (response?.data?.exercises) {
        // Structure: { data: { exercises: [...] } }
        exercisesData = response.data.exercises;
        console.log('✅ Structure trouvée: response.data.exercises');
      } else if (response?.exercises) {
        // Structure: { exercises: [...] }
        exercisesData = response.exercises;
        console.log('✅ Structure trouvée: response.exercises');
      } else if (Array.isArray(response)) {
        // Structure directe: [...]
        exercisesData = response;
        console.log('✅ Structure trouvée: tableau direct');
      } else if (response?.data?.data?.exercises) {
        // Structure: { data: { data: { exercises: [...] } } }
        exercisesData = response.data.data.exercises;
        console.log('✅ Structure trouvée: response.data.data.exercises');
      }
      
      if (exercisesData.length > 0) {
        setExercises(exercisesData);
        updateStats(exercisesData);
      } else {
        console.warn('⚠️ Aucun exercice trouvé dans la réponse');
        setExercises([]);
        updateStats([]);
      }
    } catch (err: any) {
      console.error('Error fetching exercises:', err);
      
      if (err.status === 404) {
        toast({
          title: "Aucun exercice trouvé",
          description: "Génération automatique d'exercices...",
        });
        generateExercises();
      } else {
        setError("Erreur lors du chargement des exercices");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDiagnostic = async () => {
    try {
      const results = await diagnosticService.getResults();
      
      if (results && results.length > 0) {
        const sorted = [...results].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setDiagnostic(sorted[0]);
      }
    } catch (err) {
      console.error('Error fetching diagnostic:', err);
    }
  };

  const generateExercises = async () => {
    try {
      setGenerating(true);
      const response = await api.post<any>(`/exercises/${courseId}/generate`, {
        force: false,
        targetCount: 12,
        language: 'fr'
      });
      
      console.log('📦 Réponse API generate:', response);
      
      // Même logique pour la génération
      let exercisesData: Exercise[] = [];
      
      if (response?.data?.exercises) {
        exercisesData = response.data.exercises;
      } else if (response?.exercises) {
        exercisesData = response.exercises;
      } else if (response?.data?.data?.exercises) {
        exercisesData = response.data.data.exercises;
      }
      
      if (exercisesData.length > 0) {
        setExercises(exercisesData);
        updateStats(exercisesData);
        
        const count = response?.data?.exercisesGenerated || 
                     response?.exercisesGenerated || 
                     exercisesData.length;
        
        toast({
          title: "Exercices générés !",
          description: `${count} exercices disponibles`,
        });
      } else {
        throw new Error('Structure de réponse invalide');
      }
    } catch (err: any) {
      console.error('Error generating exercises:', err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de générer les exercices",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const updateStats = (exercisesList: Exercise[]) => {
    if (!Array.isArray(exercisesList)) {
      console.error('❌ exercisesList n\'est pas un tableau:', exercisesList);
      return;
    }

    const completedCount = exercisesList.filter((ex: Exercise) => ex.attempts?.length > 0).length;
    const correctCount = exercisesList.filter((ex: Exercise) => 
      ex.attempts?.some(attempt => attempt.isCorrect)
    ).length;
    const successRate = completedCount > 0 ? Math.round((correctCount / completedCount) * 100) : 0;

    setStats(prev => [
      { ...prev[0], value: completedCount },
      { ...prev[1], value: `${successRate}%` },
      { ...prev[2], value: calculateStreak(exercisesList) }
    ]);
  };

  const handleStartQuiz = (difficulty: DifficultyLevel) => {
    const filtered = exercises.filter(
      ex => ex.difficultyLevel === difficultyToLevel[difficulty]
    );
    
    if (filtered.length === 0) {
      toast({
        title: "Aucun exercice",
        description: "Aucun exercice disponible pour ce niveau",
      });
      return;
    }

    setSelectedDifficulty(difficulty);
    setFilteredExercises(filtered);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setView('quiz');
  };

  const handleSelectAnswer = async (index: number) => {
    if (showFeedback || submitting) return;
    
    const currentExercise = filteredExercises[currentQuestionIndex];
    const isCorrect = index === currentExercise.questionData.correctAnswer;

    setSelectedAnswer(index);
    setShowFeedback(true);
    
    if (isCorrect) {
      setScore(score + 1);
    }

    try {
      setSubmitting(true);
      await api.post<any>('/exercises/submit', {
        exerciseId: currentExercise.id,
        userAnswer: currentExercise.questionData.options[index],
        isCorrect,
        timeSpent: 0
      });
    } catch (err: any) {
      console.error('Error submitting answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (currentQuestionIndex < filteredExercises.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      evaluateSession();
      setView('home');
    }
  };

  const evaluateSession = async () => {
    if (!courseId) return;
    
    try {
      const response = await api.post<any>(`/exercises/${courseId}/evaluate-session`, {
        minAttempts: 1
      });
      
      // Extraire le score selon la structure
      const overallScore = response?.data?.evaluation?.overallScore || 
                          response?.evaluation?.overallScore || 
                          0;
      
      if (overallScore) {
        toast({
          title: "Session terminée !",
          description: `Score global : ${overallScore}%`,
        });
      }

      fetchDiagnostic();
      fetchExercises();
    } catch (err: any) {
      console.error('Error evaluating session:', err);
    }
  };

  const calculateStreak = (exercisesList: Exercise[]): number => {
    if (!Array.isArray(exercisesList)) return 0;
    
    const recentAttempts = exercisesList
      .flatMap(ex => ex.attempts || [])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    let streak = 0;
    for (const attempt of recentAttempts) {
      if (attempt.isCorrect) streak++;
      else break;
    }
    return streak;
  };

  const getDifficultyLevels = () => {
    if (!Array.isArray(exercises)) {
      return [
        { difficulty: 'bronze' as const, title: 'Niveau Bronze', description: 'Questions de base pour consolider', questionsCount: 0, completedCount: 0, locked: true },
        { difficulty: 'silver' as const, title: 'Niveau Argent', description: 'Questions intermédiaires', questionsCount: 0, completedCount: 0, locked: true },
        { difficulty: 'gold' as const, title: 'Niveau Or', description: 'Questions avancées type Bac', questionsCount: 0, completedCount: 0, locked: true },
      ];
    }

    const countsByDifficulty = {
      easy: exercises.filter(ex => ex.difficultyLevel === 1).length,
      medium: exercises.filter(ex => ex.difficultyLevel === 2).length,
      hard: exercises.filter(ex => ex.difficultyLevel === 3).length,
    };

    const completedByDifficulty = {
      easy: exercises.filter(ex => 
        ex.difficultyLevel === 1 && ex.attempts && ex.attempts.length > 0
      ).length,
      medium: exercises.filter(ex => 
        ex.difficultyLevel === 2 && ex.attempts && ex.attempts.length > 0
      ).length,
      hard: exercises.filter(ex => 
        ex.difficultyLevel === 3 && ex.attempts && ex.attempts.length > 0
      ).length,
    };

    return [
      {
        difficulty: 'bronze' as const,
        title: 'Niveau Bronze',
        description: 'Questions de base pour consolider',
        questionsCount: countsByDifficulty.easy,
        completedCount: completedByDifficulty.easy,
        locked: countsByDifficulty.easy === 0,
      },
      {
        difficulty: 'silver' as const,
        title: 'Niveau Argent',
        description: 'Questions intermédiaires',
        questionsCount: countsByDifficulty.medium,
        completedCount: completedByDifficulty.medium,
        locked: countsByDifficulty.medium === 0,
      },
      {
        difficulty: 'gold' as const,
        title: 'Niveau Or',
        description: 'Questions avancées type Bac',
        questionsCount: countsByDifficulty.hard,
        completedCount: completedByDifficulty.hard,
        locked: countsByDifficulty.hard === 0,
      },
    ];
  };

  const currentExercise = filteredExercises[currentQuestionIndex];
  const progress = filteredExercises.length > 0 
    ? ((currentQuestionIndex + 1) / filteredExercises.length) * 100 
    : 0;

  // Afficher un message si pas de courseId
  if (!courseId && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4 px-4">
          <AlertCircle className="w-12 h-12 text-amber-500" />
          <h2 className="text-xl font-semibold text-center">Aucun cours sélectionné</h2>
          <p className="text-muted-foreground text-center">
            Veuillez sélectionner un cours pour accéder aux exercices.
          </p>
          <Button onClick={() => navigate('/courses')}>
            Voir mes cours
          </Button>
        </div>
      </div>
    );
  }

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4 px-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-destructive text-center">{error}</p>
          <Button onClick={() => navigate('/courses')}>
            Retour aux cours
          </Button>
        </div>
      </div>
    );
  }

  // Rendu principal
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {stats.map(({ label, value, icon: Icon, color }, index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-elevated p-3 text-center"
                  >
                    <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                    <p className="font-display font-bold text-xl text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Mastery Progress */}
              {diagnostic && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card-elevated p-4 rounded-2xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-6 h-6 text-amber-500" />
                    <h3 className="font-display font-semibold text-foreground">
                      Maîtrise globale
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Score global</span>
                        <span className="font-medium text-foreground">
                          {Math.round(diagnostic.score || 0)}%
                        </span>
                      </div>
                      <Progress value={diagnostic.score || 0} className="h-3" />
                    </div>
                    
                    {diagnostic.weaknesses && diagnostic.weaknesses.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Concepts à réviser :
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {diagnostic.weaknesses.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs rounded-full bg-orange-500/10 text-orange-500"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.section>
              )}

              {/* Difficulty Levels */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-lg text-foreground">
                    Choisis ton niveau
                  </h3>
                  {generating && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Génération...
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {getDifficultyLevels().map((level, index) => (
                    <motion.div
                      key={level.difficulty}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <DifficultyCard
                        {...level}
                        onClick={() => !level.locked && handleStartQuiz(level.difficulty)}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {view === 'quiz' && currentExercise && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[calc(100vh-4rem)] flex flex-col"
            >
              {/* Quiz Header */}
              <div className="pt-4 pb-2">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => setView('home')}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} sur {filteredExercises.length}
                    </p>
                    {currentExercise.conceptTag && (
                      <p className="text-xs text-primary mt-1">
                        Concept : {currentExercise.conceptTag}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-accent">{score}</span>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Question */}
              <div className="flex-1 py-6">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-xl font-bold text-foreground leading-relaxed">
                    {currentExercise.questionData.question}
                  </h2>

                  <div className="space-y-3">
                    {currentExercise.questionData.options.map((option, index) => {
                      const isSelected = selectedAnswer === index;
                      const isCorrect = index === currentExercise.questionData.correctAnswer;
                      const showResult = showFeedback;

                      return (
                        <motion.button
                          key={index}
                          whileHover={!showFeedback && !submitting ? { scale: 1.02 } : {}}
                          whileTap={!showFeedback && !submitting ? { scale: 0.98 } : {}}
                          onClick={() => handleSelectAnswer(index)}
                          disabled={showFeedback || submitting}
                          className={`
                            w-full p-4 rounded-2xl border-2 text-left transition-all
                            ${showResult && isCorrect 
                              ? 'border-accent bg-accent/10' 
                              : showResult && isSelected && !isCorrect
                                ? 'border-destructive bg-destructive/10'
                                : isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border bg-card hover:border-primary/50'
                            }
                            ${submitting ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium
                              ${showResult && isCorrect 
                                ? 'border-accent bg-accent text-accent-foreground' 
                                : showResult && isSelected && !isCorrect
                                  ? 'border-destructive bg-destructive text-destructive-foreground'
                                  : isSelected
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border text-muted-foreground'
                              }
                            `}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className="font-medium text-foreground">{option}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Feedback */}
              {showFeedback && (
                <ExerciseFeedback
                  isCorrect={selectedAnswer === currentExercise.questionData.correctAnswer}
                  correctAnswer={currentExercise.questionData.options[currentExercise.questionData.correctAnswer]}
                  explanation={currentExercise.questionData.explanation}
                  onContinue={handleContinue}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}