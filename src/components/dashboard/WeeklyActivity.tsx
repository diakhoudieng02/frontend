import { BarChart3 } from 'lucide-react';

interface WeeklyActivityProps {
  coursesByDay: { day: string; count: number }[];
}

export function WeeklyActivity({ coursesByDay }: WeeklyActivityProps) {
  const maxCount = Math.max(...coursesByDay.map((d) => d.count), 1);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-display font-bold text-foreground text-sm">Activité</h3>
          <p className="text-[10px] text-muted-foreground">Sessions par jour</p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-24 px-1">
        {coursesByDay.map((item, i) => {
          const heightPct = Math.max((item.count / maxCount) * 100, 6);
          const isToday = i === coursesByDay.length - 1;
          return (
            <div key={item.day} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-[10px] font-medium text-muted-foreground">{item.count}</span>
              <div className="w-full flex items-end justify-center" style={{ height: '64px' }}>
                <div
                  className={`w-full max-w-[28px] rounded-md transition-all duration-500 ${
                    isToday ? 'bg-foreground/80' : 'bg-muted-foreground/15'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className={`text-[10px] ${isToday ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}