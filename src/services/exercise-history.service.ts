// services/exercise-history.service.ts
import type { ApiExercise } from '@/services/exercises.service';

export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  courseId: string;
  userId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  difficultyLevel: 1 | 2 | 3;
  conceptTag: string;
  createdAt: string;
}

export interface ExerciseStats {
  totalAttempts: number;
  correctAttempts: number;
  successRate: number;
  streak: number;
  bestStreak: number;
  byDifficulty: {
    bronze: { total: number; correct: number; successRate: number };
    silver: { total: number; correct: number; successRate: number };
    gold: { total: number; correct: number; successRate: number };
  };
  byConcept: Record<string, { total: number; correct: number; successRate: number }>;
  lastAttempts: ExerciseAttempt[];
}

class ExerciseHistoryService {
  private storageKey = 'exercise-history';
  private exercisesCacheKey = 'exercises-cache';
  private statsCache: Map<string, ExerciseStats> = new Map();
  private currentUserId: string | null = null;

  // ============================================================
  // GESTION DE L'UTILISATEUR COURANT
  // ============================================================

  /**
   * Définir l'utilisateur courant
   */
  // Dans exercise-history.service.ts

setCurrentUser(userId: string | null): void {
  this.currentUserId = userId;
  console.log(`👤 Utilisateur courant défini: ${userId || 'aucun'}`);

  // ✅ Migrer les anciennes tentatives "current-user" vers le vrai userId
  if (userId) {
    this.migrateLegacyAttempts(userId);
  }
}

/**
 * Migre les tentatives sauvegardées avec l'ancien userId "current-user"
 * vers le vrai userId de l'utilisateur connecté
 */
private migrateLegacyAttempts(realUserId: string): void {
  try {
    const allHistory = this.getAllHistory();
    const legacyAttempts = allHistory.filter(a => a.userId === 'current-user');

    if (legacyAttempts.length === 0) return;

    console.log(`🔄 Migration de ${legacyAttempts.length} tentatives vers userId: ${realUserId}`);

    const migrated = allHistory.map(a =>
      a.userId === 'current-user' ? { ...a, userId: realUserId } : a
    );

    localStorage.setItem(this.storageKey, JSON.stringify(migrated));
    this.statsCache.clear(); // Invalider le cache des stats

    console.log(`✅ Migration terminée`);
  } catch (error) {
    console.error('❌ Erreur migration tentatives:', error);
  }
}

  /**
   * Obtenir l'utilisateur courant
   */
  getCurrentUser(): string | null {
    return this.currentUserId;
  }

  // ============================================================
  // CACHE DES EXERCICES
  // ============================================================

  /**
   * Sauvegarder les exercices d'un cours en local
   */
  saveExercises(courseId: string, exercises: ApiExercise[]): void {
    try {
      const allCached = this.getAllCachedExercises();
      allCached[courseId] = {
        exercises,
        cachedAt: new Date().toISOString(),
      };
      localStorage.setItem(this.exercisesCacheKey, JSON.stringify(allCached));
      console.log(`✅ ${exercises.length} exercices mis en cache pour le cours ${courseId}`);
    } catch (error) {
      console.error('❌ Erreur sauvegarde exercices en cache:', error);
    }
  }

  /**
   * Récupérer les exercices d'un cours depuis le cache local
   */
  getCachedExercises(courseId: string, maxAgeHours: number = 24): ApiExercise[] | null {
    try {
      const allCached = this.getAllCachedExercises();
      const entry = allCached[courseId];

      if (!entry) return null;

      const cachedAt = new Date(entry.cachedAt).getTime();
      const ageHours = (Date.now() - cachedAt) / (1000 * 60 * 60);

      if (ageHours > maxAgeHours) {
        console.log(`⏰ Cache expiré pour le cours ${courseId} (${ageHours.toFixed(1)}h)`);
        return null;
      }

      console.log(`📦 ${entry.exercises.length} exercices chargés depuis le cache local`);
      return entry.exercises;
    } catch (error) {
      console.error('❌ Erreur lecture cache exercices:', error);
      return null;
    }
  }

  /**
   * Vérifier si des exercices sont en cache pour un cours
   */
  hasExercisesInCache(courseId: string): boolean {
    return this.getCachedExercises(courseId) !== null;
  }

  /**
   * Invalider le cache des exercices pour un cours
   */
  invalidateExercisesCache(courseId: string): void {
    try {
      const allCached = this.getAllCachedExercises();
      delete allCached[courseId];
      localStorage.setItem(this.exercisesCacheKey, JSON.stringify(allCached));
      console.log(`🗑️ Cache exercices invalidé pour le cours ${courseId}`);
    } catch (error) {
      console.error('❌ Erreur invalidation cache:', error);
    }
  }

