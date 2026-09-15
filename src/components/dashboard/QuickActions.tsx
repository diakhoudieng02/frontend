import { Upload, MessageSquare, PenTool, BookOpen, Target } from 'lucide-react';

const ACTIONS = [
  { id: 'upload', label: 'Importer', icon: Upload, gradient: 'from-primary to-purple-500' },
  { id: 'chat', label: 'Chat IA', icon: MessageSquare, gradient: 'from-pink-500 to-rose-500' },
  { id: 'courses', label: 'Mes cours', icon: BookOpen, gradient: 'from-accent to-teal-500' },
 
  { id: 'progress', label: 'Progrès', icon: Target, gradient: 'from-blue-500 to-cyan-500' },
];

interface QuickActionsProps {
  onAction: (id: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="flex justify-center w-full">
      <div className="flex gap-6 overflow-x-auto pb-2 px-4 scrollbar-none max-w-4xl mx-auto">
        {ACTIONS.map(action => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className="flex flex-col items-center gap-2 shrink-0 group"
          >
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${action.gradient} text-white shadow-md group-hover:shadow-lg group-hover:scale-110 group-active:scale-95 transition-all duration-200`}>
              <action.icon className="h-8 w-8" />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}