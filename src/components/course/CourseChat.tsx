import { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType, ChatSource } from '@/types/database';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { usePasses } from '@/hooks/usePasses';
import { MessageCircle } from 'lucide-react';

interface CourseChatProps {
  courseId: string;
  courseTitle: string;
}

// Simulated AI responses with sources
const simulateAIResponse = (question: string): { content: string; sources: ChatSource[] } => {
  const questionLower = question.toLowerCase();
  
  // Simulate different scenarios
  if (questionLower.includes('dérivée') || questionLower.includes('derivée')) {
    return {
      content: "La dérivée d'une fonction mesure son taux de variation instantané. D'après ton cours, la dérivée de f(x) = x² est f'(x) = 2x. Cela signifie que la pente de la tangente à la courbe au point x vaut 2x.",
      sources: [
        {
          chunk_id: 'chunk-1',
          content: "La dérivée d'une fonction f en un point x₀ est la limite du taux de variation quand h tend vers 0.",
          relevance_score: 0.92,
        },
        {
          chunk_id: 'chunk-2',
          content: "Formules de dérivation usuelles : (xⁿ)' = n·xⁿ⁻¹",
          relevance_score: 0.88,
        },
      ],
    };
  }
  
  if (questionLower.includes('intégrale') || questionLower.includes('integrale')) {
    return {
      content: "L'intégrale permet de calculer l'aire sous une courbe. Selon tes notes, l'intégrale de a à b de f(x)dx représente l'aire algébrique entre la courbe et l'axe des abscisses.",
      sources: [
        {
          chunk_id: 'chunk-3',
          content: "L'intégrale définie ∫ab f(x)dx calcule l'aire signée entre la courbe y=f(x) et l'axe x sur [a,b].",
          relevance_score: 0.85,
        },
      ],
    };
  }

  // Low relevance scenario - triggers anti-hallucination warning
  if (questionLower.includes('quantique') || questionLower.includes('relativité')) {
    return {
      content: "Cette notion ne semble pas être abordée dans ton cours actuel.",
      sources: [
        {
          chunk_id: 'chunk-0',
          content: "Aucun passage pertinent trouvé dans le document.",
          relevance_score: 0.3,
        },
      ],
    };
  }

  // Default response with moderate relevance
  return {
    content: "J'ai analysé ton cours mais je n'ai pas trouvé de passage directement lié à ta question. Je peux quand même t'aider avec une explication générale si tu le souhaites.",
    sources: [
      {
        chunk_id: 'chunk-general',
        content: "Contenu général du cours sur les mathématiques.",
        relevance_score: 0.55,
      },
    ],
  };
};

export function CourseChat({ courseId, courseTitle }: CourseChatProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: 'welcome',
      course_id: courseId,
      user_id: 'system',
      role: 'assistant',
      content: `Salut ! 👋 Je suis prêt à t'aider avec "${courseTitle}". Pose-moi tes questions, je chercherai les réponses directement dans ton cours.`,
      sources: null,
      created_at: new Date().toISOString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { consumePass } = usePasses();

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    // Add user message
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      course_id: courseId,
      user_id: 'current-user',
      role: 'user',
      content,
      sources: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI typing
    setIsTyping(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get AI response
    const { content: aiContent, sources } = simulateAIResponse(content);
    
    const aiMessage: ChatMessageType = {
      id: `ai-${Date.now()}`,
      course_id: courseId,
      user_id: 'ai',
      role: 'assistant',
      content: aiContent,
      sources,
      created_at: new Date().toISOString(),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, aiMessage]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="chat-bubble-ai flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-muted-foreground">DocuSage réfléchit...</span>
            </div>
          </div>
        )}
        
        <div ref={scrollRef} />
      </div>

      {/* Input area */}
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
}