  /**
   * Récupérer toutes les entrées du cache
   */
  private getAllCachedExercises(): Record<string, { exercises: ApiExercise[]; cachedAt: string }> {
    try {
      const stored = localStorage.getItem(this.exercisesCacheKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ Erreur lecture cache global:', error);
      return {};
    }
  }

  // ============================================================
  // SAUVEGARDE LOCALE AVEC FILTRAGE PAR UTILISATEUR
  // ============================================================

  /**
   * Récupérer l'historique complet (tous utilisateurs)
   */
  getAllHistory(): ExerciseAttempt[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      console.log('🔍 Lecture localStorage avec clé:', this.storageKey);
      console.log('📦 Données brutes:', stored ? stored.substring(0, 200) + '...' : 'null');
      
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      console.log('✅ Tentatives trouvées (total):', parsed.length);
      return parsed;
    } catch (error) {
      console.error('❌ Erreur lecture historique global:', error);
      return [];
    }
  }

  /**
   * Récupérer l'historique local filtré par utilisateur courant
   */
  private getLocalHistory(): ExerciseAttempt[] {
    try {
      const allHistory = this.getAllHistory();
      
      // Filtrer par utilisateur si un ID est défini
      if (this.currentUserId) {
        const filtered = allHistory.filter(a => a.userId === this.currentUserId);
        console.log(`👤 Historique pour utilisateur ${this.currentUserId}: ${filtered.length} tentatives`);
        return filtered;
      }
      
      console.log('⚠️ Aucun utilisateur défini, retour de tout l\'historique');
      return allHistory;
    } catch (error) {
      console.error('❌ Erreur lecture historique:', error);
      return [];
    }
  }

  /**
   * Sauvegarder une tentative d'exercice
   */
  async saveAttempt(attempt: Omit<ExerciseAttempt, 'id' | 'createdAt'>): Promise<ExerciseAttempt> {
    // S'assurer que l'utilisateur est défini
    if (!attempt.userId && this.currentUserId) {
      attempt.userId = this.currentUserId;
    }
    
    if (!attempt.userId) {
      throw new Error('Impossible de sauvegarder une tentative sans userId');
    }
    
    return this.saveAttemptLocally(attempt);
  }

  private saveAttemptLocally(attempt: Omit<ExerciseAttempt, 'id' | 'createdAt'>): ExerciseAttempt {
    const allHistory = this.getAllHistory();
    
    const newAttempt: ExerciseAttempt = {
      ...attempt,
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    allHistory.push(newAttempt);
    localStorage.setItem(this.storageKey, JSON.stringify(allHistory));
    
    // Invalider le cache des stats
    this.statsCache.delete(attempt.courseId);
    
    console.log('✅ Nouvelle tentative sauvegardée pour utilisateur:', attempt.userId);
    return newAttempt;
  }

  /**
   * Récupérer l'historique pour un cours (filtré par utilisateur)
   */
  async getHistory(courseId: string): Promise<ExerciseAttempt[]> {
    console.log(`📦 Chargement historique local pour cours: ${courseId}`);
    const history = this.getLocalHistory();
    return history.filter(a => a.courseId === courseId);
  }

  // ============================================================
  // STATISTIQUES (calculées localement avec filtre utilisateur)
  // ============================================================

  /**
   * Calculer les statistiques pour un cours
   */
  async getStats(courseId: string): Promise<ExerciseStats> {
    const cacheKey = `${courseId}-${this.currentUserId || 'all'}`;
    
    if (this.statsCache.has(cacheKey)) {
      return this.statsCache.get(cacheKey)!;
    }

    console.log(`📊 Calcul statistiques locales pour cours: ${courseId}, utilisateur: ${this.currentUserId || 'tous'}`);
    const stats = this.calculateLocalStats(courseId);
    this.statsCache.set(cacheKey, stats);
    return stats;
  }

  /**
   * Calculer les statistiques localement
   */
  private calculateLocalStats(courseId: string): ExerciseStats {
    const history = this.getLocalHistory().filter(a => a.courseId === courseId);
    
    const totalAttempts = history.length;
    const correctAttempts = history.filter(a => a.isCorrect).length;
    const successRate = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    let currentStreak = 0;
    let bestStreak = 0;
    
    const sorted = [...history].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    for (const attempt of sorted) {
      if (attempt.isCorrect) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        break;
      }
    }

    const byDifficulty = {
      bronze: { total: 0, correct: 0, successRate: 0 },
      silver: { total: 0, correct: 0, successRate: 0 },
      gold: { total: 0, correct: 0, successRate: 0 }
    };

    history.forEach(a => {
      const diff = a.difficultyLevel === 1 ? 'bronze' : a.difficultyLevel === 2 ? 'silver' : 'gold';
      byDifficulty[diff].total++;
      if (a.isCorrect) byDifficulty[diff].correct++;
    });

    Object.keys(byDifficulty).forEach(key => {
      const diff = byDifficulty[key as keyof typeof byDifficulty];
      diff.successRate = diff.total > 0 ? (diff.correct / diff.total) * 100 : 0;
    });

    const byConcept: Record<string, { total: number; correct: number; successRate: number }> = {};
    history.forEach(a => {
      if (!byConcept[a.conceptTag]) {
        byConcept[a.conceptTag] = { total: 0, correct: 0, successRate: 0 };
      }
      byConcept[a.conceptTag].total++;
      if (a.isCorrect) byConcept[a.conceptTag].correct++;
    });

    Object.keys(byConcept).forEach(concept => {
      const data = byConcept[concept];
      data.successRate = data.total > 0 ? (data.correct / data.total) * 100 : 0;
    });

    return {
      totalAttempts,
      correctAttempts,
      successRate,
      streak: currentStreak,
      bestStreak,
      byDifficulty,
      byConcept,
      lastAttempts: sorted.slice(0, 10)
    };
  }

