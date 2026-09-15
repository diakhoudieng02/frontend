// components/ui/KeyTakeaways.tsx
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MathText } from '@/components/ui/Mathtext'; // Assurez-vous du bon chemin

interface KeyTakeawaysProps {
  takeaways: Array<{ statement: string }>;
  variant?: 'simple' | 'cards';
}

export function KeyTakeaways({ takeaways, variant = 'simple' }: KeyTakeawaysProps) {
  if (variant === 'cards') {
    return (
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-base sm:text-lg flex items-center gap-2">
          <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Points clés
        </h3>
        <div className="space-y-2">
          {takeaways.map((takeaway, index) => (
            <div
              key={`takeaway-${index}`}
              className="p-3 bg-primary/5 rounded-lg border border-primary/10 hover:border-primary/20 transition-colors"
            >
              <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                {/* ✅ Utilisation de MathText ici */}
                <MathText text={takeaway.statement} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-accent/5 p-4 rounded-xl space-y-2">
      <h4 className="text-xs font-semibold text-accent mb-2">Points clés</h4>
      <ul className="space-y-2">
        {takeaways.map((takeaway, index) => (
          <li key={`takeaway-${index}`} className="text-xs text-foreground/80 flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
            {/* ✅ Utilisation de MathText ici avec gestion du flex */}
            <div className="flex-1">
              <MathText text={takeaway.statement} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}