// src/components/chat/ChatMessage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  BookOpen, 
  ChevronRight, 
  FileText, 
  ExternalLink,
  Check,
  Copy,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MathText } from '@/components/ui/Mathtext';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: {
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
    }>;
    passCost?: number;
  };
  onSourceClick: (source: any) => void;
  formatTime: (timestamp: string) => string;
}

/**
 * Nettoie les duplications de formules que l'IA produit parfois.
 * Ex : "f(x)=kf(x)=k" → "f(x)=k"
 *      "f′(x)=0f′(x)=0" → "f′(x)=0"
 */
function cleanDuplicatedFormulas(text: string): string {
  // Supprime les répétitions exactes de séquences mathématiques
  // Pattern : une expression se répète immédiatement après elle-même
  return text
    // "f(x)=kf(x)=k" → "f(x)=k"
    .replace(/([a-zA-Z′'()\d^+\-*/=,. ]{3,})\1/g, '$1')
    // Nettoyage résiduel des doubles f′
    .replace(/(f[′']?\([^)]+\)=[^,;.!\n]+)\1/g, '$1');
}

/**
 * Extrait le texte brut depuis les children React (qui peuvent être
 * strings, arrays ou éléments React imbriqués).
 */
function extractText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children && typeof children === 'object' && 'props' in (children as any)) {
    return extractText((children as any).props?.children);
  }
  return String(children ?? '');
}

/**
 * Composant qui rend du texte avec MathText à l'intérieur de ReactMarkdown.
 * Gère le cas où children n'est pas une simple string.
 */
function MathChildren({ children }: { children: React.ReactNode }) {
  const text = extractText(children);
  return <MathText text={cleanDuplicatedFormulas(text)} />;
}

export function ChatMessage({ message, onSourceClick, formatTime }: ChatMessageProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast({ description: 'Message copié dans le presse-papiers', duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.9) return 'text-accent border-accent/20 bg-accent/5';
    if (score >= 0.7) return 'text-primary border-primary/20 bg-primary/5';
    if (score >= 0.5) return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
    return 'text-muted-foreground border-border bg-muted/30';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3 group',
        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm',
        message.role === 'user'
          ? 'bg-primary text-primary-foreground'
          : 'bg-gradient-to-r from-primary to-accent text-white'
      )}>
        {message.role === 'user' ? (
          <span className="text-xs font-bold">M</span>
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </div>

      {/* Message content */}
      <div className={cn(
        'flex-1 max-w-[80%] space-y-2',
        message.role === 'user' ? 'items-end' : 'items-start'
      )}>
        {/* Header */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-medium text-muted-foreground">
            {message.role === 'user' ? 'Vous' : 'Assistant IA'}
          </span>
          <span className="text-xs text-muted-foreground/60">
            {formatTime(message.timestamp)}
          </span>
          {message.passCost && message.role === 'assistant' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">
              {message.passCost} pass
            </span>
          )}
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded-md"
          >
            {copied
              ? <Check className="w-3.5 h-3.5 text-accent" />
              : <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            }
          </button>
        </div>

        {/* Message bubble */}
        <div className={cn(
          'px-4 py-3 rounded-2xl shadow-sm',
          message.role === 'user'
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-card border border-border rounded-tl-none'
        )}>
          {message.role === 'user' ? (
            // Utilisateur : texte simple + MathText
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              <MathText text={message.content} />
            </p>
          ) : (
            // Assistant : Markdown + MathText sur chaque nœud texte
            <div className={cn(
              "text-sm leading-relaxed",
              "prose prose-sm dark:prose-invert max-w-none",
              "prose-p:my-1.5 prose-p:leading-relaxed",
              "prose-headings:font-bold prose-headings:text-foreground",
              "prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-h3:mt-3",
              "prose-ul:my-1.5 prose-ol:my-1.5",
              "prose-li:my-0.5 prose-li:leading-relaxed",
              "prose-strong:font-semibold prose-strong:text-foreground",
              "prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:font-mono",
              "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground"
            )}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p><MathChildren>{children}</MathChildren></p>,
                  li: ({ children }) => <li><MathChildren>{children}</MathChildren></li>,
                  h1: ({ children }) => <h1><MathChildren>{children}</MathChildren></h1>,
                  h2: ({ children }) => <h2><MathChildren>{children}</MathChildren></h2>,
                  h3: ({ children }) => <h3><MathChildren>{children}</MathChildren></h3>,
                  strong: ({ children }) => <strong><MathChildren>{children}</MathChildren></strong>,
                  em: ({ children }) => <em><MathChildren>{children}</MathChildren></em>,
                  // Blocs de code : pas de MathText
                  code: ({ children }) => (
                    <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                      {children}
                    </code>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Course reference */}
        {message.courseTitle && (
          <button
            onClick={() => navigate(`/course/${message.courseId}`)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group/link px-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="border-b border-dotted border-muted-foreground/30 group-hover/link:border-primary/30">
              Source : {message.courseTitle}
            </span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
          </button>
        )}

        {/* Sources */}
        {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
              <FileText className="w-3.5 h-3.5" />
              <span className="font-medium">Sources utilisées :</span>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">
                {message.sources.length} référence{message.sources.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {message.sources.slice(0, 3).map((source, idx) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    'rounded-xl border p-3 text-sm cursor-pointer hover:shadow-md transition-all',
                    getRelevanceColor(source.relevance_score)
                  )}
                  onClick={() => onSourceClick(source)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">Référence {idx + 1}</span>
                      {source.page && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50">
                          p.{source.page}
                        </span>
                      )}
                      {source.section && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50">
                          {source.section}
                        </span>
                      )}
                    </div>
                    <div className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      source.relevance_score >= 0.9 ? 'bg-accent/20 text-accent'
                        : source.relevance_score >= 0.7 ? 'bg-primary/20 text-primary'
                        : 'bg-amber-100 text-amber-700'
                    )}>
                      {Math.round(source.relevance_score * 100)}% pertinent
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 italic line-clamp-2">
                    "<MathText text={source.content} />"
                  </p>
                  <div className="flex items-center justify-end mt-2 text-xs text-primary hover:underline">
                    Voir l'extrait complet
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </motion.div>
              ))}
              {message.sources.length > 3 && (
                <button
                  onClick={() => onSourceClick(message.sources![3])}
                  className="w-full text-xs text-center text-muted-foreground hover:text-primary py-2 border border-dashed border-border rounded-lg transition-colors"
                >
                  + {message.sources.length - 3} autres sources
                </button>
              )}
            </div>
          </div>
        )}

        {/* Warning faible pertinence */}
        {message.role === 'assistant' && message.sources && message.sources.length === 0 && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mt-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <p className="text-xs text-amber-600">
              Cette réponse est basée sur mes connaissances générales,
              aucun passage spécifique de tes cours n'a été trouvé.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}