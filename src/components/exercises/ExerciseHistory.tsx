// components/exercises/ExerciseHistory.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ExerciseAttempt } from '@/services/exercise-history.service';

interface ExerciseHistoryProps {
  attempts: ExerciseAttempt[];
}

export function ExerciseHistory({ attempts }: ExerciseHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  if (attempts.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-4 mt-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h3 className="font-display font-semibold text-sm">
            Historique des exercices
          </h3>
          <span className="text-xs text-muted-foreground">
            ({attempts.length} tentatives)
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2 overflow-hidden"
          >
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 text-sm"
              >
                {attempt.isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {attempt.conceptTag}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(attempt.createdAt).toLocaleString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  attempt.difficultyLevel === 1 ? "bg-teal-500/10 text-teal-500" :
                  attempt.difficultyLevel === 2 ? "bg-primary/10 text-primary" :
                  "bg-destructive/10 text-destructive"
                )}>
                  {attempt.difficultyLevel === 1 ? "Bronze" :
                   attempt.difficultyLevel === 2 ? "Argent" : "Or"}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}