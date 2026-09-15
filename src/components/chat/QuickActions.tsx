import { motion } from 'framer-motion';
import { 
  FileText, 
  Lightbulb, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const actions = [
  {
    id: 'summarize',
    icon: FileText,
    label: 'Résumer le cours',
    prompt: 'Peux-tu me faire un résumé de ce cours ?',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'explain',
    icon: Lightbulb,
    label: 'Expliquer un concept',
    prompt: 'Explique-moi le concept principal de ce cours.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'quiz',
    icon: HelpCircle,
    label: 'Faire un quiz',
    prompt: 'Fais-moi un quiz de 5 questions sur ce cours.',
    gradient: 'from-accent to-emerald-500',
  },
];

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4" />
        Actions rapides
      </div>
      
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAction(action.prompt)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border shadow-sm hover:shadow-md transition-all"
          >
            <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${action.gradient} flex items-center justify-center`}>
              <action.icon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
