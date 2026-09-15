// components/exercises/ExerciseStats.tsx
import { motion } from 'framer-motion';
import { ClipboardList, Target, Flame, Award, TrendingUp } from 'lucide-react';

interface ExerciseStatsProps {
  stats: {
    correct: number;
    total: number;
    streak: number;
    bestStreak?: number;
    successRate?: number;
  };
}

export function ExerciseStats({ stats }: ExerciseStatsProps) {
  const successRate = stats.total > 0 
    ? Math.round((stats.correct / stats.total) * 100) 
    : 0;

  const statItems = [
    { 
      label: 'Exercices faits', 
      value: stats.total, 
      icon: ClipboardList, 
      color: 'text-primary' 
    },
    { 
      label: 'Bonnes réponses', 
      value: `${successRate}%`, 
      icon: Target, 
      color: 'text-accent' 
    },
    { 
      label: 'Série en cours', 
      value: stats.streak, 
      icon: Flame, 
      color: 'text-orange-500' 
    },
    { 
      label: 'Meilleure série', 
      value: stats.bestStreak || 0, 
      icon: Award, 
      color: 'text-yellow-500' 
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {statItems.map(({ label, value, icon: Icon, color }, index) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card-elevated p-3 text-center"
        >
          <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
          <p className="font-display font-bold text-xl text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </motion.div>
      ))}
    </div>
  );
}