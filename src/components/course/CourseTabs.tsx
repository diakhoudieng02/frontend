// components/course/CourseTabs.tsx
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Brain, Dumbbell, MessageCircle, FileText, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // ✅ Ajouter useNavigate

interface CourseTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  exercisesCount: number;
  flashcardsCount: number;
  courseId?: string; // ✅ Ajouter courseId optionnel pour la redirection
}

export function CourseTabs({ 
  activeTab, 
  onTabChange, 
  exercisesCount, 
  flashcardsCount,
  courseId // ✅ Récupérer courseId
}: CourseTabsProps) {
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    // ✅ Si l'onglet est "chat", rediriger vers la page de chat
    if (value === 'chat' && courseId) {
      navigate(`/chat?course=${courseId}`);
    } else {
      // Sinon, changer d'onglet normalement
      onTabChange(value);
    }
  };
// components/course/CourseTabs.tsx
// Assurez-vous que la liste des tabs inclut "chat"
const tabs = [
  { value: 'summary', label: 'Résumé', shortLabel: 'Rés.', icon: BookOpen },
  { value: 'revision', label: 'Révision', shortLabel: 'Révis.', icon: Brain },
  { value: 'exercises', label: `Exercices (${exercisesCount})`, shortLabel: `Exo (${exercisesCount})`, icon: Dumbbell },
  { value: 'flashcards', label: `Flashcards (${flashcardsCount})`, shortLabel: `Flash. (${flashcardsCount})`, icon: Brain },
  { value: 'chat', label: 'Chat IA', shortLabel: 'Chat', icon: MessageCircle },
  { value: 'pdf', label: 'PDF', shortLabel: 'PDF', icon: FileText },
  { value: 'info', label: 'Infos', shortLabel: 'Infos', icon: Settings },
];

  return (
    <div className="px-3 sm:px-4 border-b border-border overflow-x-auto scrollbar-hide">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-max sm:w-full justify-start h-auto bg-transparent p-0 gap-1 sm:gap-2 pb-2 min-w-full">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">{tab.label}</span>
              <span className="xs:hidden">{tab.shortLabel}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}