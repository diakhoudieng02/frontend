// components/diagnostic/AnswerOptions.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Send, Lightbulb, AlertTriangle } from 'lucide-react';

interface AnswerOptionsProps {
  questionType: 'QCM' | 'VRAI_FAUX' | 'REPONSE_OUVERTE';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  method?: string;
  errorHint?: string;
  onAnswer: (answer: string | number, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function AnswerOptions({
  questionType,
  options,
  correctAnswer,
  explanation,
  method,
  errorHint,
  onAnswer,
  disabled = false
}: AnswerOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [openAnswer, setOpenAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleOptionSelect = (index: number) => {
    if (showFeedback || disabled) return;
    
    setSelectedOption(index);
    const correct = options?.[index] === correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    onAnswer(index, correct);
  };

  const handleOpenAnswerSubmit = async () => {
    if (!openAnswer.trim() || showFeedback || disabled) return;
    
    setSubmitting(true);
    
    // Simulation d'analyse de réponse ouverte
    // Dans la réalité, vous appelleriez une API pour analyser la réponse
    setTimeout(() => {
      const correct = openAnswer.toLowerCase().includes(correctAnswer.toLowerCase());
      setIsCorrect(correct);
      setShowFeedback(true);
      onAnswer(openAnswer, correct);
      setSubmitting(false);
    }, 800);
  };

  const getLetter = (index: number) => String.fromCharCode(65 + index);

  if (questionType === 'REPONSE_OUVERTE') {
    return (
      <div className="space-y-4">
        <Textarea
          placeholder="Tape ta réponse ici..."
          value={openAnswer}
          onChange={(e) => setOpenAnswer(e.target.value)}
          disabled={showFeedback || disabled || submitting}
          className="min-h-[120px] resize-none"
        />
        
        <Button
          onClick={handleOpenAnswerSubmit}
          disabled={!openAnswer.trim() || showFeedback || disabled || submitting}
          className="w-full gap-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Soumettre ma réponse
            </>
          )}
        </Button>

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "rounded-xl p-4 space-y-3",
                isCorrect ? "bg-accent/10" : "bg-destructive/10"
              )}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={cn(
                    "font-semibold",
                    isCorrect ? "text-accent" : "text-destructive"
                  )}>
                    {isCorrect ? "✅ Correct !" : "❌ Pas tout à fait"}
                  </p>
                  <p className="text-sm text-foreground/80 mt-1">{explanation}</p>
                </div>
              </div>

              {method && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5">
                  <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Méthode</p>
                    <p className="text-xs text-muted-foreground">{method}</p>
                  </div>
                </div>
              )}

              {errorHint && !isCorrect && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Erreur fréquente</p>
                    <p className="text-xs text-amber-600/80 dark:text-amber-400/80">{errorHint}</p>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                <span className="font-medium">Réponse attendue :</span> {correctAnswer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // QCM ou Vrai/Faux
  const displayOptions = options || ['Vrai', 'Faux'];
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2">
        {displayOptions.map((opt, index) => {
          const isSelected = selectedOption === index;
          const isCorrectOption = opt === correctAnswer;
          
          let buttonStyle = 'border-border hover:border-primary/30 hover:bg-muted/50';
          let letterStyle = 'bg-muted text-muted-foreground';
          
          if (showFeedback) {
            if (isCorrectOption) {
              buttonStyle = 'border-accent bg-accent/10';
              letterStyle = 'bg-accent text-white';
            } else if (isSelected && !isCorrectOption) {
              buttonStyle = 'border-destructive bg-destructive/10';
              letterStyle = 'bg-destructive text-white';
            } else {
              buttonStyle = 'border-border opacity-50';
            }
          } else if (isSelected) {
            buttonStyle = 'border-primary bg-primary/5';
            letterStyle = 'bg-primary text-white';
          }

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleOptionSelect(index)}
              disabled={showFeedback || disabled}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                buttonStyle
              )}
            >
              <span className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors",
                letterStyle
              )}>
                {questionType === 'VRAI_FAUX' ? (index === 0 ? 'V' : 'F') : getLetter(index)}
              </span>
              <span className="flex-1 text-foreground font-medium">{opt}</span>
              {showFeedback && isCorrectOption && (
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
              )}
              {showFeedback && isSelected && !isCorrectOption && (
                <XCircle className="h-5 w-5 text-destructive shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3 mt-4"
          >
            <div className={cn(
              "rounded-xl p-4",
              isCorrect ? "bg-accent/10" : "bg-destructive/10"
            )}>
              <p className="text-sm text-foreground/80">{explanation}</p>
            </div>

            {method && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5">
                <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-foreground">Méthode</p>
                  <p className="text-xs text-muted-foreground">{method}</p>
                </div>
              </div>
            )}

            {errorHint && !isCorrect && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Erreur fréquente</p>
                  <p className="text-xs text-amber-600/80 dark:text-amber-400/80">{errorHint}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}