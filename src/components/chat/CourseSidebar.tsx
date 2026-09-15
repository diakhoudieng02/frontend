import { motion } from 'framer-motion';
import { 
  BookOpen, 
  List, 
  ChevronRight,
  FileText,
  Lightbulb,
  HelpCircle
} from 'lucide-react';

interface CourseSection {
  id: string;
  title: string;
  type: 'chapter' | 'definition' | 'example' | 'exercise';
}

interface CourseSidebarProps {
  sections: CourseSection[];
  activeSection?: string;
  onSectionClick?: (sectionId: string) => void;
}

const sectionIcons = {
  chapter: BookOpen,
  definition: FileText,
  example: Lightbulb,
  exercise: HelpCircle,
};

const sectionColors = {
  chapter: 'text-primary bg-primary/10',
  definition: 'text-blue-600 bg-blue-100',
  example: 'text-amber-600 bg-amber-100',
  exercise: 'text-accent bg-accent/10',
};

export function CourseSidebar({ sections, activeSection, onSectionClick }: CourseSidebarProps) {
  return (
    <div className="bg-card border-r border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <List className="w-5 h-5 text-primary" />
          Sommaire
        </div>
      </div>

      {/* Sections list */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {sections.map((section, index) => {
            const Icon = sectionIcons[section.type];
            const colorClass = sectionColors[section.type];
            const isActive = activeSection === section.id;

            return (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSectionClick?.(section.id)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all
                  ${isActive 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted'
                  }
                `}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`flex-1 text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                  {section.title}
                </span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-primary" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Légende</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(sectionIcons).map(([type, Icon]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="w-3 h-3" />
              <span className="capitalize">{type === 'chapter' ? 'Chapitre' : type === 'definition' ? 'Définition' : type === 'example' ? 'Exemple' : 'Exercice'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
