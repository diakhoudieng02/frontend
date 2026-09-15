import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Flashcard } from '@/components/course/Flashcard';
import { cn } from '@/lib/utils';

interface FlashcardsTabProps {
  flashcards: any[];
  courseStatus: 'processing' | 'ready' | 'error';
  hasSummary: boolean;
  onGenerateSummary: () => void;
  generating: boolean;
  onFlashcardMastered: (id: string) => void;
}

const TYPE_FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'concept', label: 'Concepts' },
  { value: 'definition', label: 'Définitions' },
  { value: 'application', label: 'Applications' },
  { value: 'memorisation', label: 'Mémorisation' },
];

const DIFFICULTY_FILTERS = [
  { value: '', label: 'Toutes' },
  { value: 'easy', label: 'Facile' },
  { value: 'medium', label: 'Moyen' },
  { value: 'hard', label: 'Difficile' },
];

export function FlashcardsTab({
  flashcards,
  courseStatus,
  hasSummary,
  onGenerateSummary,
  generating,
  onFlashcardMastered
}: FlashcardsTabProps) {
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  const normalizeTags = (tags: unknown): string[] => {
    if (Array.isArray(tags)) return tags.filter(tag => typeof tag === 'string');
    if (typeof tags === 'string') return [tags];
    return [];
  };

  if (flashcards.length === 0) {
    return (
      <div className="glass-card p-8 sm:p-12 text-center">
        <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display font-semibold text-base sm:text-lg mb-2">
          Flashcards non disponibles
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
          {courseStatus === 'processing'
            ? 'Le traitement de votre cours est en cours. Les flashcards seront bientôt disponibles.'
            : hasSummary
              ? "Aucune flashcard n'a été générée pour ce cours."
              : "Générez d'abord un résumé pour créer des flashcards personnalisées."}
        </p>
        {!hasSummary && courseStatus !== 'processing' && (
          <Button
            onClick={onGenerateSummary}
            disabled={generating}
            variant="outline"
            className="mt-4 text-xs sm:text-sm h-9 sm:h-10"
          >
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Générer le résumé
          </Button>
        )}
      </div>
    );
  }

  // Filtrage
  const filtered = flashcards.filter(fc => {
    const matchType = !typeFilter || fc.type === typeFilter;
    const matchDiff = !difficultyFilter || fc.difficulty === difficultyFilter;
    return matchType && matchDiff;
  });

  const masteredCount = flashcards.filter(fc => fc.mastered).length;

  return (
    <div className="space-y-4">
      {/* ── Header stats + filtres ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Stats */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <LayoutGrid className="h-3.5 w-3.5" />
          <span>{flashcards.length} flashcards</span>
          {masteredCount > 0 && (
            <span className="text-green-400 font-medium">· {masteredCount} maîtrisées</span>
          )}
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
          <SlidersHorizontal className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-full border transition-all',
                typeFilter === f.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border',
              )}
            >
              {f.label}
            </button>
          ))}
          <span className="text-border/50">|</span>
          {DIFFICULTY_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setDifficultyFilter(f.value)}
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-full border transition-all',
                difficultyFilter === f.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grille ─────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          Aucune flashcard ne correspond aux filtres sélectionnés.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((flashcard, index) => (
            <motion.div
              key={flashcard.id || `flashcard-${index}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
            >
              <Flashcard
                id={flashcard.id}
                question={flashcard.question || flashcard.term}
                answer={flashcard.answer || flashcard.definition}
                hint={flashcard.hint || (normalizeTags(flashcard.tags).length ? normalizeTags(flashcard.tags).join(', ') : undefined)}
                mastered={flashcard.mastered}
                type={flashcard.type}
                difficulty={flashcard.difficulty}
                onMastered={onFlashcardMastered}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}