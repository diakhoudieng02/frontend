// hooks/useRevision.ts - Version corrigée

import { useState, useEffect, useCallback } from 'react';
import { revisionService, MicroSummaryResponse, MethodCardResponse, ClearDiagnosticResponse } from '@/services/revision.service';
import { useToast } from '@/hooks/use-toast';
import type { CourseSubject } from '@/types';

export interface RevisionTask {
  id: string;
  title: string;
  subject: CourseSubject;
  type: 'quiz' | 'review' | 'exercise';
  completed: boolean;
  scheduledDate: string;
  courseId?: string;
}

export interface QuizResult {
  taskId: string;
  score: number;
  total: number;
  completedAt: string;
  courseId?: string;
}

export interface MicroSummary {
  notion: string;
  microSummary: string;
  relatedChunks: Array<{
    chunkId: string;
    content: string;
    pageNumber: number;
    relevanceScore: number;
  }>;
  generatedAt: string;
  fromCache: boolean;
  courseId: string;
}

export interface MethodCard {
  title: string;
  context: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    warning?: string;
    formula?: string;
  }>;
  examples: Array<{
    problem: string;
    solution: string;
    explanation: string;
  }>;
  tips: string[];
  generatedAt: string;
  courseId: string;
}

export interface MicroSummaryHistoryItem {
  id: string;
  notion: string;
  microSummary: string;
  relatedChunks?: Array<{
    chunkId: string;
    content: string;
    pageNumber: number;
    relevanceScore: number;
  }>;
  generatedAt: string;
  fromCache: boolean;
  courseId: string;
  expanded?: boolean;
}

export interface MethodCardHistoryItem {
  id: string;
  title: string;
  context: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    warning?: string;
    formula?: string;
  }>;
  examples: Array<{
    problem: string;
    solution: string;
    explanation: string;
  }>;
  tips: string[];
  generatedAt: string;
  courseId: string;
  passage?: string;
  expanded?: boolean;
}

export interface DiagnosticHistoryItem {
  id: string;
  notion: string;
  isCorrect: boolean;
  progressPercentage: number;
  remainingSkills: string[];
  timestamp: string;
  courseId: string;
}

