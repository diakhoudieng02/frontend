// components/exercises/QuizView.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ExerciseFeedback } from '@/components/exercises/ExerciseFeedback';
import { MathText } from '@/components/ui/Mathtext';
import type { QuizExercise } from '@/types/exercises.types';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react'; // Ajout de useState pour le debug visuel

interface QuizViewProps {
  currentExercise: QuizExercise;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  progress: number;
  selectedAnswer: number | null;
  showFeedback: boolean;
  submitting: boolean;
  onSelectAnswer: (index: number) => void;
  onContinue: () => void;
  onBack: () => void;
  onMarkAsMastered?: () => void;
  isMastered?: boolean;
}

export function QuizView({
  currentExercise,
  currentIndex,
  totalQuestions,
  score,
  progress,
  selectedAnswer,
  showFeedback,
  submitting,
  onSelectAnswer,
  onContinue,
  onBack,
  onMarkAsMastered,
  isMastered
}: QuizViewProps) {
  
  // State pour le débogueur visuel
  const [showDebug, setShowDebug] = useState(false);

  // 🔍 FONCTION DE DÉTECTION DU FORMAT LATEX
  function detectLatexFormat(text: string): string {
    if (!text) return 'vide';
    
    const formats = [];
    if (text.includes('$$')) formats.push('$$bloc$$');
    if (text.includes('$') && !text.includes('$$')) formats.push('$inline$');
    if (text.includes('\\(')) formats.push('\\(...\\)');
    if (text.includes('\\[')) formats.push('\\[...\\]');
    if (text.includes('\\frac')) formats.push('\\frac');
    if (text.includes('^')) formats.push('^');
    if (text.includes('_')) formats.push('_');
    
    // Détection des accents
    if (/[éèêëàâäîïôöùûüÿç]/.test(text)) {
      formats.push('⚠️ contient accents');
    }
    
    return formats.length > 0 ? formats.join(' + ') : 'texte brut';
  }

  // 🔍 LOGS DÉTAILLÉS DANS LA CONSOLE
  useEffect(() => {
    if (currentExercise) {
      console.group('🔍 QuizView - Données reçues');
      console.log('📌 Question (brut):', currentExercise.question);
      console.log('📌 Question (analyse):', {
        texte: currentExercise.question,
        contientDollar: currentExercise.question.includes('$'),
        contientDoubleDollar: currentExercise.question.includes('$$'),
        contientAccent: /[éèêëàâäîïôöùûüÿç]/.test(currentExercise.question),
        format: detectLatexFormat(currentExercise.question)
      });
      
      console.log('📌 Options:');
      currentExercise.options.forEach((opt, idx) => {
        console.log(`  Option ${String.fromCharCode(65 + idx)}:`, {
          texte: opt,
          contientDollar: opt.includes('$'),
          contientAccent: /[éèêëàâäîïôöùûüÿç]/.test(opt),
          format: detectLatexFormat(opt)
        });
      });
      
      if (currentExercise.explanation) {
        console.log('📌 Explication:', {
          texte: currentExercise.explanation,
          contientDollar: currentExercise.explanation.includes('$'),
          contientAccent: /[éèêëàâäîïôöùûüÿç]/.test(currentExercise.explanation),
          format: detectLatexFormat(currentExercise.explanation)
        });
      }
      
      console.log('📌 Index correct:', currentExercise.correct_index);
      console.log('📌 Concept tag:', currentExercise.concept_tag);
      console.groupEnd();
    }
  }, [currentExercise]);

  return (
    <div className="min-h-full relative">
      {/* 🐛 BOUTON DE DÉBOGUEUR VISUEL */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed bottom-4 left-4 z-50 bg-primary text-white p-2 rounded-full w-8 h-8 flex items-center justify-center text-xs hover:bg-primary/80 transition-all"
        title="Afficher/masquer le débogueur"
      >
        🐛
      </button>

      {/* 🐛 PANneau DE DÉBOGUEUR VISUEL */}
      <AnimatePresence>
        {showDebug && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed bottom-16 left-4 z-50 bg-black/90 text-white p-4 rounded-xl text-xs font-mono max-w-md border border-primary/30 shadow-xl"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-primary">🔍 DÉBOGUEUR LATEX</h4>
              <button 
                onClick={() => setShowDebug(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-auto">
              {/* Question */}
              <div className="border-b border-white/20 pb-2">
                <div className="font-bold text-primary mb-1">Question:</div>
                <div className="text-white/90 whitespace-pre-wrap break-words">
                  {currentExercise.question}
                </div>
                <div className="mt-1 text-primary/80 text-[10px]">
                  Format: {detectLatexFormat(currentExercise.question)}
                </div>
              </div>

              {/* Options */}
              <div className="border-b border-white/20 pb-2">
                <div className="font-bold text-primary mb-1">Options:</div>
                {currentExercise.options.map((opt, idx) => (
                  <div key={idx} className="ml-2 mt-2">
                    <div className="text-white/60 text-[10px]">
                      Option {String.fromCharCode(65 + idx)} {idx === currentExercise.correct_index && '✅'}
                    </div>
                    <div className="text-white/90 whitespace-pre-wrap break-words">
                      {opt}
                    </div>
                    <div className="text-primary/60 text-[10px]">
                      {detectLatexFormat(opt)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Explication */}
              {currentExercise.explanation && (
                <div>
                  <div className="font-bold text-primary mb-1">Explication:</div>
                  <div className="text-white/90 whitespace-pre-wrap break-words">
                    {currentExercise.explanation}
                  </div>
                  <div className="mt-1 text-primary/60 text-[10px]">
                    Format: {detectLatexFormat(currentExercise.explanation)}
                  </div>
                </div>
              )}
            </div>

            {/* Rendu réel pour comparaison */}
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="font-bold text-primary mb-2">📝 RENDU RÉEL:</div>
              <div className="bg-white/5 p-2 rounded">
                <MathText text={currentExercise.question} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative space-y-4">
        {/* Quiz Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-xl z-10 pt-2 pb-2 border-b border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="w-7 h-7 rounded-lg bg-muted/80 hover:bg-muted flex items-center justify-center transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-foreground" />
            </motion.button>

            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">
                  Question <span className="font-medium text-foreground">{currentIndex + 1}</span>
                </span>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="text-xs font-medium text-primary">{totalQuestions}</span>
              </div>
              {currentExercise.concept_tag && (
                <p className="text-[10px] text-primary/70 mt-0.5 line-clamp-1">
                  {currentExercise.concept_tag}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10 border border-accent/20">
              <Award className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-bold text-accent">{score}</span>
            </div>
          </div>

          <Progress value={progress} className="h-1.5 bg-muted/30" />
        </div>

        {/* Question + Options */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          {/* Question */}
          <div className="bg-gradient-to-br from-card to-card/80 rounded-xl p-4 border border-border/50 shadow-sm">
            <h2 className="font-display text-base md:text-lg font-bold text-foreground leading-relaxed">
              <MathText text={currentExercise.question} />
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {currentExercise.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentExercise.correct_index;

              return (
                <motion.button
                  key={index}
                  whileHover={!showFeedback && !submitting ? { scale: 1.01 } : {}}
                  whileTap={!showFeedback && !submitting ? { scale: 0.99 } : {}}
                  onClick={() => onSelectAnswer(index)}
                  disabled={showFeedback || submitting}
                  className={cn(
                    "w-full relative group transition-all duration-200",
                    submitting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "relative p-3 rounded-xl border transition-all duration-200",
                    showFeedback && isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                    showFeedback && isSelected && !isCorrect && "border-rose-500 bg-rose-50 dark:bg-rose-950/40",
                    !showFeedback && isSelected && "border-primary bg-primary/5",
                    !showFeedback && !isSelected && "border-border/50 bg-card hover:border-primary/30 hover:bg-primary/5"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-7 h-7 rounded-lg border flex items-center justify-center font-medium text-sm transition-all flex-shrink-0",
                        showFeedback && isCorrect && "border-emerald-500 bg-emerald-500 text-white",
                        showFeedback && isSelected && !isCorrect && "border-rose-500 bg-rose-500 text-white",
                        !showFeedback && isSelected && "border-primary bg-primary text-white",
                        !showFeedback && !isSelected && "border-border text-muted-foreground"
                      )}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className={cn(
                        "text-sm flex-1 text-left",
                        showFeedback && isCorrect && "text-emerald-700 dark:text-emerald-300 font-medium",
                        showFeedback && isSelected && !isCorrect && "text-rose-700 dark:text-rose-300",
                        !showFeedback && isSelected && "text-primary",
                        !showFeedback && !isSelected && "text-foreground"
                      )}>
                        <MathText text={option} />
                      </span>
                      {showFeedback && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Bouton maîtrisé */}
          <AnimatePresence>
            {showFeedback && onMarkAsMastered && !isMastered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-center"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMarkAsMastered}
                  className="gap-2 px-4 py-2 rounded-lg border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Marquer comme maîtrisé
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback inline */}
          {showFeedback && (
            <ExerciseFeedback
              isCorrect={selectedAnswer === currentExercise.correct_index}
              correctAnswer={currentExercise.options[currentExercise.correct_index]}
              explanation={currentExercise.explanation}
              onContinue={onContinue}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}