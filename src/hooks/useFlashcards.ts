import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useFlashcards(courseId: string | undefined, summary: any, outputs: any) {
  const { toast } = useToast();

  const parseMastered = (value: string | null): string[] => {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
    } catch {
      return [];
    }
  };

  const getFlashcards = useCallback(() => {
    const normalizeTags = (tags: unknown): string[] => {
      if (Array.isArray(tags)) return tags.filter(tag => typeof tag === 'string');
      if (typeof tags === 'string') return [tags];
      return [];
    };

    const normalizeFlashcards = (raw: unknown): any[] => {
      let list: unknown = raw;

      if (typeof list === 'string') {
        try {
          list = JSON.parse(list);
        } catch {
          return [];
        }
      }

      if (!Array.isArray(list)) return [];

      return list
        .map((item, index) => {
          if (!item || typeof item !== 'object') return null;
          const record = item as any;
          const question = record.question ?? record.term ?? '';
          const answer = record.answer ?? record.definition ?? '';
          const id = record.id ?? record.term ?? record.question ?? `flashcard-${index}`;
          return {
            ...record,
            id,
            question,
            answer,
            term: record.term ?? question,
            definition: record.definition ?? answer,
            tags: normalizeTags(record.tags),
          };
        })
        .filter((item): item is Record<string, any> => Boolean(item));
    };

    if (summary?.flashcards) return normalizeFlashcards(summary.flashcards);
    if (outputs?.flashcards) return normalizeFlashcards(outputs.flashcards);
    return [];
  }, [summary, outputs]);

  const [flashcards, setFlashcards] = useState<any[]>(getFlashcards());

  useEffect(() => {
    setFlashcards(getFlashcards());
  }, [getFlashcards]);

  useEffect(() => {
    if (!courseId) return;
    
    // Restaurer l'état depuis localStorage
    const masteredKey = `course-${courseId}-mastered-flashcards`;
    const mastered = parseMastered(localStorage.getItem(masteredKey));
    
    if (mastered.length > 0 && flashcards.length > 0) {
      setFlashcards(prev => prev.map(card => ({
        ...card,
        mastered: mastered.includes(card.id || card.term)
      })));
    }
  }, [courseId, flashcards.length]);

  const handleFlashcardMastered = async (flashcardId: string) => {
    if (!courseId) return;
    
    try {
      const masteredKey = `course-${courseId}-mastered-flashcards`;
      const mastered = parseMastered(localStorage.getItem(masteredKey));
      
      if (!mastered.includes(flashcardId)) {
        mastered.push(flashcardId);
        localStorage.setItem(masteredKey, JSON.stringify(mastered));
      }

      // Mise à jour optimiste
      setFlashcards(prev => prev.map(card => 
        (card.id === flashcardId || card.term === flashcardId) 
          ? { ...card, mastered: true } 
          : card
      ));

      toast({
        title: 'Félicitations !',
        description: 'Flashcard marquée comme maîtrisée',
      });
    } catch (err) {
      console.error('Erreur lors du marquage de la flashcard:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer la flashcard',
        variant: 'destructive',
      });
    }
  };

  return {
    flashcards,
    handleFlashcardMastered
  };
}