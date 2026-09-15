// src/components/dashboard/PassBadge.tsx
import { useNavigate } from 'react-router-dom';
import { Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PassBadgeProps {
  balance: number;
  loading?: boolean;
  className?: string;
}

export function PassBadge({ balance, loading, className }: PassBadgeProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/pricing');
  };

  // Couleur selon le solde
  const getBadgeColor = () => {
    if (balance === 0) return 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20';
    if (balance <= 3) return 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20';
    return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20';
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={cn(
        "gap-2 h-9 px-3 rounded-full transition-all hover:scale-105",
        getBadgeColor(),
        className
      )}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Zap className="h-4 w-4" />
          <span className="font-bold">{balance}</span>
          <span className="text-xs hidden sm:inline">Pass</span>
        </>
      )}
    </Button>
  );
}