// hooks/useScoreEvolution.ts
import { useState, useEffect, useCallback } from 'react';
import { exerciseHistoryService } from '@/services/exercise-history.service';
import { useAuth } from '@/contexts/AuthContext';

export interface ScoreDataPoint {
  date: string;
  score: number;
  attempts: number;
  successRate: number;
  averageScore: number;
}

export function useScoreEvolution(courseId?: string) {
  const { user } = useAuth();
  const [data, setData] = useState<ScoreDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    worstScore: 0,
    streak: 0,
    bestStreak: 0
  });

  useEffect(() => {
    if (user?.id) {
      exerciseHistoryService.setCurrentUser(user.id);
    }
  }, [user?.id]);

  const loadEvolution = useCallback(async (days: number = 30) => {
    setLoading(true);
    try {
      // ✅ Si pas de courseId → charger TOUT l'historique de l'utilisateur
      let history;
      if (courseId) {
        history = await exerciseHistoryService.getHistory(courseId);
      } else {
        // Récupérer tout l'historique et filtrer par userId
        const allHistory = exerciseHistoryService.getAllHistory();
        const userId = exerciseHistoryService.getCurrentUser();
        history = userId
          ? allHistory.filter(a => a.userId === userId)
          : allHistory;
      }

      console.log(`📊 Historique pour utilisateur ${user?.id}: ${history.length} tentatives`);

      // ✅ Stats globales : si pas de courseId, calculer manuellement
      let statsData;
      if (courseId) {
        statsData = await exerciseHistoryService.getStats(courseId);
      } else {
        // Calculer les stats depuis l'historique complet
        const correct = history.filter(a => a.isCorrect).length;
        statsData = {
          totalAttempts: history.length,
          correctAttempts: correct,
          successRate: history.length > 0 ? (correct / history.length) * 100 : 0,
          streak: 0,
          bestStreak: 0,
          byDifficulty: { bronze: { total: 0, correct: 0, successRate: 0 }, silver: { total: 0, correct: 0, successRate: 0 }, gold: { total: 0, correct: 0, successRate: 0 } },
          byConcept: {},
          lastAttempts: []
        };
      }

      if (history.length === 0) {
        setData([]);
        setStats({ totalAttempts: 0, averageScore: 0, bestScore: 0, worstScore: 0, streak: 0, bestStreak: 0 });
        setLoading(false);
        return;
      }

      // Grouper par jour
      const groupedByDay = new Map<string, { scores: number[]; attempts: number }>();
      history.forEach(attempt => {
        const date = new Date(attempt.createdAt).toISOString().split('T')[0];
        const existing = groupedByDay.get(date) || { scores: [], attempts: 0 };
        existing.scores.push(attempt.isCorrect ? 100 : 0);
        existing.attempts++;
        groupedByDay.set(date, existing);
      });

      const now = new Date();
      const evolution: ScoreDataPoint[] = [];
      let totalAttempts = 0;
      let totalScore = 0;
      let bestScore = 0;
      let worstScore = 100;

      for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = groupedByDay.get(dateStr);

        if (dayData) {
          const dayAverage = dayData.scores.reduce((a, b) => a + b, 0) / dayData.scores.length;
          const daySuccessRate = (dayData.scores.filter(s => s === 100).length / dayData.scores.length) * 100;

          evolution.push({
            date: dateStr,
            score: Math.round(dayAverage),
            attempts: dayData.attempts,
            successRate: Math.round(daySuccessRate),
            averageScore: Math.round(dayAverage)
          });

          totalAttempts += dayData.attempts;
          totalScore += dayAverage * dayData.attempts;
          bestScore = Math.max(bestScore, ...dayData.scores);
          worstScore = Math.min(worstScore, ...dayData.scores);
        } else {
          evolution.push({ date: dateStr, score: 0, attempts: 0, successRate: 0, averageScore: 0 });
        }
      }

      const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;

      setData(evolution);
      setStats({
        totalAttempts,
        averageScore,
        bestScore: bestScore === 0 ? 0 : bestScore,
        worstScore: worstScore === 100 ? 0 : worstScore,
        streak: statsData?.streak || 0,
        bestStreak: statsData?.bestStreak || 0
      });

    } catch (error) {
      console.error('❌ Erreur chargement évolution:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, user?.id]);

  useEffect(() => {
    loadEvolution();
  }, [loadEvolution]);

  const getChartData = useCallback((days: number = 7) => {
    return data.slice(-days).map(d => ({
      date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      score: d.score,
      attempts: d.attempts,
      successRate: d.successRate,
      fullDate: d.date
    }));
  }, [data]);

  const refresh = useCallback(() => {
    loadEvolution();
  }, [loadEvolution]);

  return { data, loading, stats, getChartData, refresh };
}