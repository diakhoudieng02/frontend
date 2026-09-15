// components/diagnostic/LevelSelector.tsx
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Trophy, Target, Brain, TrendingUp } from 'lucide-react';

interface LevelSelectorProps {
  subject: string;
  subjectEmoji: string;
  levels: {
    level: number;
    title: string;
    description: string;
    questionsCount: number;
    completedCount: number;
    locked: boolean;
    progress?: number;
  }[];
  onSelectLevel: (level: number) => void;
}

export function LevelSelector({ subject, subjectEmoji, levels, onSelectLevel }: LevelSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{subjectEmoji}</span>
        <h2 className="font-display font-bold text-lg text-foreground">{subject}</h2>
      </div>

      <div className="space-y-3">
        {levels.map((level, index) => (
          <motion.div
            key={level.level}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "relative overflow-hidden rounded-xl border-2 transition-all",
              level.locked 
                ? "border-muted/30 bg-muted/10 opacity-60" 
                : "border-primary/20 hover:border-primary/40 bg-card cursor-pointer group"
            )}
            onClick={() => !level.locked && onSelectLevel(level.level)}
          >
            {/* Dégradé de fond */}
            {!level.locked && (
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity",
                level.level === 1 && "bg-gradient-to-r from-emerald-500 to-green-500",
                level.level === 2 && "bg-gradient-to-r from-amber-500 to-orange-500",
                level.level === 3 && "bg-gradient-to-r from-rose-500 to-pink-500"
              )} />
            )}

            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold",
                    level.level === 1 && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                    level.level === 2 && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                    level.level === 3 && "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  )}>
                    {level.level}
                  </span>
                  <div>
                    <h3 className="font-bold text-foreground">{level.title}</h3>
                    <p className="text-xs text-muted-foreground">{level.description}</p>
                  </div>
                </div>

                {level.locked ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    🔒 Verrouillé
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {level.questionsCount} questions
                  </span>
                )}
              </div>

              {/* Barre de progression */}
              {level.progress !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Progression</span>
                    <span>{level.completedCount}/{level.questionsCount}</span>
                  </div>
                  <Progress value={level.progress} className="h-1.5" />
                </div>
              )}

              {/* Stats */}
              {!level.locked && (
                <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {level.completedCount} complétés
                  </span>
                  <span className="flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    Niveau {level.level}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mode Focus Info */}
      <div className="mt-6 p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-2">
          <Target className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-foreground">Mode Focus activé</p>
            <p className="text-[10px] text-muted-foreground">
              Un seul exercice à la fois pour une concentration maximale. 
              Pas de correction avant ta réponse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}