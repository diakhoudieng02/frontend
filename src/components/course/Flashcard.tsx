// components/flashcards/Flashcard.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle, HelpCircle, RotateCw } from 'lucide-react';
import { MathText } from '@/components/ui/Mathtext';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface FlashcardProps {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  mastered?: boolean;
  type?: 'concept' | 'definition' | 'application' | 'memorisation';
  difficulty?: 'easy' | 'medium' | 'hard';
  onMastered?: (id: string) => void;
}

const TYPE_CONFIG = {
  concept: { label: 'Concept', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  definition: { label: 'Définition', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  application: { label: 'Application', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  memorisation: { label: 'Mémorisation', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

const DIFFICULTY_CONFIG = {
  easy: { label: 'Facile', color: 'bg-green-500/10 text-green-400' },
  medium: { label: 'Moyen', color: 'bg-yellow-500/10 text-yellow-400' },
  hard: { label: 'Difficile', color: 'bg-red-500/10 text-red-400' },
};

export function Flashcard({
  id,
  question,
  answer,
  hint,
  mastered = false,
  type,
  difficulty,
  onMastered,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const typeConfig = type ? TYPE_CONFIG[type] : null;
  const diffConfig = difficulty ? DIFFICULTY_CONFIG[difficulty] : null;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowHint(false);
  };

  const handleMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMastered?.(id);
  };

  const handleHintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHint(!showHint);
  };

  return (
    <div className="relative w-full" style={{ perspective: '1000px' }}>
      <motion.div
        className="relative w-full cursor-pointer"
        style={{ transformStyle: 'preserve-3d', height: 200 }}
        onClick={handleFlip}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* ── Front : Question ─────────────────────────────────────────── */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full rounded-2xl flex flex-col p-4',
            'bg-card border border-border/50 shadow-lg',
            'bg-gradient-to-br from-primary/5 to-transparent',
            mastered && 'border-green-500/30 bg-green-500/5',
          )}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3 flex-shrink-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Question
              </span>
              {typeConfig && (
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', typeConfig.color)}>
                  {typeConfig.label}
                </span>
              )}
              {diffConfig && (
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', diffConfig.color)}>
                  {diffConfig.label}
                </span>
              )}
            </div>
            <button
              onClick={handleMastered}
              className={cn(
                'flex-shrink-0 p-1 rounded-full transition-all',
                mastered
                  ? 'text-green-500 bg-green-500/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
              title={mastered ? 'Déjà maîtrisée' : 'Marquer comme maîtrisée'}
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          </div>

          {/* Question text */}
          <div className="flex-1 flex items-center justify-center text-center px-1">
            <div className="text-sm font-medium leading-relaxed text-foreground">
              <MathText text={question} />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 text-[10px] text-muted-foreground flex items-center justify-between flex-shrink-0">
            <span>Cliquer pour voir la réponse</span>
            <RotateCw className="h-3 w-3 animate-pulse" />
          </div>
        </div>

        {/* ── Back : Réponse ────────────────────────────────────────────── */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full rounded-2xl flex flex-col p-4',
            'bg-card border border-border/50 shadow-lg',
            'bg-gradient-to-br from-accent/5 to-transparent',
          )}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(0)',
            willChange: 'transform',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <span className="text-[10px] font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
              Réponse
            </span>
            {hint && (
              <button
                onClick={handleHintClick}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Voir un indice"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Answer — ReactMarkdown + KaTeX */}
          <div className="flex-1 overflow-y-auto pr-1 text-left">
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed
              [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_strong]:text-foreground
              [&_.katex]:text-primary">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {answer}
              </ReactMarkdown>
            </div>
          </div>

          {/* Indice */}
          <AnimatePresence>
            {showHint && hint && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="mt-2 p-2 bg-muted rounded-xl text-[10px] text-muted-foreground border border-primary/10 flex-shrink-0"
              >
                <span className="font-semibold text-primary">💡 Indice :</span>{' '}
                <MathText text={hint} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-3 text-[10px] text-muted-foreground flex items-center justify-between flex-shrink-0">
            <span>Cliquer pour revenir à la question</span>
            <RotateCw className="h-3 w-3" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Version compacte pour les listes
export function FlashcardCompact({
  question,
  answer,
  mastered,
}: {
  question: string;
  answer: string;
  mastered?: boolean;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all cursor-pointer',
        isFlipped ? 'bg-primary/5 border-primary' : 'bg-muted/30 border-transparent',
        mastered && 'border-green-500/30',
      )}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">
          {isFlipped ? 'Réponse' : 'Question'}
        </span>
        {mastered && <CheckCircle className="h-4 w-4 text-green-500" />}
      </div>
      {isFlipped ? (
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm
          [&_p]:my-1 [&_ul]:my-1">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {answer}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="text-sm">
          <MathText text={question} />
        </div>
      )}
    </div>
  );
}