import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ThumbsDown, ThumbsUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { MathText } from '@/components/ui/Mathtext';
import { cn } from '@/lib/utils';
import 'katex/dist/katex.min.css';

interface FlashcardCarouselProps {
  flashcards: any[];
  onMastered: (id: string) => void;
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  concept: { label: 'Concept', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  definition: { label: 'Définition', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  application: { label: 'Application', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  memorisation: { label: 'Mémorisation', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  easy: { label: '●', color: 'text-green-400' },
  medium: { label: '●●', color: 'text-yellow-400' },
  hard: { label: '●●●', color: 'text-red-400' },
};

export function FlashcardCarousel({ flashcards, onMastered }: FlashcardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const normalizeTags = (tags: unknown): string[] => {
    if (Array.isArray(tags)) return tags.filter(tag => typeof tag === 'string');
    if (typeof tags === 'string') return [tags];
    return [];
  };

  const normalizedFlashcards = flashcards.map(f => ({
    id: f.id || f.term,
    question: f.question || f.term,
    answer: f.answer || f.definition,
    hint: f.hint || (normalizeTags(f.tags).length ? normalizeTags(f.tags).join(' · ') : undefined),
    mastered: f.mastered || false,
    type: f.type,
    difficulty: f.difficulty,
    tags: normalizeTags(f.tags),
  }));

  useEffect(() => {
    if (normalizedFlashcards.length === 0) return;
    if (currentIndex > normalizedFlashcards.length - 1) {
      setCurrentIndex(normalizedFlashcards.length - 1);
    }
  }, [currentIndex, normalizedFlashcards.length]);

  if (normalizedFlashcards.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-xs text-muted-foreground">Aucune flashcard disponible</p>
      </div>
    );
  }

  const currentCard = normalizedFlashcards[currentIndex];
  const progressPercent = ((currentIndex + 1) / normalizedFlashcards.length) * 100;
  const isKnown = knownCards.has(currentCard?.id) || currentCard?.mastered;

  const typeConfig = currentCard?.type ? TYPE_CONFIG[currentCard.type] : null;
  const diffConfig = currentCard?.difficulty ? DIFFICULTY_CONFIG[currentCard.difficulty] : null;

  const goTo = (index: number, dir: 'next' | 'prev') => {
    setFlipped(false);
    setDirection(dir);
    // Petit délai pour laisser le flip se réinitialiser avant le changement de carte
    setTimeout(() => setCurrentIndex(index), 120);
  };

  const handleNext = () => goTo((currentIndex + 1) % normalizedFlashcards.length, 'next');
  const handlePrev = () => goTo((currentIndex - 1 + normalizedFlashcards.length) % normalizedFlashcards.length, 'prev');

  const handleKnown = () => {
    if (!currentCard) return;
    if (!isKnown) {
      setKnownCards(prev => new Set(prev).add(currentCard.id));
      onMastered(currentCard.id);
    }
    handleNext();
  };

  const handleReset = () => {
    setKnownCards(new Set());
    setCurrentIndex(0);
    setFlipped(false);
  };

  return (
    <div className="space-y-3">
      {/* ── Stats + progression ────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">{currentIndex + 1} / {normalizedFlashcards.length}</span>
          <div className="flex items-center gap-2">
            {knownCards.size > 0 && (
              <span className="text-green-400 font-medium">{knownCards.size} maîtrisées</span>
            )}
            {knownCards.size === normalizedFlashcards.length && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                Recommencer
              </button>
            )}
          </div>
        </div>
        {/* Barre de progression */}
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* ── Carte ─────────────────────────────────────────────── */}
      <div
        className="relative w-full h-[320px] cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={() => setFlipped(!flipped)}
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Face recto — Question */}
          <div
            className="absolute inset-0 w-full h-full rounded-xl border border-border/50 bg-card shadow-lg
              bg-gradient-to-br from-primary/8 to-transparent flex flex-col p-4"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              willChange: 'transform',
              transform: 'translateZ(0)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Question
                </span>
                {typeConfig && (
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', typeConfig.color)}>
                    {typeConfig.label}
                  </span>
                )}
              </div>
              {diffConfig && (
                <span className={cn('text-[10px] font-mono font-bold tracking-widest', diffConfig.color)}
                  title={currentCard.difficulty}>
                  {diffConfig.label}
                </span>
              )}
            </div>

            {/* Texte question */}
            <div className="flex-1 flex items-center justify-center text-center">
              <div className="text-sm font-medium leading-relaxed">
                <MathText text={currentCard.question} />
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center mt-3 flex-shrink-0">
              Cliquer pour voir la réponse
            </p>
          </div>

          {/* Face verso — Réponse */}
          <div
            className="absolute inset-0 w-full h-full rounded-xl border border-border/50 bg-card shadow-lg
              bg-gradient-to-br from-accent/8 to-transparent flex flex-col p-4"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(0)',
              willChange: 'transform',
            }}
          >
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <span className="text-[10px] font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                Réponse
              </span>
              {currentCard.hint && (
                <span className="text-[10px] text-muted-foreground italic truncate max-w-[60%]">
                  💡 {currentCard.hint}
                </span>
              )}
            </div>

            {/* Réponse Markdown+KaTeX */}
            <div className="flex-1 overflow-y-auto text-left">
              <div className="prose prose-sm dark:prose-invert max-w-none
                [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_strong]:text-foreground
                [&_.katex]:text-primary text-sm leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {currentCard.answer}
                </ReactMarkdown>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center mt-3 flex-shrink-0">
              Cliquer pour revenir à la question
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Contrôles ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          className="rounded-full h-8 w-8 flex-shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 flex-1 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="rounded-full gap-1.5 h-8 px-3 text-xs"
          >
            <ThumbsDown className="h-3 w-3" />
            <span>À revoir</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleKnown}
            disabled={isKnown}
            className={cn(
              'rounded-full gap-1.5 h-8 px-3 text-xs transition-all',
              isKnown
                ? 'bg-green-500/20 text-green-400 border-green-500/30 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90',
            )}
          >
            <ThumbsUp className="h-3 w-3" />
            <span>{isKnown ? 'Maîtrisée ✓' : 'Je connais'}</span>
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="rounded-full h-8 w-8 flex-shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}