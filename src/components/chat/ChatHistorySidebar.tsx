// src/components/chat/ChatHistorySidebar.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Search, 
  X, 
  Clock,
  BookOpen,
  Plus,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  messageCount: number;
  courseId?: string;
}

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  selectedSession: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}

export function ChatHistorySidebar({
  sessions,
  selectedSession,
  onSelectSession,
  onNewChat,
  onClose
}: ChatHistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Aujourd'hui";
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return `Il y a ${days} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Historique</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="h-8 w-8"
            title="Nouvelle discussion"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {filteredSessions.map((session) => (
            <motion.button
              key={session.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all group',
                selectedSession === session.id
                  ? 'bg-primary/10 border border-primary/20 shadow-sm'
                  : 'hover:bg-muted/80 border border-transparent'
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                selectedSession === session.id
                  ? 'bg-primary/20'
                  : 'bg-muted'
              )}>
                <MessageSquare className={cn(
                  "w-4 h-4",
                  selectedSession === session.id ? 'text-primary' : 'text-muted-foreground'
                )} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm text-foreground truncate">
                    {session.title}
                  </p>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDate(session.timestamp)}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {session.preview}
                </p>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {session.messageCount} messages
                  </span>
                  
                  {session.courseId && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      <BookOpen className="w-3 h-3 inline mr-1" />
                      Cours lié
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  // Ici tu peux ajouter la logique pour supprimer la session
                  console.log('Delete session', session.id);
                }}
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </motion.button>
          ))}
        </AnimatePresence>

        {filteredSessions.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
            </p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-primary"
              >
                Voir tout l'historique
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{sessions.length} conversations</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            <span>
              {sessions.reduce((acc, s) => acc + s.messageCount, 0)} messages
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}