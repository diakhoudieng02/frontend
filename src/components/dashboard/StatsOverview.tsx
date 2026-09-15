import { TrendingUp, BookOpen, Flame, Clock, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StatsOverviewProps {
  totalCourses: number;
  readyCourses: number;
  streakDays: number;
  studyMinutesToday: number;
  quizAvgScore: number;
  tasksCompleted: number;
  totalTasks: number;
}

export function StatsOverview({
  totalCourses,
  readyCourses,
  streakDays,
  studyMinutesToday,
  quizAvgScore,
  tasksCompleted,
  totalTasks,
}: StatsOverviewProps) {
  const taskPct = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

  const stats = [
    { label: 'Cours', value: totalCourses, sub: `${readyCourses} prêts`, icon: BookOpen },
    { label: 'Série', value: `${streakDays}j`, sub: streakDays >= 3 ? 'En feu' : 'Continue', icon: Flame },
    { label: 'Étude', value: `${studyMinutesToday}m`, sub: "aujourd'hui", icon: Clock },
    { label: 'Quiz', value: quizAvgScore > 0 ? `${quizAvgScore}%` : '—', sub: quizAvgScore >= 70 ? 'Excellent' : 'Moyenne', icon: Award },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group rounded-2xl border border-border/60 bg-card/80 p-4 transition-all duration-200 hover:border-border hover:shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <p className="font-display text-xl font-bold text-foreground leading-none">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground/60">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Progression</p>
              <p className="text-[10px] text-muted-foreground">
                {tasksCompleted}/{totalTasks} tâches
              </p>
            </div>
          </div>
          <span className="font-display text-lg font-bold text-foreground">{taskPct}%</span>
        </div>
        <Progress value={taskPct} className="h-1.5" />
      </div>
    </div>
  );
}