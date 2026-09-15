import type { CourseSubject } from '@/types/api';

interface SubjectCardProps {
  category: {
    value: CourseSubject;
    label: string;
    emoji: string;
  };
  count: number;
  onClick?: () => void;
}

export function SubjectCard({ category, count, onClick }: SubjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 text-left w-full transition-all duration-200 hover:border-border hover:shadow-sm active:scale-[0.98]"
    >
      <span className="text-2xl shrink-0">{category.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-sm text-foreground truncate">{category.label}</p>
        <p className="text-xs text-muted-foreground">{count} cours</p>
      </div>
      <div className="text-xs text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">→</div>
    </button>
  );
}