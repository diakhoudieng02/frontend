// hooks/useExercises.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { ApiExercise } from '@/types/exercises.types';

// Définir l'interface ApiResponse localement
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: {
    exercises?: T;
    exercisesByDifficulty?: {
      easy: number;
      medium: number;
      hard: number;
    };
    exercisesGenerated?: number;
    fromCache?: boolean;
    [key: string]: any;
  };
}

export interface ExerciseStats {
  correct: number;
  total: number;
  streak: number;
}

export function useExercises(courseId: string) {
  const { toast } = useToast();
  
  const [exercises, setExercises] = useState<ApiExercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<ApiExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ExerciseStats>({ correct: 0, total: 0, streak: 0 });

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      // ✅ Typer la réponse avec ApiResponse
      const response = await api.get<ApiResponse<ApiExercise[]>>(`/exercises/${courseId}`);
      
      console.log('📦 Réponse API exercises:', response);
      
      let exercisesData: ApiExercise[] = [];
      
      // ✅ Structure correcte: response.data.data.exercises
      if (response?.data?.data?.exercises && Array.isArray(response.data.data.exercises)) {
        exercisesData = response.data.data.exercises;
        console.log('✅ Exercices trouvés:', exercisesData.length);
      }
      
      setExercises(exercisesData);
      
      if (exercisesData.length === 0) {
        toast({
          title: "Aucun exercice",
          description: "Génération automatique d'exercices...",
        });
        generateExercises();
      }
    } catch (err: any) {
      console.error('❌ Error fetching exercises:', err);
      if (err.status === 404) {
        generateExercises();
      } else {
        setError("Erreur lors du chargement des exercices");
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, toast]);

  const generateExercises = async () => {
    try {
      setGenerating(true);
      // ✅ Typer la réponse de génération
      const response = await api.post<ApiResponse<ApiExercise[]>>(`/exercises/${courseId}/generate`, {
        force: false,
        targetCount: 12,
        language: 'fr'
      });
      
      console.log('📦 Réponse génération:', response);
      
      let exercisesData: ApiExercise[] = [];
      
      // ✅ Même structure pour la génération
      if (response?.data?.data?.exercises && Array.isArray(response.data.data.exercises)) {
        exercisesData = response.data.data.exercises;
        console.log('✅ Exercices générés:', exercisesData.length);
      }
      
      if (exercisesData.length > 0) {
        setExercises(exercisesData);
        
        toast({
          title: "✅ Exercices générés !",
          description: `${exercisesData.length} exercices disponibles`,
        });
      }
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

  const updateStats = (isCorrect: boolean) => {
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0
    }));
  };

  const resetStats = () => {
    setStats({ correct: 0, total: 0, streak: 0 });
  };

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return {
    exercises,
    filteredExercises,
    setFilteredExercises,
    loading,
    generating,
    error,
    stats,
    updateStats,
    resetStats,
    refreshExercises: fetchExercises
  };
}