import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/lib/utils';
import type { Quiz } from '@/types/api';

interface RevisionQuizProps {
  quiz: Quiz[];
}

export function RevisionQuiz({ quiz }: RevisionQuizProps) {
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number | null>>({});

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    if (quizAnswers[questionId] !== undefined && quizAnswers[questionId] !== null) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  return (
    <div className="glass-card p-5">
      <h3 className="font-display font-semibold text-base mb-4 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-accent" />
        Quiz de révision
      </h3>
      
      <div className="space-y-4">
        {quiz.map((q, qi) => {
          const answered = quizAnswers[q.id] !== undefined && quizAnswers[q.id] !== null;
          const selectedIdx = quizAnswers[q.id];
          const isCorrect = selectedIdx === q.correct_index;

          return (
            <div key={q.id} className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                  {qi + 1}
                </span>
                <div className="text-xs font-semibold text-foreground flex-1">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {q.question}
                  </ReactMarkdown>
                </div>
              </div>
              
              <div className="space-y-1 pl-7">
                {q.options.map((opt, oi) => {
                  const isThisCorrect = oi === q.correct_index;
                  const isThisSelected = oi === selectedIdx;
                  return (
                    <button
                      key={`${q.id}-opt-${oi}`}
                      onClick={() => handleQuizAnswer(q.id, oi)}
                      disabled={answered}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        !answered && "border-border hover:border-primary/50 hover:bg-primary/5",
                        answered && isThisCorrect && "border-teal-500 bg-teal-500/10",
                        answered && isThisSelected && !isThisCorrect && "border-destructive bg-destructive/10",
                        answered && !isThisCorrect && !isThisSelected && "opacity-40"
                      )}
                    >
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {opt}
                      </ReactMarkdown>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}