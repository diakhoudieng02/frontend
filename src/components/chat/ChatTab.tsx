// src/components/chat/ChatTab.tsx (si vous avez ce composant)
// ou directement dans CourseDetail.tsx si vous gérez le chat dans un onglet

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, ExternalLink } from 'lucide-react';

interface ChatTabProps {
  courseId: string;
  courseTitle: string;
}

export function ChatTab({ courseId, courseTitle }: ChatTabProps) {
  const navigate = useNavigate();

  const handleOpenFullChat = () => {
    navigate(`/chat?course=${courseId}`);
  };

  return (
    <div className="h-[calc(100vh-250px)] sm:h-[calc(100vh-200px)] flex flex-col">
      {/* En-tête avec bouton pour ouvrir le chat en plein écran */}
      <div className="flex items-center justify-between mb-4 p-2">
        <h3 className="font-semibold text-lg">Chat avec l'IA</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenFullChat}
          className="gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Ouvrir en plein écran
        </Button>
      </div>

      {/* Mini chat ou redirection */}
      <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center p-6">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-semibold mb-2">Discutez avec l'IA sur ce cours</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Posez des questions sur "{courseTitle}" et obtenez des réponses basées uniquement sur le contenu du cours.
          </p>
          <Button onClick={handleOpenFullChat} className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Commencer à discuter
          </Button>
        </div>
      </div>
    </div>
  );
}