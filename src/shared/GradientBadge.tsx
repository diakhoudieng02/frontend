import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GradientBadgeProps {
  icon: LucideIcon;
  text: string;
  gradient?: string;
  className?: string;
}

export default function GradientBadge({ 
  icon: Icon, 
  text, 
  gradient = "from-primary to-purple-500",
  className 
}: GradientBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r",
        gradient,
        "text-white shadow-md",
        className
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="font-semibold text-sm">{text}</span>
    </motion.div>
  );
}