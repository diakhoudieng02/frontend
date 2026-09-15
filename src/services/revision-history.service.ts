// services/revision-history.service.ts
import type { MicroSummaryHistoryItem, MethodCardHistoryItem, DiagnosticHistoryItem } from '@/hooks/useRevision';

class RevisionHistoryService {
  // Récupérer l'historique de TOUS les cours
  getAllHistory(): {
    microSummaries: MicroSummaryHistoryItem[];
    methodCards: MethodCardHistoryItem[];
    diagnostics: DiagnosticHistoryItem[];
  } {
    const allMicroSummaries: MicroSummaryHistoryItem[] = [];
    const allMethodCards: MethodCardHistoryItem[] = [];
    const allDiagnostics: DiagnosticHistoryItem[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('revision_history_')) {
        try {
          const saved = localStorage.getItem(key);
          if (saved) {
            const historyData = JSON.parse(saved);
            
            if (historyData.microSummaries) {
              allMicroSummaries.push(...historyData.microSummaries);
            }
            if (historyData.methodCards) {
              allMethodCards.push(...historyData.methodCards);
            }
            if (historyData.diagnostics) {
              allDiagnostics.push(...historyData.diagnostics);
            }
          }
        } catch (e) {
          console.error(`❌ Erreur parsing ${key}:`, e);
        }
      }
    }
    
    // Trier par date (plus récent d'abord)
    const sortByDate = (a: any, b: any) => {
      const dateA = new Date(a.generatedAt || a.timestamp).getTime();
      const dateB = new Date(b.generatedAt || b.timestamp).getTime();
      return dateB - dateA;
    };
    
    return {
      microSummaries: allMicroSummaries.sort(sortByDate),
      methodCards: allMethodCards.sort(sortByDate),
      diagnostics: allDiagnostics.sort(sortByDate)
    };
  }

  // Vérifier si un cours a des révisions
  hasRevisions(courseId: string): boolean {
    const history = this.getAllHistory();
    return history.microSummaries.some(m => m.courseId === courseId) ||
           history.methodCards.some(m => m.courseId === courseId);
  }

  // Obtenir les statistiques pour un cours
  getCourseStats(courseId: string) {
    const history = this.getAllHistory();
    const micros = history.microSummaries.filter(m => m.courseId === courseId);
    const methods = history.methodCards.filter(m => m.courseId === courseId);
    
    return {
      hasRevisions: micros.length > 0 || methods.length > 0,
      microCount: micros.length,
      methodCount: methods.length,
      totalCount: micros.length + methods.length,
      lastRevision: [...micros, ...methods]
        .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0]?.generatedAt
    };
  }

  // Obtenir les statistiques pour TOUS les cours
  getAllCoursesStats(courseIds: string[]) {
    const history = this.getAllHistory();
    const stats: Record<string, {
      hasRevisions: boolean;
      microCount: number;
      methodCount: number;
      totalCount: number;
    }> = {};
    
    courseIds.forEach(courseId => {
      const micros = history.microSummaries.filter(m => m.courseId === courseId);
      const methods = history.methodCards.filter(m => m.courseId === courseId);
      
      stats[courseId] = {
        hasRevisions: micros.length > 0 || methods.length > 0,
        microCount: micros.length,
        methodCount: methods.length,
        totalCount: micros.length + methods.length
      };
    });
    
    return stats;
  }

  // Debug: Afficher tout l'historique
  debug() {
    const history = this.getAllHistory();
    console.log('📊 RÉVISION HISTORY SERVICE DEBUG:');
    console.log('- Micro-synthèses:', history.microSummaries.length);
    console.log('- Fiches méthode:', history.methodCards.length);
    console.log('- Diagnostics:', history.diagnostics.length);
    console.log('Détail micro:', history.microSummaries.map(m => ({
      id: m.id,
      courseId: m.courseId,
      notion: m.notion
    })));
    console.log('Détail method:', history.methodCards.map(m => ({
      id: m.id,
      courseId: m.courseId,
      title: m.title
    })));
    return history;
  }
}

export const revisionHistoryService = new RevisionHistoryService();