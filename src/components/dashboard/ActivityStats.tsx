// components/dashboard/ActivityStats.tsx
import { useTracking } from '@/hooks/useTracking';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, MessageSquare, FileText, BarChart, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityStatsProps {
  className?: string;
}

export function ActivityStats({ className }: ActivityStatsProps) {
  const { stats, loadingStats, formatTime } = useTracking();

  if (loadingStats) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="font-display font-semibold">Activité aujourd'hui</h3>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold">Activité aujourd'hui</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Aucune activité pour le moment</p>
          <p className="text-xs mt-1">Commencez à utiliser l'application</p>
        </div>
      </Card>
    );
  }

  const today = stats.todayActivity || {
    totalMinutes: 0,
    actions: { chats: 0, exercises: 0, analyses: 0 }
  };

  const last7Days = stats.last7Days || [];
  const maxMinutes = Math.max(...last7Days.map(d => d.totalMinutes), 1);

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold">Activité aujourd'hui</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Temps d'étude</p>
              <p className="text-xs text-muted-foreground">Session en cours</p>
            </div>
          </div>
          <span className="text-xl font-bold text-primary">
            {formatTime(today.totalMinutes)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted/20">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <p className="text-lg font-semibold">{today.actions.chats}</p>
            <p className="text-[10px] text-muted-foreground">Messages</p>
          </div>

          <div className="text-center p-2 rounded-lg bg-muted/20">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <p className="text-lg font-semibold">{today.actions.exercises}</p>
            <p className="text-[10px] text-muted-foreground">Exercices</p>
          </div>

          <div className="text-center p-2 rounded-lg bg-muted/20">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
              <BarChart className="h-4 w-4 text-primary" />
            </div>
            <p className="text-lg font-semibold">{today.actions.analyses}</p>
            <p className="text-[10px] text-muted-foreground">Analyses</p>
          </div>
        </div>

        {last7Days.length > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
              <span>Activité des 7 derniers jours</span>
              <span>{stats.totalMinutes} min total</span>
            </div>
            <div className="flex gap-1 h-2">
              {last7Days.map((day, i) => {
                const percentage = (day.totalMinutes / maxMinutes) * 100;
                const isToday = i === last7Days.length - 1;
                return (
                  <div
                    key={day.date}
                    className="flex-1 group relative"
                    title={`${new Date(day.date).toLocaleDateString('fr-FR')}: ${day.totalMinutes} min`}
                  >
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        isToday ? "bg-primary" : "bg-primary/30"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}