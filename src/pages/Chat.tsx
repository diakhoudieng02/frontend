// src/pages/Chat.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { QuickActions } from '@/components/chat/QuickActions';
import { SourceModal } from '@/components/chat/SourceModal';
import { PassBadge } from '@/components/pass/PassBadge';
import { UploadModal } from '@/components/course/UploadModal';
import { usePasses } from '@/hooks/usePasses';
import { useToast } from '@/hooks/use-toast';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { chatService } from '@/services/chat.service';
import { useTracking } from '@/hooks/useTracking';
import { 
  Search, 
  Send, 
  Sparkles, 
  BookOpen, 
  TrendingUp,
  FileText,
  ChevronRight,
  MessageSquare,
  X,
  AlertCircle,
  Zap,
  ChevronDown,
  ChevronUp,
  Upload,
  RefreshCw,
  PanelLeftClose,
  PanelLeftOpen,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CourseReference {
  id: string;
  title: string;
  subject: string;
  relevance?: number;
  fileUrl?: string;
}

interface ChatMessageType {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  courseId?: string;
  courseTitle?: string;
  sources?: Array<{
    id: string;
    content: string;
    relevance_score: number;
    page?: number;
    section?: string;
    courseId?: string;
  }>;
  passCost?: number;
}

export default function Chat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const courseIdFromUrl = searchParams.get('course');

  const {
    balance,
    loading: passesLoading,
    transactions,
    consumePass,
    addTransaction,
    refreshBalance
  } = usePasses();

  const [showCoursesSidebar, setShowCoursesSidebar] = useState(!isMobile);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);

  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(courseIdFromUrl);
  const [courses, setCourses] = useState<CourseReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPageReady, setIsPageReady] = useState(false);
  const [selectedSource, setSelectedSource] = useState<{
    content: string;
    courseTitle: string;
    page?: number;
    section?: string;
  } | null>(null);
  const [showSourceModal, setShowSourceModal] = useState(false);

  const [chatSessions, setChatSessions] = useState<Array<{
    id: string;
    title: string;
    preview: string;
    timestamp: string;
    messageCount: number;
    courseId?: string;
  }>>([]);

  const [quickActionsExpanded, setQuickActionsExpanded] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { trackAction } = useTracking();

  const startNewChat = (courseId?: string) => {
    setMessages([]);
    if (courseId) setSelectedCourse(courseId);

    const course = courses.find(c => c.id === (courseId || selectedCourse));
    const welcomeMessage: ChatMessageType = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: course
        ? `Bonjour ! Je suis ton assistant pour le cours "${course.title}". Pose-moi des questions sur ce cours !`
        : "Bonjour ! Sélectionne d'abord un cours dans la liste de gauche pour commencer à discuter.",
      timestamp: new Date().toISOString(),
      courseId: course?.id,
      courseTitle: course?.title,
    };
    setMessages([welcomeMessage]);

    if (course) {
      localStorage.setItem(`chat-${course.id}`, JSON.stringify([welcomeMessage]));
      toast({
        title: '✨ Nouvelle discussion',
        description: `Discussion ouverte sur "${course.title}"`,
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsPageReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const loadSessionsFromStorage = () => {
    try {
      const sessions = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('chat-')) {
          const courseId = key.replace('chat-', '');
          try {
            const msgs = JSON.parse(localStorage.getItem(key) || '[]');
            const course = courses.find(c => c.id === courseId) || {
              title: `Cours ${courseId.substring(0, 8)}...`,
              id: courseId
            };
            if (msgs.length > 0) {
              sessions.push({
                id: `session-${courseId}`,
                title: course.title,
                preview: msgs[msgs.length - 1]?.content?.substring(0, 50) + '...' || 'Nouvelle discussion',
                timestamp: msgs[msgs.length - 1]?.timestamp || new Date().toISOString(),
                messageCount: msgs.length,
                courseId
              });
            }
          } catch (e) {
            console.warn(`⚠️ Erreur parsing localStorage pour ${key}`);
          }
        }
      }
      setChatSessions(sessions);
    } catch (error) {
      console.error('❌ Erreur chargement sessions:', error);
      setChatSessions([]);
    }
  };

  const loadChatSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session?.courseId) {
      setSelectedCourse(session.courseId);
      const savedMessages = localStorage.getItem(`chat-${session.courseId}`);
      if (savedMessages) setMessages(JSON.parse(savedMessages));
    }
    setShowHistorySidebar(false);
    if (isMobile) setShowCoursesSidebar(false);
  };

  useEffect(() => {
    if (isMobile) {
      setShowCoursesSidebar(false);
      setShowHistorySidebar(false);
    } else {
      setShowCoursesSidebar(true);
    }
  }, [isMobile]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const userCourses = await chatService.getUserCourses();
        setCourses(userCourses);
      } catch (error) {
        console.error('❌ Erreur chargement données:', error);
        if (courseIdFromUrl) {
          const savedMessages = localStorage.getItem(`chat-${courseIdFromUrl}`);
          if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
            setSelectedCourse(courseIdFromUrl);
          } else {
            startNewChat(courseIdFromUrl);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [courseIdFromUrl]);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMessages = selectedCourse
    ? messages.filter(msg => msg.courseId === selectedCourse)
    : [];

  useEffect(() => {
    // ✅ Scroll uniquement le conteneur interne, pas la page entière
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!content.trim() || isTyping) return;
    if (!selectedCourse) {
      toast({ title: 'Aucun cours sélectionné', description: "Veuillez d'abord sélectionner un cours", variant: 'destructive' });
      return;
    }
    if (balance <= 0) {
      toast({ title: 'Solde insuffisant', description: "Tu n'as plus de passes IA.", variant: 'destructive' });
      return;
    }

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      courseId: selectedCourse,
      courseTitle: courses.find(c => c.id === selectedCourse)?.title,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage({ message: content, courseId: selectedCourse });
      await trackAction('chats');
      setMessages(prev => [...prev, response.assistantMessage]);
      const allMessages = [...messages, userMessage, response.assistantMessage];
      localStorage.setItem(`chat-${selectedCourse}`, JSON.stringify(allMessages));
      loadSessionsFromStorage();
    } catch (error: any) {
      const errorMessage = error.message?.includes('solde') ? 'Solde insuffisant' : "Impossible d'obtenir une réponse";
      toast({ title: 'Erreur', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    if (!selectedCourse) {
      toast({ title: 'Aucun cours sélectionné', description: "Veuillez d'abord sélectionner un cours", variant: 'destructive' });
      return;
    }
    setInputMessage(prompt);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCourseSelect = async (courseId: string) => {
    const newCourseId = courseId === selectedCourse ? null : courseId;
    setSelectedCourse(newCourseId);
    if (isMobile) setShowCoursesSidebar(false);

    if (newCourseId) {
      const savedMessages = localStorage.getItem(`chat-${newCourseId}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        startNewChat(newCourseId);
      }
    } else {
      setMessages([{
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: "Sélectionne un cours dans la liste de gauche pour commencer à discuter.",
        timestamp: new Date().toISOString(),
      }]);
    }
  };

  const handleSourceClick = (source: NonNullable<ChatMessageType['sources']>[0]) => {
    const course = courses.find(c => c.id === source.courseId);
    setSelectedSource({
      content: source.content,
      courseTitle: course?.title || 'Source inconnue',
      page: source.page,
      section: source.section,
    });
    setShowSourceModal(true);
  };

  const handlePurchase = (tx: any) => {
    addTransaction(tx);
    toast({ title: '✅ Achat réussi', description: `${tx.amount} passes ont été ajoutés à ton compte` });
  };

  const handleUploadSuccess = (course: any) => {
    const newCourse: CourseReference = {
      id: course.id,
      title: course.title,
      subject: course.subject,
      relevance: 1.0,
      fileUrl: course.fileUrl
    };
    setCourses(prev => [newCourse, ...prev]);
    toast({ title: '✅ Cours ajouté', description: 'Ton cours a été uploadé avec succès !' });
    setShowUploadModal(false);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const toggleCoursesSidebar = () => {
    const next = !showCoursesSidebar;
    setShowCoursesSidebar(next);
    if (isMobile && next) setShowHistorySidebar(false);
  };

  const toggleHistorySidebar = () => {
    const next = !showHistorySidebar;
    setShowHistorySidebar(next);
    if (isMobile && next) setShowCoursesSidebar(false);
  };

  const isDesktop = !isMobile;

  if (!isPageReady) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 5rem)' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MessageSquare className="w-6 h-6 text-primary/60" />
          </div>
          <p className="text-muted-foreground">Préparation du chat...</p>
        </div>
      </div>
    );
  }

  
  return (
    <div className="flex flex-col bg-background md:h-[calc(100vh-5rem)] h-[calc(100vh-4rem)]">
      <div className="flex flex-1 min-h-0 relative overflow-hidden">

        {/* ── OVERLAY mobile ── */}
        <AnimatePresence>
          {isMobile && (showCoursesSidebar || showHistorySidebar) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCoursesSidebar(false);
                setShowHistorySidebar(false);
              }}
              className="fixed inset-0 bg-black/50 z-30"
            />
          )}
        </AnimatePresence>

        {/* ── SIDEBAR GAUCHE ── */}
        <AnimatePresence mode="wait">
          {showCoursesSidebar && (
            <motion.div
              key="courses-sidebar"
              initial={isMobile ? { x: -320, opacity: 0 } : { width: 0, opacity: 0 }}
              animate={isMobile ? { x: 0, opacity: 1 } : { width: 320, opacity: 1 }}
              exit={isMobile ? { x: -320, opacity: 0 } : { width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className={cn(
                "bg-card border-r border-border flex-shrink-0 overflow-hidden",
                isMobile
                  ? "fixed left-0 top-[4rem] bottom-0 z-40 w-[85vw] max-w-[320px]"
                  : "relative h-full"
              )}
              style={isDesktop ? { minWidth: 0 } : undefined}
            >
              <div className="flex flex-col h-full w-full" style={{ width: isDesktop ? 320 : undefined }}>
                {/* Header sidebar */}
                <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-foreground">Mes cours</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowCoursesSidebar(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-border flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un cours..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Course list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  <AnimatePresence>
                    {filteredCourses.map((course) => (
                      <motion.button
                        key={course.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        onClick={() => handleCourseSelect(course.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                          selectedCourse === course.id
                            ? 'bg-primary/10 border border-primary/20 shadow-sm'
                            : 'hover:bg-muted/80 border border-transparent'
                        )}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{course.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground truncate max-w-[100px]">
                              {course.subject}
                            </span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <TrendingUp className="w-3 h-3 text-accent" />
                              <span className="text-xs font-medium text-accent">
                                {Math.round((course.relevance ?? 0) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        {selectedCourse === course.id && (
                          <ChevronRight className="w-4 h-4 text-primary ml-2 flex-shrink-0" />
                        )}
                      </motion.button>
                    ))}
                  </AnimatePresence>

                  {filteredCourses.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">
                        {searchQuery ? 'Aucun cours trouvé' : 'Aucun cours disponible'}
                      </p>
                      {searchQuery && (
                        <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2 text-primary">
                          Voir tous les cours
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Upload */}
                <div className="p-4 border-t border-border flex-shrink-0">
                  <Button onClick={() => setShowUploadModal(true)} variant="outline" className="w-full gap-2">
                    <Upload className="w-4 h-4" />
                    Uploader un cours
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="p-4 border-t border-border flex-shrink-0">
                  <button
                    onClick={() => setQuickActionsExpanded(!quickActionsExpanded)}
                    className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Actions rapides</span>
                    </div>
                    {quickActionsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                  <AnimatePresence>
                    {quickActionsExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <QuickActions onAction={handleQuickAction} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Stats */}
                <div className="p-4 border-t border-border bg-muted/30 flex-shrink-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      <span>{messages.length} messages</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{courses.length} cours</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ZONE PRINCIPALE CHAT ── */}
        <div className="flex-1 flex justify-center bg-background min-w-0 overflow-hidden">
          <div className={cn(
            "flex flex-col min-w-0 overflow-hidden h-full",
            isDesktop && !showCoursesSidebar && !showHistorySidebar
              ? "w-full max-w-3xl"
              : "flex-1 w-full"
          )}>

            {/* Header chat */}
            <div className="border-b border-border bg-card px-3 py-3 sm:px-4 flex-shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleCoursesSidebar}
                      className="h-9 w-9"
                      title={showCoursesSidebar ? "Masquer les cours" : "Afficher les cours"}
                    >
                      {showCoursesSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleHistorySidebar}
                      className="h-9 w-9"
                      title="Historique des discussions"
                    >
                      <History className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-md flex-shrink-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-semibold text-foreground text-base sm:text-lg truncate">
                      ETOOBLO AI
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 flex-shrink-0" />
                        <span className={cn("font-medium", balance > 0 ? "text-primary" : "text-destructive")}>
                          1 pass/msg
                        </span>
                      </div>
                      {selectedCourse && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full truncate max-w-[100px] sm:max-w-[150px]">
                            {courses.find(c => c.id === selectedCourse)?.subject}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedCourse && startNewChat(selectedCourse)}
                    className="gap-1.5 h-8 px-2 sm:px-3"
                    disabled={!selectedCourse}
                    title="Nouvelle discussion"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-xs">Nouveau</span>
                  </Button>

                  <PassBadge
                    balance={balance}
                    loading={passesLoading}
                    onBuyClick={() => navigate('/pricing')}
                    showProgress={true}
                    maxPass={100}
                  />
                </div>
              </div>

              {/* Filtres rapides mobile */}
              {isMobile && courses.length > 0 && (
                <div className="mt-3 overflow-x-auto pb-1 -mx-3 px-3">
                  <div className="flex gap-2" style={{ width: 'max-content' }}>
                    <button
                      onClick={() => setSelectedCourse(null)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                        !selectedCourse
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      Tous
                    </button>
                    {courses.slice(0, 6).map((course) => (
                      <button
                        key={course.id}
                        onClick={() => handleCourseSelect(course.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                          selectedCourse === course.id
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                      >
                        {course.subject}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ✅ Messages — flex-1 min-h-0 overflow-y-auto = scroll interne uniquement */}
            <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6 bg-muted/30 border-x border-border/40">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <MessageSquare className="w-6 h-6 text-primary/60" />
                    </div>
                    <p className="text-muted-foreground text-sm">Chargement de l'historique...</p>
                  </div>
                </div>
              ) : !selectedCourse ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-center mb-5 sm:mb-6">
                    <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-xl sm:text-2xl mb-2">
                    Sélectionne un cours
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs sm:max-w-md mb-6 sm:mb-8">
                    Pour commencer à discuter avec l'assistant IA, sélectionne d'abord un cours.
                  </p>
                  <Button
                    onClick={toggleCoursesSidebar}
                    className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <BookOpen className="w-4 h-4" />
                    Voir mes cours
                  </Button>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-center mb-5 sm:mb-6">
                    <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-xl sm:text-2xl mb-2">
                    {courses.find(c => c.id === selectedCourse)?.title}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs sm:max-w-md mb-6 sm:mb-8">
                    Pose des questions sur ce cours, demande des explications,
                    ou utilise les actions rapides ci-dessous pour commencer.
                  </p>
                  <QuickActions onAction={handleQuickAction} />
                </div>
              ) : (
                <>
                  {filteredMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onSourceClick={handleSourceClick}
                      formatTime={formatTime}
                    />
                  ))}

                  {isTyping && (
                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground">L'assistant analyse...</span>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>

            {/* ✅ Input area — flex-shrink-0 = ne grandit jamais au-delà de son contenu */}
            <div className="border-t border-border bg-card p-3 sm:p-4 flex-shrink-0">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(inputMessage); }}
                className="flex items-end gap-2"
              >
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="h-[46px] w-[46px] sm:h-[52px] sm:w-[52px] rounded-xl bg-muted hover:bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors group"
                  title="Uploader un cours"
                >
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                <div className="flex-1 relative min-w-0">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      selectedCourse
                        ? `Question sur ${courses.find(c => c.id === selectedCourse)?.title ?? ''}...`
                        : "Sélectionne d'abord un cours..."
                    }
                    rows={1}
                    disabled={isTyping || balance <= 0 || !selectedCourse}
                    className={cn(
                      'w-full resize-none rounded-xl border border-border bg-background px-3 py-3 pr-12',
                      'text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                      // ✅ overflow-y-auto : le textarea scrolle en interne, ne pousse pas la page
                      'min-h-[46px] sm:min-h-[52px] max-h-32 overflow-y-auto',
                      (isTyping || balance <= 0 || !selectedCourse) && 'opacity-50 cursor-not-allowed'
                    )}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(inputMessage);
                      }
                    }}
                  />
                  <div className="absolute right-3 bottom-3">
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full",
                      balance > 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                    )}>
                      {balance}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputMessage.trim() || isTyping || balance <= 0 || !selectedCourse}
                  className={cn(
                    "h-[46px] w-[46px] sm:h-[52px] sm:w-[52px] rounded-xl flex-shrink-0 transition-all",
                    inputMessage.trim() && !isTyping && balance > 0 && selectedCourse
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </form>

              {balance <= 0 && selectedCourse && (
                <div className="mt-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Plus de passes disponibles</span>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => navigate('/pricing')}
                    className="h-7 text-xs px-2 flex-shrink-0"
                  >
                    Recharger
                  </Button>
                </div>
              )}

              {!selectedCourse && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span className="text-xs sm:text-sm text-amber-600 truncate">Sélectionne un cours pour commencer</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SIDEBAR DROITE (Historique) ── */}
        <AnimatePresence>
          {showHistorySidebar && (
            <motion.div
              key="history-sidebar"
              initial={isMobile ? { x: 320, opacity: 0 } : { width: 0, opacity: 0 }}
              animate={isMobile ? { x: 0, opacity: 1 } : { width: 320, opacity: 1 }}
              exit={isMobile ? { x: 320, opacity: 0 } : { width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className={cn(
                "bg-card border-l border-border flex-shrink-0 overflow-hidden",
                isMobile
                  ? "fixed right-0 top-[4rem] bottom-0 z-40 w-[85vw] max-w-[320px]"
                  : "relative h-full"
              )}
            >
              <div className="flex flex-col h-full" style={{ width: isDesktop ? 320 : undefined }}>
                <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-foreground">Historique</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowHistorySidebar(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {chatSessions.length > 0 ? (
                    <div className="space-y-3">
                      {chatSessions.map((session) => (
                        <button
                          key={session.id}
                          onClick={() => loadChatSession(session.id)}
                          className="w-full p-3 rounded-lg hover:bg-muted/80 transition-colors text-left border border-transparent hover:border-border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <MessageSquare className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{session.title}</p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{session.preview}</p>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                <span>{new Date(session.timestamp).toLocaleDateString('fr-FR')}</span>
                                <span>•</span>
                                <span>{session.messageCount} messages</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Aucun historique</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-border flex-shrink-0">
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      setShowHistorySidebar(false);
                      selectedCourse && startNewChat(selectedCourse);
                    }}
                    disabled={!selectedCourse}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Nouvelle discussion
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      {showUploadModal && (
        <UploadModal
          open={showUploadModal}
          onOpenChange={setShowUploadModal}
          onUploaded={handleUploadSuccess}
        />
      )}

      <SourceModal
        isOpen={showSourceModal}
        onClose={() => setShowSourceModal(false)}
        source={selectedSource}
      />
    </div>
  );
}