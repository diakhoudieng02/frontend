import { ChatMessage as ChatMessageType, ChatSource } from '@/types/database';
import { BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  showSources?: boolean;
}

const RELEVANCE_THRESHOLD = 0.7;

export function ChatMessage({ message, showSources = true }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const sources = message.sources || [];
  const relevantSources = sources.filter(s => s.relevance_score >= RELEVANCE_THRESHOLD);
  const hasLowRelevance = sources.length > 0 && relevantSources.length === 0;

  return (
    <div className={cn('animate-slide-up', isUser ? 'flex justify-end' : 'flex justify-start')}>
      <div className={cn('max-w-[85%] space-y-2', isUser ? 'items-end' : 'items-start')}>
        {/* Main message bubble */}
        <div className={cn(isUser ? 'chat-bubble-user' : 'chat-bubble-ai')}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Sources section for AI responses */}
        {!isUser && showSources && relevantSources.length > 0 && (
          <div className="space-y-2 ml-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="font-medium">Sources de ton cours :</span>
            </div>
            {relevantSources.map((source, idx) => (
              <SourceCitation key={idx} source={source} index={idx + 1} />
            ))}
          </div>
        )}

        {/* Low relevance warning */}
        {!isUser && hasLowRelevance && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg ml-1">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 font-medium">
                Je ne vois pas cette info dans ton cours.
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Veux-tu une explication générale à partir de mes connaissances ?
              </p>
              <div className="flex gap-2 mt-2">
                <button className="text-xs font-medium text-amber-800 bg-amber-100 px-3 py-1.5 rounded-full hover:bg-amber-200 transition-colors">
                  Oui, explique-moi
                </button>
                <button className="text-xs font-medium text-amber-600 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
                  Non merci
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI indicator */}
        {!isUser && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
            <Sparkles className="w-3 h-3" />
            <span>DocuSage AI</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SourceCitation({ source, index }: { source: ChatSource; index: number }) {
  const confidence = Math.round(source.relevance_score * 100);

  return (
    <div className="chat-source-citation">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-primary">
          Citation {index}
        </span>
        <span className={cn(
          'text-xs font-medium px-2 py-0.5 rounded-full',
          confidence >= 90 ? 'bg-accent/20 text-accent' :
          confidence >= 70 ? 'bg-primary/20 text-primary' :
          'bg-amber-100 text-amber-700'
        )}>
          {confidence}% pertinent
        </span>
      </div>
      <p className="text-sm text-foreground/80 italic leading-relaxed">
        "{source.content}"
      </p>
    </div>
  );
}
