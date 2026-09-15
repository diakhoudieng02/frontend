import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { DifficultyCard } from '@/components/exercises/DifficultyCard';
import { cn } from '@/lib/utils';

type DifficultyLevel = 'bronze' | 'silver' | 'gold';

interface DifficultyLevelsProps {
  levels: Array<{
    difficulty: DifficultyLevel;
    title: string;
    description: string;
    questionsCount: number;
    completedCount: number;
    locked: boolean;
  }>;
  onSelectDifficulty: (difficulty: DifficultyLevel) => void;
  generating: boolean;
}

export function DifficultyLevels({ levels, onSelectDifficulty, generating }: DifficultyLevelsProps) {
  const completedLevels = levels.filter(l => l.completedCount === l.questionsCount).length;

  return (
    <section className="relative">
      {/* Header avec stats */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Niveaux d'exercices
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completedLevels}/{levels.length} niveaux complétés
          </p>
        </div>
        
        {generating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            <span className="text-xs font-medium text-primary">Génération en cours...</span>
          </motion.div>
        )}
      </div>

      {/* Grille de niveaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {levels.map((level, index) => (
          <motion.div
            key={level.difficulty}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="h-full"
          >
            <DifficultyCard
              difficulty={level.difficulty}
              title={level.title}
              description={level.description}
              questionsCount={level.questionsCount}
              completedCount={level.completedCount}
              locked={level.locked}
              onClick={() => !level.locked && onSelectDifficulty(level.difficulty)}
            />
          </motion.div>
        ))}
      </div>

      {/* Message de progression */}
      {completedLevels === levels.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl text-center"
        >
          <p className="text-xs text-primary font-medium">
            🎉 Félicitations ! Tu as complété tous les niveaux !
          </p>
        </motion.div>
      )}
    </section>
  );
}