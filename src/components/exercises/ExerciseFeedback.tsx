// components/exercises/ExerciseFeedback.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface ExerciseFeedbackProps {
  isCorrect: boolean;
  correctAnswer?: string;
  explanation?: string;
  onContinue: () => void;
}

export function ExerciseFeedback({
  isCorrect,
  correctAnswer,
  explanation,
  onContinue,
}: ExerciseFeedbackProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          rounded-2xl border-2 shadow-sm mt-2
          ${isCorrect
            ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500'
            : 'bg-rose-50 dark:bg-rose-950 border-rose-500'
          }
        `}
      >
        <div className="max-w-lg mx-auto px-5 pt-5 pb-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.15 }}
              className={`
                w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0
                ${isCorrect
                  ? 'bg-emerald-200 dark:bg-emerald-800'
                  : 'bg-rose-200 dark:bg-rose-800'
                }
              `}
            >
              {isCorrect
                ? <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
                : <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-300" />
              }
            </motion.div>

            <div className="min-w-0">
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className={`font-bold text-lg leading-tight ${
                  isCorrect
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-rose-700 dark:text-rose-300'
                }`}
              >
                {isCorrect ? 'Bravo ! 🎉' : 'Pas tout à fait...'}
              </motion.h3>

              {/* ✅ MathText sur la bonne réponse */}
              {!isCorrect && correctAnswer && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="text-xs text-gray-600 dark:text-gray-400 mt-0.5"
                >
                  Réponse :{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        p: ({ children }) => <span>{children}</span>,
                      }}
                    >
                      {correctAnswer}
                    </ReactMarkdown>
                  </span>
                </motion.p>
              )}
            </div>
          </div>

          {/* ✅ MathText sur l'explication */}
          {explanation && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`
                rounded-2xl p-3.5 mb-4 border
                ${isCorrect
                  ? 'bg-white dark:bg-emerald-900/60 border-emerald-200 dark:border-emerald-700'
                  : 'bg-white dark:bg-rose-900/60 border-rose-200 dark:border-rose-700'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed
                  [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_strong]:text-foreground
                  [&_.katex]:text-primary">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {explanation}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bouton continuer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={onContinue}
              size="lg"
              className={`
                w-full h-12 rounded-2xl font-semibold text-white shadow-md
                ${isCorrect
                  ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700'
                  : 'bg-rose-500 hover:bg-rose-600 active:bg-rose-700'
                }
              `}
            >
              Continuer
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          {/* Message encouragement */}
          {!isCorrect && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3"
            >
              C'est en se trompant qu'on apprend ! 💪
            </motion.p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}