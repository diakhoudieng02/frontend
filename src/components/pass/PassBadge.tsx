import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Loader2, ShoppingCart, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PassBadgeProps {
  balance: number;
  loading?: boolean;
  onBuyClick?: () => void;
  showProgress?: boolean;
  maxPass?: number;
  className?: string;
}

export function PassBadge({ 
  balance, 
  loading, 
  onBuyClick, 
  showProgress = false,
  maxPass = 100,
  className 
}: PassBadgeProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const progressPercent = (balance / maxPass) * 100;
  
  // ✅ Nouvelles conditions de couleurs
  const isLow = balance <= 10 && balance > 5; // Entre 5 et 10 → jaune
  const isVeryLow = balance <= 5 && balance > 0; // 5 ou moins → rouge
  const isCritical = balance === 0; // 0 → rouge critique

  // ✅ Couleur selon le solde
  const getBadgeColor = () => {
    if (isCritical || isVeryLow) return 'destructive';
    if (isLow) return 'warning';
    return 'primary';
  };

  const badgeColor = getBadgeColor();

  const handleBuyClick = () => {
    setIsOpen(false);
    if (onBuyClick) {
      onBuyClick();
    } else {
      navigate('/pricing');
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 transition-all duration-200",
            isCritical || isVeryLow 
              ? "border-destructive/50 bg-destructive/5 hover:bg-destructive/10" 
              : isLow
                ? "border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500"
                : "border-primary/30 hover:border-primary/50 hover:bg-primary/5",
            className
          )}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <>
              <Coins className={cn(
                "h-4 w-4 transition-colors duration-200",
                isCritical || isVeryLow ? "text-destructive" 
                  : isLow ? "text-amber-500" 
                  : "text-primary"
              )} />
              <span className={cn(
                "font-bold transition-colors duration-200",
                isCritical || isVeryLow ? "text-destructive" 
                  : isLow ? "text-amber-500" 
                  : "text-primary"
              )}>
                {balance}
              </span>
              <span className="text-xs text-muted-foreground">Pass</span>
              
              {/* Indicateur visuel pour solde faible ou très faible */}
              {(isLow || isVeryLow) && !isCritical && (
                <span className="relative flex h-2 w-2">
                  <span className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    isVeryLow ? "bg-destructive" : "bg-amber-400"
                  )}></span>
                  <span className={cn(
                    "relative inline-flex rounded-full h-2 w-2",
                    isVeryLow ? "bg-destructive" : "bg-amber-500"
                  )}></span>
                </span>
              )}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <span className="text-xs text-muted-foreground">Solde actuel</span>
            <div className="flex items-baseline justify-between">
              <span className={cn(
                "text-2xl font-bold",
                isCritical || isVeryLow ? "text-destructive" 
                  : isLow ? "text-amber-500" 
                  : "text-primary"
              )}>
                {balance}
              </span>
              <span className="text-sm text-muted-foreground">Pass</span>
            </div>
            {showProgress && (
              <div className="mt-2">
                <Progress 
                  value={progressPercent} 
                  className={cn(
                    "h-1.5",
                    isCritical || isVeryLow ? "bg-destructive/20" 
                      : isLow ? "bg-amber-500/20" 
                      : ""
                  )} 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {balance} / {maxPass} Pass
                </p>
              </div>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          className="gap-2 cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors duration-200"
          onClick={handleBuyClick}
        >
          <ShoppingCart className="h-4 w-4 text-primary transition-colors duration-200" />
          <div className="flex flex-col">
            <span className="font-medium">Acheter des Pass</span>
            <span className="text-xs text-muted-foreground">
              Forfaits à partir de 350 FCFA
            </span>
          </div>
        </DropdownMenuItem>

        {/* Message pour solde très faible (≤5) */}
        {(isVeryLow || isCritical) && (
          <>
            <DropdownMenuSeparator />
            <div className={cn(
              "p-2 rounded-md mx-2 my-1",
              isCritical ? "bg-destructive/10" : "bg-amber-500/10"
            )}>
              <div className="flex items-start gap-2 text-xs text-destructive">
                <AlertCircle className={cn(
                  "h-3 w-3 shrink-0 mt-0.5",
                  isCritical ? "text-destructive" : "text-amber-500"
                )} />
                <p className={cn(
                  isCritical ? "text-destructive" : "text-amber-500"
                )}>
                  {isCritical 
                    ? "Solde insuffisant pour analyser des documents"
                    : `Plus que ${balance} passes - Pense à recharger !`}
                </p>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}