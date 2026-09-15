// pages/CorrectionView.tsx

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Send, Loader2, Download, Copy, Check, Sparkles, AlertCircle, GraduationCap,
} from 'lucide-react';
import { coursesService } from '@/services/courses.service';
import { correctionsService } from '@/services/corrections.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Course } from '@/types/api';

interface ChatMessageUI {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const VALID_TABS = ['correction', 'chat', 'original'] as const;
type TabValue = typeof VALID_TABS[number];

function isValidTab(value: string | null): value is TabValue {
  return VALID_TABS.includes(value as TabValue);
}

// Hauteur identique pour les 3 panneaux — ajuste la valeur selon ta navbar
const PANEL_HEIGHT = 'calc(100vh - 260px)';

export default function CorrectionView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const tabFromUrl = searchParams.get('tab');
  const initialTab: TabValue = isValidTab(tabFromUrl) ? tabFromUrl : 'correction';

  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [generating, setGenerating] = useState(false);
  const [correction, setCorrection] = useState<string>('');
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessageUI[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasCorrection, setHasCorrection] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef(false);

  const POLL_INTERVAL_MS = 10000;
  const POLL_MAX_ATTEMPTS = 12;

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (isValidTab(tab) && tab !== activeTab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    if (!isValidTab(tab)) return;
    setActiveTab(tab);
    setSearchParams(tab === 'correction' ? {} : { tab }, { replace: true });
  };

  useEffect(() => { if (id) loadData(); }, [id]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);
  useEffect(() => { return () => { pollingRef.current = false; }; }, []);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const courseData = await coursesService.getById(id);
      setCourse(courseData);

      if (courseData.type !== 'EPREUVE') {
        toast({ title: '⚠️ Type de document incorrect', description: 'Redirection...', variant: 'destructive' });
        setTimeout(() => navigate(`/course/${id}`), 2000);
        return;
      }

      if (courseData.fileUrl) {
        try {
          setDocumentUrl(await coursesService.getDownloadUrl(id));
        } catch {
          setDocumentUrl(null);
        }
      }

      const content = await correctionsService.getCorrectionContent(id);
      if (content) { setCorrection(content); setHasCorrection(true); }
      else { setHasCorrection(false); }

      await loadChatHistory();
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger les données', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const pollForCorrection = async () => {
    if (!id || pollingRef.current) return;
    pollingRef.current = true;
    setGenerating(false);
    setIsPolling(true);
    let found = false;

    for (let attempt = 1; attempt <= POLL_MAX_ATTEMPTS; attempt++) {
      if (!pollingRef.current) break;
      const content = await correctionsService.getCorrectionContent(id);
      if (content) {
        setCorrection(content);
        setHasCorrection(true);
        await loadChatHistory();
        toast({ title: '✅ Corrigé prêt', description: 'Le corrigé est maintenant disponible.' });
        found = true;
        break;
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }

    if (!found && pollingRef.current)
      toast({ title: '⏳ Toujours en cours', description: 'La génération prend plus de temps. Réessayez plus tard.' });

    pollingRef.current = false;
    setIsPolling(false);
  };

  const handleGenerateCorrection = async () => {
    if (!id || generating || isPolling) return;
    setGenerating(true);
    let transitionToPolling = false;
    toast({ title: '📝 Génération du corrigé', description: "Analyse de l'épreuve en cours..." });

    try {
      const result = await correctionsService.generateCorrection(id);
      const correctionContent = result.correction_latex || result.content;

      if (correctionContent?.trim()) {
        setCorrection(correctionContent);
        setHasCorrection(true);
        await loadChatHistory();
        toast({ title: '✅ Corrigé généré !' });
      } else {
        setCorrection('');
        setHasCorrection(false);
        toast({ title: '⏳ Génération en cours', description: 'Vérification automatique en cours...' });
        transitionToPolling = true;
        pollForCorrection();
      }
    } catch (error: any) {
      const status = error?.status;
      if (status === 408 || status === 503 || status === 0) {
        toast({ title: '⏳ Génération en cours', description: 'Cela peut prendre quelques minutes...' });
        transitionToPolling = true;
        pollForCorrection();
        return;
      }
      toast({ title: 'Erreur', description: error.message || 'Échec de la génération', variant: 'destructive' });
    } finally {
      if (!transitionToPolling) setGenerating(false);
    }
  };

