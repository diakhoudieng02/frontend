import { motion } from 'framer-motion';

interface StatItem {
  value: string;
  label: string;
}

interface StatsGridProps {
  stats: StatItem[];
  className?: string;
}

export default function StatsGrid({ stats, className = "" }: StatsGridProps) {
  return (
    <div className={`grid grid-cols-3 gap-4 sm:gap-8 ${className}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.4 }}
          className="glass-card p-4 text-center"
        >
          <p className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            {stat.value}
          </p>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}