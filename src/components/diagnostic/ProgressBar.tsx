// components/diagnostic/ProgressBar.tsx
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  total: number;
  answers: Array<{ correct: boolean } | null>;
  className?: string;
}

export function ProgressBar({ current, total, answers, className }: ProgressBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Question {current + 1}/{total}</span>
        <span>{Math.round(((current + 1) / total) * 100)}%</span>
      </div>
      
      <div className="flex gap-1 h-2">
        {Array.from({ length: total }).map((_, i) => {
          const isActive = i === current;
          const isPast = i < current;
          const answer = answers[i];
          
          return (
            <motion.div
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className={cn(
                "flex-1 rounded-full transition-all",
                isActive && "bg-primary animate-pulse",
                isPast && answer?.correct && "bg-accent",
                isPast && answer && !answer.correct && "bg-destructive",
                !isActive && !isPast && "bg-muted"
              )}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-accent" />
            <span>Bonnes réponses</span>
          </div>
          <div className="flex items-center gap-1">
            <Circle className="h-3 w-3 fill-destructive/20 text-destructive" />
            <span>Erreurs</span>
          </div>
        </div>
        <span>Score: {answers.filter(a => a?.correct).length}/{total}</span>
      </div>
    </div>
  );
}