  const loadChatHistory = async () => {
    if (!id) return;
    try {
      const history = await correctionsService.getHistory(id);
      setChatMessages(history.messages.map((m) => ({ id: m.id, role: m.role, content: m.content, timestamp: m.createdAt })));
    } catch {
      setChatMessages([{ id: 'welcome', role: 'assistant', content: "👋 Bonjour ! Je suis votre tuteur IA. Une fois le corrigé généré, je pourrai vous aider.", timestamp: new Date().toISOString() }]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping || !id) return;
    if (!hasCorrection) {
      toast({ title: '⚠️ Corrigé requis', description: "Générez d'abord le corrigé", variant: 'destructive' });
      return;
    }
    const userMessage: ChatMessageUI = { id: `user-${Date.now()}`, role: 'user', content: inputMessage, timestamp: new Date().toISOString() };
    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    try {
      const response = await correctionsService.chat(id, inputMessage);
      setChatMessages((prev) => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', content: response.reply, timestamp: response.timestamp }]);
    } catch {
      toast({ title: 'Erreur', description: "Impossible d'envoyer le message", variant: 'destructive' });
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyCorrection = () => {
    navigator.clipboard.writeText(correction);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copié !' });
  };

  const handleDownloadCorrection = () => {
    const blob = new Blob([correction], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corrige-${id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: '✅ Téléchargé' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-7xl px-4 py-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="w-full rounded-xl" style={{ height: PANEL_HEIGHT }} />
        </main>
      </div>
    );
  }

  if (course && course.type !== 'EPREUVE') {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-7xl px-4 py-20 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-amber-600 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Type de document incorrect</h2>
          <p className="text-muted-foreground mb-6">Cette page est réservée aux épreuves.</p>
          <Button onClick={() => navigate(`/course/${id}`)}>
            <GraduationCap className="h-4 w-4 mr-2" />Voir le cours
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-display text-xl font-bold">{course?.title}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 mt-1">
                <GraduationCap className="h-3 w-3" />Épreuve
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasCorrection && correction ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCopyCorrection}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="ml-2 hidden sm:inline">Copier</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadCorrection}>
                  <Download className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Télécharger</span>
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={handleGenerateCorrection} disabled={generating || isPolling} className="bg-gradient-to-r from-violet-500 to-purple-500">
                {generating || isPolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="ml-2">{generating ? 'Génération...' : isPolling ? 'Vérification...' : 'Générer le corrigé'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* ── Alerts ── */}
        {isPolling && !correction && (
          <Alert className="mb-4 bg-violet-50 border-violet-200">
            <Loader2 className="h-4 w-4 text-violet-600 animate-spin" />
            <AlertDescription className="text-violet-800">Génération en cours. Vérification automatique en cours.</AlertDescription>
          </Alert>
        )}
        {!hasCorrection && !generating && !isPolling && (
          <Alert className="mb-4 bg-violet-50 border-violet-200">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <AlertDescription className="text-violet-800">Cette épreuve n'a pas encore de corrigé. Cliquez sur "Générer le corrigé".</AlertDescription>
          </Alert>
        )}

        {/* ── Tabs ── */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-4">
            <TabsTrigger value="correction">Corrigé</TabsTrigger>
            <TabsTrigger value="chat">Tuteur IA</TabsTrigger>
            <TabsTrigger value="original">Original</TabsTrigger>
          </TabsList>

          {/* ── Correction ── */}
          <TabsContent value="correction" className="mt-0">
            {/* height fixe en style inline — fonctionne même quand l'onglet est hidden */}
            <div className="bg-card rounded-xl border border-border overflow-auto" style={{ height: PANEL_HEIGHT }}>
              {generating || isPolling ? (
                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground" style={{ height: PANEL_HEIGHT }}>
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                  <p>{generating ? 'Génération du corrigé en cours...' : 'Vérification du corrigé en cours...'}</p>
                </div>
              ) : correction ? (
                <div className="p-6 prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_strong]:text-foreground [&_.katex]:text-primary">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {correction}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground" style={{ height: PANEL_HEIGHT }}>
                  <AlertCircle className="h-12 w-12" />
                  <p>Aucun corrigé disponible. Cliquez sur "Générer le corrigé".</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Chat ── */}
          <TabsContent value="chat" className="mt-0">
            <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden" style={{ height: PANEL_HEIGHT }}>
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[80%] rounded-lg p-3 text-sm', msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                      <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_strong]:text-foreground [&_.katex]:text-primary">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 border-t shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={hasCorrection ? 'Posez une question...' : "Générez d'abord le corrigé"}
                    disabled={isTyping || !hasCorrection}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!inputMessage.trim() || isTyping || !hasCorrection}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>

          {/* ── Original ── */}
          <TabsContent value="original" className="mt-0">
            <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ height: PANEL_HEIGHT }}>
              {documentUrl ? (
                <iframe
                  src={documentUrl}
                  className="w-full h-full border-0"
                  title="Document original"
                />
              ) : (
                <div className="flex items-center justify-center text-muted-foreground" style={{ height: PANEL_HEIGHT }}>
                  <p className="text-sm">Aperçu du document non disponible</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}