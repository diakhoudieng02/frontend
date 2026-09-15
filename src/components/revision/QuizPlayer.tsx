import { useState } from 'react';
import type { QuizQuestion } from '@/hooks/useRevision';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowRight, Trophy } from 'lucide-react';

interface QuizPlayerProps {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
  onClose: () => void;
}

export function QuizPlayer({ questions, onComplete, onClose }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[currentIndex];
  const isCorrect = selectedAnswer === current?.correctIndex;
  const progress = ((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100;

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === current.correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      const finalScore = score;
      setFinished(true);
      onComplete(finalScore, questions.length);
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="text-center py-6 space-y-4 animate-fade-in">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${pct >= 70 ? 'bg-sage-emerald-50' : 'bg-primary/10'}`}>
          <Trophy className={`h-10 w-10 ${pct >= 70 ? 'text-sage-emerald-600' : 'text-primary'}`} />
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-foreground">{score}/{questions.length}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {pct >= 90 ? 'Excellent ! 🎉' : pct >= 70 ? 'Bien joué ! 👏' : pct >= 50 ? 'Pas mal, continue ! 💪' : 'Révise encore un peu 📖'}
          </p>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${pct >= 70 ? 'bg-accent' : 'bg-primary'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <Button className="w-full btn-primary-gradient rounded-xl h-12 font-semibold" onClick={onClose}>
          Terminer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <p className="font-display text-lg font-bold text-foreground leading-snug">{current.question}</p>

      {/* Options */}
      <div className="space-y-2.5">
        {current.options.map((opt, i) => {
          let style = 'border-border hover:border-primary/30 hover:bg-muted/50';
          if (showResult) {
            if (i === current.correctIndex) style = 'border-accent bg-accent/10';
            else if (i === selectedAnswer) style = 'border-destructive bg-destructive/10';
            else style = 'border-border opacity-50';
          } else if (selectedAnswer === i) {
            style = 'border-primary bg-primary/5';
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showResult}
              className={`w-full flex items-center gap-3 rounded-xl border-2 p-3.5 text-left text-sm font-medium transition-all ${style}`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                showResult && i === current.correctIndex ? 'bg-accent text-white' :
                showResult && i === selectedAnswer ? 'bg-destructive text-white' :
                'bg-muted text-muted-foreground'
              }`}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 text-foreground">{opt}</span>
              {showResult && i === current.correctIndex && <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />}
              {showResult && i === selectedAnswer && i !== current.correctIndex && <XCircle className="h-5 w-5 text-destructive shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showResult && (
        <div className={`rounded-xl p-3.5 text-sm animate-fade-in ${isCorrect ? 'bg-sage-emerald-50 text-sage-emerald-600' : 'bg-destructive/5 text-destructive'}`}>
          <p className="font-semibold mb-1">{isCorrect ? '✅ Correct !' : '❌ Incorrect'}</p>
          <p className="text-foreground/80">{current.explanation}</p>
        </div>
      )}

      {/* Next */}
      {showResult && (
        <Button className="w-full btn-primary-gradient rounded-xl h-11 font-semibold animate-fade-in" onClick={handleNext}>
          {currentIndex + 1 >= questions.length ? 'Voir les résultats' : 'Question suivante'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