  // ============================================================
  // GESTION DES EXERCICES MAÎTRISÉS
  // ============================================================

  async markAsMastered(exerciseId: string, courseId: string): Promise<void> {
    if (!this.currentUserId) {
      console.warn('⚠️ Impossible de marquer comme maîtrisé sans utilisateur');
      return;
    }
    
    console.log('⭐ Sauvegarde locale maîtrise');
    const masteredKey = `mastered-${courseId}-${this.currentUserId}`;
    try {
      const mastered = JSON.parse(localStorage.getItem(masteredKey) || '[]');
      if (!mastered.includes(exerciseId)) {
        mastered.push(exerciseId);
        localStorage.setItem(masteredKey, JSON.stringify(mastered));
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde maîtrise:', error);
    }
  }

  isMastered(exerciseId: string, courseId: string): boolean {
    if (!this.currentUserId) return false;
    
    try {
      const masteredKey = `mastered-${courseId}-${this.currentUserId}`;
      const mastered = JSON.parse(localStorage.getItem(masteredKey) || '[]');
      return mastered.includes(exerciseId);
    } catch (error) {
      console.error('❌ Erreur lecture maîtrise:', error);
      return false;
    }
  }

  getMasteredExercises(courseId: string): string[] {
    if (!this.currentUserId) return [];
    
    try {
      const masteredKey = `mastered-${courseId}-${this.currentUserId}`;
      return JSON.parse(localStorage.getItem(masteredKey) || '[]');
    } catch (error) {
      console.error('❌ Erreur lecture exercices maîtrisés:', error);
      return [];
    }
  }

  // ============================================================
  // RÉINITIALISATION
  // ============================================================

  async resetHistory(courseId: string): Promise<void> {
    console.log('🗑️ Suppression historique local pour cours:', courseId);
    try {
      const allHistory = this.getAllHistory();
      const filtered = allHistory.filter(a => 
        !(a.courseId === courseId && a.userId === this.currentUserId)
      );
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      this.statsCache.delete(`${courseId}-${this.currentUserId || 'all'}`);
    } catch (error) {
      console.error('❌ Erreur reset historique:', error);
    }
  }

  async resetAllHistory(): Promise<void> {
    console.log('🗑️ Suppression de tout l\'historique');
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.exercisesCacheKey);
      this.statsCache.clear();
    } catch (error) {
      console.error('❌ Erreur reset tout historique:', error);
    }
  }

  async resetUserHistory(): Promise<void> {
    if (!this.currentUserId) return;
    
    console.log(`🗑️ Suppression historique pour utilisateur: ${this.currentUserId}`);
    try {
      const allHistory = this.getAllHistory();
      const filtered = allHistory.filter(a => a.userId !== this.currentUserId);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      this.statsCache.clear();
    } catch (error) {
      console.error('❌ Erreur reset historique utilisateur:', error);
    }
  }

  // ============================================================
  // ANALYSE
  // ============================================================

  getWeakestConcepts(courseId: string, limit: number = 3): Array<{ concept: string; successRate: number }> {
    const cacheKey = `${courseId}-${this.currentUserId || 'all'}`;
    const stats = this.statsCache.get(cacheKey);
    if (!stats) return [];

    return Object.entries(stats.byConcept)
      .map(([concept, data]) => ({ concept, successRate: data.successRate }))
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, limit);
  }

  getStrongestConcepts(courseId: string, limit: number = 3): Array<{ concept: string; successRate: number }> {
    const cacheKey = `${courseId}-${this.currentUserId || 'all'}`;
    const stats = this.statsCache.get(cacheKey);
    if (!stats) return [];

    return Object.entries(stats.byConcept)
      .map(([concept, data]) => ({ concept, successRate: data.successRate }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, limit);
  }

  getExercisesToReview(courseId: string, limit: number = 5): ExerciseAttempt[] {
    const history = this.getLocalHistory().filter(a => a.courseId === courseId);
    const mastered = this.getMasteredExercises(courseId);
    
    const toReview = history.filter(a => !mastered.includes(a.exerciseId));
    
    return toReview
      .sort((a, b) => {
        const aFailRate = this.getFailRate(a.exerciseId, courseId);
        const bFailRate = this.getFailRate(b.exerciseId, courseId);
        return bFailRate - aFailRate;
      })
      .slice(0, limit);
  }

  private getFailRate(exerciseId: string, courseId: string): number {
    const history = this.getLocalHistory().filter(
      a => a.courseId === courseId && a.exerciseId === exerciseId
    );
    
    if (history.length === 0) return 0;
    
    const incorrect = history.filter(a => !a.isCorrect).length;
    return (incorrect / history.length) * 100;
  }
}

export const exerciseHistoryService = new ExerciseHistoryService();