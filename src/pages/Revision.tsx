import { useState } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { QuizPlayer } from '@/components/revision/QuizPlayer';
import { useRevision } from '@/hooks/useRevision';
import { COURSE_CATEGORIES } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  CheckCircle2,
  Circle,
  BookOpen,
  PenTool,
  ClipboardList,
  TrendingUp,
  Target,
  BarChart3,
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const TYPE_CONFIG = {
  quiz: { icon: ClipboardList, label: 'Quiz', gradient: 'from-primary to-purple-500' },
  review: { icon: BookOpen, label: 'Relecture', gradient: 'from-amber-500 to-orange-500' },
  exercise: { icon: PenTool, label: 'Exercice', gradient: 'from-accent to-teal-500' },
};

function formatDateLabel(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Aujourd'hui";
  if (isTomorrow(d)) return 'Demain';
  return format(d, 'EEEE d MMMM', { locale: fr });
}

export default function Revision() {
  const { tasks, results, toggleTask, submitQuiz, getProgressBySubject } = useRevision();
  const [activeQuizTaskId, setActiveQuizTaskId] = useState<string | null>(null);
  const { toast } = useToast();

  const progress = getProgressBySubject();
  const totalCompleted = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const overallPct = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const dateGroups = tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
    (acc[task.scheduledDate] ??= []).push(task);
    return acc;
  }, {});
  const sortedDates = Object.keys(dateGroups).sort();

  const activeQuizTask = tasks.find(t => t.id === activeQuizTaskId);

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.type === 'quiz' && task.quiz && !task.completed) {
      setActiveQuizTaskId(taskId);
    } else if (task.type !== 'quiz') {
      toggleTask(taskId);
      if (!task.completed) {
        toast({ title: '✅ Tâche complétée', description: task.title, variant: 'success' });
      }
    } else if (task.completed) {
      toast({ title: '🎉 Déjà complété', description: 'Ce quiz est déjà terminé !', variant: 'success' });
    }
  };

  const SUBJECT_EMOJI: Record<string, string> = {
    mathematiques: '📐',
    francais: '📖',
    anglais: '🇬🇧',
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 -left-40 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

     
      <main className="relative mx-auto max-w-6xl px-4 py-6 space-y-6">

        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Mode Révision
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Planifie tes révisions et passe des quiz</p>
        </div>

        {/* Overall progress */}
        <div className="glass-card p-5 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Progression globale</p>
                <p className="text-xs text-muted-foreground">{totalCompleted}/{totalTasks} tâches</p>
              </div>
            </div>
            <span className="font-display text-2xl font-bold text-primary">{overallPct}%</span>
          </div>
          <Progress value={overallPct} className="h-2.5" />
        </div>

        {/* Progress by subject */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {progress.map(p => {
            const cat = COURSE_CATEGORIES.find(c => c.value === p.subject);
            return (
              <div key={p.subject} className="glass-card p-4 text-center space-y-2 animate-fade-in hover:scale-[1.02] transition-transform">
                <span className="text-2xl">{SUBJECT_EMOJI[p.subject]}</span>
                <p className="text-xs font-semibold text-foreground truncate">{cat?.label}</p>
                <div className="flex items-center justify-center gap-1">
                  <BarChart3 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{p.completed}/{p.total}</span>
                </div>
                {p.avgScore > 0 && (
                  <span className={`inline-block text-[10px] font-bold rounded-full px-2 py-0.5 ${
                    p.avgScore >= 70 ? 'bg-sage-emerald-50 text-sage-emerald-600' : 'bg-primary/10 text-primary'
                  }`}>
                    {p.avgScore}% moy.
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Planning by day */}
        <section className="space-y-4">
          {sortedDates.map(date => (
            <div key={date} className="space-y-2 animate-slide-up">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="font-display font-bold text-sm text-foreground capitalize">{formatDateLabel(date)}</h3>
                <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                  {dateGroups[date].filter(t => t.completed).length}/{dateGroups[date].length}
                </span>
              </div>
              <div className="space-y-2">
                {dateGroups[date].map(task => {
                  const config = TYPE_CONFIG[task.type];
                  const Icon = config.icon;
                  const quizResult = results.find(r => r.taskId === task.id);
                  return (
                    <button
                      key={task.id}
                      onClick={() => handleTaskClick(task.id)}
                      className={`w-full flex items-center gap-3 glass-card p-3.5 text-left hover:scale-[1.01] active:scale-[0.99] transition-all ${
                        task.completed ? 'opacity-70' : ''
                      }`}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}

                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${config.gradient} text-white shadow-sm`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {SUBJECT_EMOJI[task.subject]} {COURSE_CATEGORIES.find(c => c.value === task.subject)?.label} · {config.label}
                        </p>
                      </div>

                      {quizResult && (
                        <span className={`text-xs font-bold rounded-full px-2 py-1 ${
                          (quizResult.score / quizResult.total) >= 0.7
                            ? 'bg-sage-emerald-50 text-sage-emerald-600'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {quizResult.score}/{quizResult.total}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Quiz Modal */}
      <Dialog open={!!activeQuizTaskId} onOpenChange={(v) => { if (!v) setActiveQuizTaskId(null); }}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto glass-strong bg-popover">
          <div className="corporate-header px-6 pt-6 pb-5">
            <DialogHeader>
              <DialogTitle className="text-white font-display text-lg">
                📝 {activeQuizTask?.title}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4">
            {activeQuizTask?.quiz && (
              <QuizPlayer
                questions={activeQuizTask.quiz}
                onComplete={(score, total) => submitQuiz(activeQuizTask.id, score, total)}
                onClose={() => setActiveQuizTaskId(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
