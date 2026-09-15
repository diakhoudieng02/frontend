// src/hooks/useMethodCard.ts
import { useState } from 'react';
import { revisionService } from '@/services/revision.service';
import { useToast } from '@/hooks/use-toast';

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
}

export function useMethodCard(courseId: string) {
  const [methodCard, setMethodCard] = useState<MethodCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [passage, setPassage] = useState('');
  const { toast } = useToast();

  const generateMethodCard = async () => {
    if (!passage.trim() || passage.length < 50) {
      toast({
        title: 'Passage trop court',
        description: 'Veuillez entrer au moins 50 caractères',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setMethodCard(null);

    try {
      const response = await revisionService.generateMethodCard(courseId, { passage });
      console.log('✅ Fiche méthode reçue:', response);
      
      if (response.success && response.data) {
        setMethodCard(response.data.methodCard);
        toast({
          title: '✅ Fiche méthode créée',
          description: `Temps de génération : ${(response.data.processingTime / 1000).toFixed(1)}s`,
        });
      }
    } catch (err: any) {
      console.error('❌ Erreur génération fiche méthode:', err);
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Impossible de générer la fiche méthode',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadMethodCard = () => {
    if (!methodCard) return;

    const content = `# ${methodCard.title}\n\n## Contexte\n${methodCard.context}\n\n## Étapes\n${
      methodCard.steps.map(s => 
        `${s.stepNumber}. ${s.title}\n   ${s.description}${s.warning ? `\n   ⚠️ ${s.warning}` : ''}${s.formula ? `\n   📐 ${s.formula}` : ''}`
      ).join('\n\n')
    }\n\n## Exemples\n${
      methodCard.examples.map(e => 
        `### ${e.problem}\n**Solution :** ${e.solution}\n**Explication :** ${e.explanation}`
      ).join('\n\n')
    }\n\n## Astuces\n${
      methodCard.tips.map(t => `- ${t}`).join('\n')
    }`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fiche-methode-${methodCard.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    methodCard,
    loading,
    passage,
    setPassage,
    generateMethodCard,
    downloadMethodCard
  };
}