export function useRevision(courseId?: string) {
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<RevisionTask[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  
  const [searchNotion, setSearchNotion] = useState('');
  const [microSummary, setMicroSummary] = useState<MicroSummary | null>(null);
  const [loadingMicroSummary, setLoadingMicroSummary] = useState(false);
  const [microSummaryHistory, setMicroSummaryHistory] = useState<MicroSummaryHistoryItem[]>([]);
  
  const [methodCard, setMethodCard] = useState<MethodCard | null>(null);
  const [loadingMethod, setLoadingMethod] = useState(false);
  const [passage, setPassage] = useState('');
  const [methodCardHistory, setMethodCardHistory] = useState<MethodCardHistoryItem[]>([]);
  
  // État pour l'historique des diagnostics
  const [diagnosticHistory, setDiagnosticHistory] = useState<DiagnosticHistoryItem[]>([]);
  
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Charger l'historique depuis le localStorage
  useEffect(() => {
    if (courseId) {
      loadHistoryFromStorage();
    }
  }, [courseId]);

  const saveHistoryToStorage = useCallback(() => {
    if (!courseId) return;
    
    try {
      const historyData = {
        microSummaries: microSummaryHistory,
        methodCards: methodCardHistory,
        diagnostics: diagnosticHistory,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(`revision_history_${courseId}`, JSON.stringify(historyData));
      console.log('💾 Historique sauvegardé');
    } catch (error) {
      console.error('❌ Erreur sauvegarde historique:', error);
    }
  }, [courseId, microSummaryHistory, methodCardHistory, diagnosticHistory]);

  const loadHistoryFromStorage = useCallback(() => {
    if (!courseId) return;
    
    try {
      const saved = localStorage.getItem(`revision_history_${courseId}`);
      if (saved) {
        const historyData = JSON.parse(saved);
        
        if (historyData.microSummaries) {
          setMicroSummaryHistory(historyData.microSummaries);
        }
        
        if (historyData.methodCards) {
          setMethodCardHistory(historyData.methodCards);
        }
        
        if (historyData.diagnostics) {
          setDiagnosticHistory(historyData.diagnostics);
        }
        
        console.log('📚 Historique chargé:', historyData);
      }
    } catch (error) {
      console.error('❌ Erreur chargement historique:', error);
    }
  }, [courseId]);

  useEffect(() => {
    saveHistoryToStorage();
  }, [microSummaryHistory, methodCardHistory, diagnosticHistory, saveHistoryToStorage]);

  // Micro-synthèse
// hooks/useRevision.ts - Correction de la ligne 213-249

  // Micro-synthèse
  const handleSearchMicroSummary = async (notion: string) => {
    if (!courseId) {
      toast({
        title: "Course ID requis",
        description: "Cette fonctionnalité nécessite un cours spécifique",
        variant: "destructive"
      });
      return;
    }

    if (!notion.trim()) {
      toast({
        title: "Notion requise",
        description: "Veuillez entrer une notion à rechercher",
        variant: "destructive"
      });
      return;
    }

    setLoadingMicroSummary(true);
    setMicroSummary(null);

    try {
      const response = await revisionService.getMicroSummary(courseId, notion);
      console.log('📦 Réponse micro-summary:', response);
      
      // ✅ CORRECTION: La réponse est directement les données, pas { success, data }
      if (response && response.notion && response.microSummary) {
        const { notion: notionText, microSummary: microData, chunks, fromCache } = response;
        
        const newMicroSummary: MicroSummary = {
          notion: notionText,
          microSummary: microData.microSummary || microData,
          relatedChunks: chunks || [],
          generatedAt: microData.generatedAt || new Date().toISOString(),
          fromCache: fromCache || false,
          courseId
        };

        setMicroSummary(newMicroSummary);
        
        // Ajouter à l'historique
        const historyItem: MicroSummaryHistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          notion: notionText,
          microSummary: newMicroSummary.microSummary,
          relatedChunks: chunks,
          generatedAt: newMicroSummary.generatedAt,
          fromCache: fromCache || false,
          courseId,
          expanded: false
        };
        
        setMicroSummaryHistory(prev => [historyItem, ...prev].slice(0, 20));
        
        toast({
          title: fromCache ? "📚 Depuis le cache" : "✨ Nouvelle synthèse",
          description: `Micro-synthèse pour "${notion}" générée`,
        });
      } else {
        console.error('❌ Structure inattendue:', response);
        throw new Error('Format de réponse invalide');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur micro-synthèse:', error);
      
      let errorMessage = 'Impossible de générer la micro-synthèse';
      if (error.response?.status === 404) {
        errorMessage = 'Cette notion n\'a pas été trouvée dans le cours';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoadingMicroSummary(false);
    }
  };

  // Fiche méthode
  const handleGenerateMethodCard = async () => {
    if (!courseId) {
      toast({
        title: "Course ID requis",
        description: "Cette fonctionnalité nécessite un cours spécifique",
        variant: "destructive"
      });
      return;
    }

    if (!passage.trim() || passage.length < 50) {
      toast({
        title: 'Passage trop court',
        description: 'Veuillez entrer au moins 50 caractères',
        variant: 'destructive',
      });
      return;
    }

    setLoadingMethod(true);
    setMethodCard(null);

    try {
      const response = await revisionService.generateMethodCard(courseId, { passage });
      console.log('📦 Réponse méthode:', response);
      
      // ✅ CORRECTION: La réponse est directement les données
      if (response && response.methodCard) {
        const { methodCard: methodData, processingTime } = response;

        const newMethodCard: MethodCard = {
          title: methodData.title,
          context: methodData.context,
          steps: methodData.steps || [],
          examples: methodData.examples || [],
          tips: methodData.tips || [],
          generatedAt: methodData.generatedAt || new Date().toISOString(),
          courseId
        };

        setMethodCard(newMethodCard);
        
        // Ajouter à l'historique
        const historyItem: MethodCardHistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: newMethodCard.title,
          context: newMethodCard.context,
          steps: newMethodCard.steps,
          examples: newMethodCard.examples,
          tips: newMethodCard.tips,
          generatedAt: newMethodCard.generatedAt,
          courseId,
          passage,
          expanded: false
        };
        
        setMethodCardHistory(prev => [historyItem, ...prev].slice(0, 10));
        
        toast({
          title: '✅ Fiche méthode créée',
          description: `Temps de génération : ${(processingTime / 1000).toFixed(1)}s`,
        });
      } else {
        console.error('❌ Structure inattendue:', response);
        throw new Error('Format de réponse invalide');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur fiche méthode:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de générer la fiche méthode',
        variant: 'destructive',
      });
    } finally {
      setLoadingMethod(false);
    }
  };

   // Diagnostic avec historique
  const handleValidateNotion = async (notion: string, isCorrect: boolean) => {
    if (!courseId) {
      toast({
        title: "Course ID requis",
        description: "Cette fonctionnalité nécessite un cours spécifique",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await revisionService.clearDiagnostic(courseId, {
        notion,
        isCorrect
      });

      console.log('📦 Réponse diagnostic:', response);
      
      // ✅ CORRECTION: La réponse est directement les données
      if (response && response.progressPercentage !== undefined) {
        setFeedback(isCorrect ? 'correct' : 'incorrect');
        
        // Ajouter à l'historique des diagnostics
        const historyItem: DiagnosticHistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          notion,
          isCorrect,
          progressPercentage: response.progressPercentage || 0,
          remainingSkills: response.diagnostic?.remainingSkills || [],
          timestamp: new Date().toISOString(),
          courseId
        };
        
        setDiagnosticHistory(prev => [historyItem, ...prev].slice(0, 30));
        
        const message = isCorrect 
          ? `🎉 "${notion}" est maîtrisé`
          : `📝 "${notion}" est à revoir`;
        
        toast({
          title: isCorrect ? '🎉 Bravo !' : '📝 À revoir',
          description: message,
          variant: isCorrect ? 'default' : 'destructive',
        });

        if (response.progressPercentage !== undefined) {
          console.log(`📊 Progression: ${response.progressPercentage}%`);
        }

        setTimeout(() => setFeedback(null), 3000);
      } else {
        console.error('❌ Structure inattendue:', response);
        throw new Error('Format de réponse invalide');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur diagnostic:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de mettre à jour le diagnostic',
        variant: 'destructive',
      });
    }
  };

  // Copier une micro-synthèse
  const handleCopyMicroSummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: 'Copié !',
      description: 'Micro-synthèse copiée dans le presse-papiers',
    });
  };

  // Télécharger une fiche méthode
  const handleDownloadMethodCard = () => {
    if (!methodCard) return;

    const content = `# ${methodCard.title}
Généré le : ${new Date(methodCard.generatedAt).toLocaleString('fr-FR')}

## Contexte
${methodCard.context}

## Étapes
${methodCard.steps.map(s => 
  `${s.stepNumber}. ${s.title}
   ${s.description}${s.warning ? `\n   ⚠️ ${s.warning}` : ''}${s.formula ? `\n   📐 ${s.formula}` : ''}`
).join('\n\n')}

## Exemples
${methodCard.examples.map(e => 
  `### ${e.problem}
**Solution :** ${e.solution}
**Explication :** ${e.explanation}`
).join('\n\n')}

## Astuces
${methodCard.tips.map(t => `- ${t}`).join('\n')}`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `fiche-methode-${methodCard.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: '✅ Téléchargé',
      description: 'Fiche méthode sauvegardée',
    });
  };

  // Actions pour l'historique
  const loadMicroSummaryFromHistory = useCallback((item: MicroSummaryHistoryItem) => {
    setMicroSummary({
      notion: item.notion,
      microSummary: item.microSummary,
      relatedChunks: item.relatedChunks || [],
      generatedAt: item.generatedAt,
      fromCache: item.fromCache,
      courseId: item.courseId
    });
    
    toast({
      title: "📚 Historique",
      description: `Chargement de "${item.notion}" depuis l'historique`,
    });
  }, []);

  const loadMethodCardFromHistory = useCallback((item: MethodCardHistoryItem) => {
    setMethodCard({
      title: item.title,
      context: item.context,
      steps: item.steps,
      examples: item.examples,
      tips: item.tips,
      generatedAt: item.generatedAt,
      courseId: item.courseId
    });
    
    if (item.passage) {
      setPassage(item.passage);
    }
    
    toast({
      title: "📚 Historique",
      description: `Chargement de "${item.title}" depuis l'historique`,
    });
  }, []);

  const clearHistory = useCallback(() => {
    if (!courseId) return;
    
    setMicroSummaryHistory([]);
    setMethodCardHistory([]);
    setDiagnosticHistory([]);
    localStorage.removeItem(`revision_history_${courseId}`);
    
    toast({
      title: "🗑️ Historique effacé",
      description: "Toutes les révisions ont été supprimées",
    });
  }, [courseId]);

  const removeHistoryItem = useCallback((type: 'micro' | 'method' | 'diagnostic', id: string) => {
    if (type === 'micro') {
      setMicroSummaryHistory(prev => prev.filter(item => item.id !== id));
    } else if (type === 'method') {
      setMethodCardHistory(prev => prev.filter(item => item.id !== id));
    } else {
      setDiagnosticHistory(prev => prev.filter(item => item.id !== id));
    }
    
    toast({
      title: "🗑️ Élément supprimé",
      description: "L'élément a été retiré de l'historique",
    });
  }, []);

  return {
    // États
    tasks,
    results,
    loadingTasks,
    searchNotion,
    setSearchNotion,
    microSummary,
    loadingMicroSummary,
    methodCard,
    loadingMethod,
    passage,
    setPassage,
    copied,
    feedback,
    
    // Historique
    microSummaryHistory,
    methodCardHistory,
    diagnosticHistory,
    
    // Actions principales
    toggleTask: () => {},
    submitQuiz: () => {},
    getProgressBySubject: () => [],
    handleSearchMicroSummary,
    handleGenerateMethodCard,
    handleValidateNotion,
    handleCopyMicroSummary,
    handleDownloadMethodCard,
    
    // Actions historiques
    loadMicroSummaryFromHistory,
    loadMethodCardFromHistory,
    clearHistory,
    removeHistoryItem,
  };
}