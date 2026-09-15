// hooks/useExerciseHistory.ts
import { useState, useEffect, useCallback } from 'react';
import { exerciseHistoryService, ExerciseStats, ExerciseAttempt } from '@/services/exercise-history.service';
import { useToast } from '@/hooks/use-toast';

export function useExerciseHistory(courseId: string) {
  const { toast } = useToast();
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [history, setHistory] = useState<ExerciseAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [masteredExercises, setMasteredExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
    loadMastered();
  }, [courseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, historyData] = await Promise.all([
        exerciseHistoryService.getStats(courseId),
        exerciseHistoryService.getHistory(courseId)
      ]);
      setStats(statsData);
      setHistory(historyData);
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMastered = () => {
    const mastered = exerciseHistoryService.getMasteredExercises(courseId);
    setMasteredExercises(new Set(mastered));
  };

  const saveAttempt = useCallback(async (
    exerciseId: string,
    selectedAnswer: number,
    isCorrect: boolean,
    difficultyLevel: 1 | 2 | 3,
    conceptTag: string,
    timeSpent: number = 0
  ) => {
    // ✅ Récupérer le vrai userId depuis le service (défini par AuthContext)
    const userId = exerciseHistoryService.getCurrentUser();

    if (!userId) {
      console.warn('⚠️ Tentative de sauvegarde sans utilisateur connecté');
    }

    const attempt = {
      exerciseId,
      courseId,
      userId: userId ?? 'anonymous',
      selectedAnswer,
      isCorrect,
      timeSpent,
      difficultyLevel,
      conceptTag
    };

    const saved = await exerciseHistoryService.saveAttempt(attempt);
    
    setHistory(prev => [saved, ...prev].slice(0, 50));
    
    const newStats = await exerciseHistoryService.getStats(courseId);
    setStats(newStats);

    if (isCorrect && newStats.streak > 0 && newStats.streak % 5 === 0) {
      toast({
        title: "🔥 Série de " + newStats.streak + " !",
        description: "Continue comme ça !",
      });
    }

    return saved;
  }, [courseId, toast]);

  const markAsMastered = useCallback(async (exerciseId: string) => {
    await exerciseHistoryService.markAsMastered(exerciseId, courseId);
    setMasteredExercises(prev => new Set([...prev, exerciseId]));
    
    toast({
      title: "⭐ Exercice maîtrisé !",
      description: "Cet exercice ne sera plus proposé prioritairement",
    });
  }, [courseId, toast]);

  const getExercisesToReview = useCallback((exercises: any[], limit: number = 5) => {
    if (!stats) return exercises.slice(0, limit);

    return [...exercises]
      .sort((a, b) => {
        const aStats = stats.byConcept[a.conceptTag];
        const bStats = stats.byConcept[b.conceptTag];
        
        const aRate = aStats?.successRate ?? 100;
        const bRate = bStats?.successRate ?? 100;
        
        return aRate - bRate;
      })
      .slice(0, limit);
  }, [stats]);

  return {
    stats,
    history,
    loading,
    masteredExercises,
    saveAttempt,
    markAsMastered,
    getExercisesToReview,
    refresh: loadData
  };
}