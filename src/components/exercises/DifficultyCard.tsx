import { motion } from 'framer-motion';
import { Star, Trophy, Crown, Lock, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Difficulty = 'bronze' | 'silver' | 'gold';

interface DifficultyCardProps {
  difficulty: Difficulty;
  title: string;
  description: string;
  questionsCount: number;
  completedCount: number;
  locked?: boolean;
  onClick?: () => void;
}

const difficultyConfig = {
  bronze: {
    icon: Star,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    lightGradient: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-200',
    shadow: 'shadow-amber-500/20',
    textColor: 'text-amber-600',
    bgLight: 'bg-amber-50',
    label: 'Débutant',
    emoji: '🌱',
  },
  silver: {
    icon: Trophy,
    color: 'slate',
    gradient: 'from-slate-400 to-slate-600',
    lightGradient: 'from-slate-50 to-gray-100',
    borderColor: 'border-slate-200',
    shadow: 'shadow-slate-500/20',
    textColor: 'text-slate-500',
    bgLight: 'bg-slate-50',
    label: 'Intermédiaire',
    emoji: '⚡',
  },
  gold: {
    icon: Crown,
    color: 'yellow',
    gradient: 'from-yellow-400 to-amber-500',
    lightGradient: 'from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-200',
    shadow: 'shadow-yellow-500/20',
    textColor: 'text-yellow-600',
    bgLight: 'bg-yellow-50',
    label: 'Expert',
    emoji: '👑',
  },
};

export function DifficultyCard({
  difficulty,
  title,
  description,
  questionsCount,
  completedCount,
  locked = false,
  onClick,
}: DifficultyCardProps) {
  const config = difficultyConfig[difficulty];
  const Icon = config.icon;
  const progress = (completedCount / questionsCount) * 100;
  const isCompleted = completedCount === questionsCount;

  return (
    <motion.button
      whileHover={!locked ? { scale: 1.02, y: -2 } : {}}
      whileTap={!locked ? { scale: 0.98 } : {}}
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={cn(
        "relative w-full rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden group",
        locked 
          ? 'opacity-60 cursor-not-allowed bg-muted/30 border-muted' 
          : [
              `bg-gradient-to-br ${config.lightGradient} ${config.borderColor}`,
              'hover:shadow-xl hover:border-transparent',
              `hover:shadow-${config.color}-500/20`,
              'cursor-pointer'
            ]
      )}
    >
      {/* Background pattern */}
      {!locked && (
        <>
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            `bg-gradient-to-br ${config.gradient}`
          )} style={{ mixBlendMode: 'overlay' }} />
          
          <div className="absolute top-0 right-0 w-64 h-64 translate-x-16 -translate-y-16">
            <div className={cn(
              "w-full h-full rounded-full opacity-20 blur-3xl transition-transform duration-700 group-hover:scale-150",
              `bg-gradient-to-br ${config.gradient}`
            )} />
          </div>
        </>
      )}

      {/* Lock overlay */}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-2xl z-20">
          <div className="flex flex-col items-center gap-2 p-4 bg-background/80 rounded-xl shadow-lg">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              Niveau verrouillé
            </span>
          </div>
        </div>
      )}

      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between mb-3">
          {/* Icon with glow effect */}
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity",
              `bg-gradient-to-br ${config.gradient}`
            )} />
            <div className={cn(
              "relative w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
              config.gradient
            )}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Completion badge */}
          {isCompleted && !locked && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
              <Sparkles className="w-3 h-3 text-green-600" />
              <span className="text-[10px] font-medium text-green-600">Complété</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">{config.emoji}</span>
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              config.bgLight,
              config.textColor
            )}>
              {config.label}
            </span>
          </div>
          
          <h3 className="font-display font-bold text-lg text-foreground mb-1">
            {title}
          </h3>
          
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {/* Progress section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progression</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {completedCount}/{questionsCount}
              </span>
              <span className="text-muted-foreground">questions</span>
            </div>
          </div>

          <div className="relative h-2 bg-background/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all",
                `bg-gradient-to-r ${config.gradient}`
              )}
            />
          </div>
        </div>

        {/* Hover indicator */}
        {!locked && !isCompleted && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 text-xs font-medium text-primary">
              <span>Commencer</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>
    </motion.button>
  );
}