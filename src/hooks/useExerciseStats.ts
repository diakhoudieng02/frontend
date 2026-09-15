import { useState, useEffect, useCallback } from 'react';
import { exerciseHistoryService } from '@/services/exercise-history.service';
import { useAuth } from '@/contexts/AuthContext';

export function useExerciseStats(courseId?: string) {
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // ✅ Utiliser le service local au lieu des appels API
      const historyData = await exerciseHistoryService.getHistory(courseId || '');
      const statsData = await exerciseHistoryService.getStats(courseId || '');
      
      setHistory(historyData);
      setStats(statsData);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Formate les données pour le graphique d'évolution des scores
   */
  const getScoreEvolutionData = useCallback((days: number = 30) => {
    const now = new Date();
    const data: { date: string; score: number; attempts: number }[] = [];
    
    // Grouper par jour
    const groupedByDay = new Map<string, { totalScore: number; count: number }>();
    
    history.forEach(attempt => {
      const date = attempt.completedAt.split('T')[0];
      const existing = groupedByDay.get(date) || { totalScore: 0, count: 0 };
      groupedByDay.set(date, {
        totalScore: existing.totalScore + attempt.percentage,
        count: existing.count + 1
      });
    });
    
    // Générer les données pour les N derniers jours
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = groupedByDay.get(dateStr);
      const avgScore = dayData ? Math.round(dayData.totalScore / dayData.count) : 0;
      
      data.push({
        date: dateStr,
        score: avgScore,
        attempts: dayData?.count || 0
      });
    }
    
    return data;
  }, [history]);

  /**
   * Récupère la progression par concept
   */
  const getConceptProgress = useCallback(() => {
    const conceptMap = new Map<string, { totalScore: number; count: number }>();
    
    history.forEach(attempt => {
      const existing = conceptMap.get(attempt.conceptTag) || { totalScore: 0, count: 0 };
      conceptMap.set(attempt.conceptTag, {
        totalScore: existing.totalScore + attempt.percentage,
        count: existing.count + 1
      });
    });
    
    return Array.from(conceptMap.entries()).map(([concept, data]) => ({
      concept,
      averageScore: Math.round(data.totalScore / data.count),
      attempts: data.count
    }));
  }, [history]);

  /**
   * Récupère les données pour le graphique d'évolution par difficulté
   */
  const getDifficultyEvolution = useCallback((days: number = 30) => {
    const now = new Date();
    const data: { date: string; easy: number; medium: number; hard: number }[] = [];
    
    // Grouper par jour et difficulté
    const groupedByDay = new Map<string, { easy: number[]; medium: number[]; hard: number[] }>();
    
    history.forEach(attempt => {
      const date = attempt.completedAt.split('T')[0];
      const dayData = groupedByDay.get(date) || { easy: [], medium: [], hard: [] };
      
      if (attempt.difficulty === 'easy') {
        dayData.easy.push(attempt.percentage);
      } else if (attempt.difficulty === 'medium') {
        dayData.medium.push(attempt.percentage);
      } else {
        dayData.hard.push(attempt.percentage);
      }
      
      groupedByDay.set(date, dayData);
    });
    
    // Générer les données pour les N derniers jours
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = groupedByDay.get(dateStr);
      
      const avgEasy = dayData?.easy.length 
        ? Math.round(dayData.easy.reduce((a, b) => a + b, 0) / dayData.easy.length) 
        : 0;
      const avgMedium = dayData?.medium.length 
        ? Math.round(dayData.medium.reduce((a, b) => a + b, 0) / dayData.medium.length) 
        : 0;
      const avgHard = dayData?.hard.length 
        ? Math.round(dayData.hard.reduce((a, b) => a + b, 0) / dayData.hard.length) 
        : 0;
      
      data.push({
        date: dateStr,
        easy: avgEasy,
        medium: avgMedium,
        hard: avgHard
      });
    }
    
    return data;
  }, [history]);

  return {
    history,
    stats,
    loading,
    error,
    refresh: loadData,
    getScoreEvolutionData,
    getConceptProgress,
    getDifficultyEvolution
  };
}