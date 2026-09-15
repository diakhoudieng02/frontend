import { useState } from 'react';
import type { PassTransaction } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { History, Zap, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const PAYMENT_LABELS: Record<string, { name: string; icon: string }> = {
  wave: { name: 'Wave', icon: '🌊' },
  orange_money: { name: 'Orange Money', icon: '🟠' },
};

interface TransactionHistoryProps {
  transactions: PassTransaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
          <History className="h-3.5 w-3.5" />
          Historique
          <ChevronRight className="h-3 w-3" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
        <div className="corporate-header px-6 pt-6 pb-5">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-lg">
              📋 Historique des achats
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-blue-50">
                <History className="h-7 w-7 text-primary/40" />
              </div>
              <p className="font-display font-semibold text-foreground">Aucune transaction</p>
              <p className="text-xs text-muted-foreground mt-1">Tes achats de pass apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {transactions.map(tx => {
                const method = PAYMENT_LABELS[tx.payment_method] || { name: tx.payment_method, icon: '💳' };
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 animate-fade-in"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-emerald-50">
                      <Zap className="h-5 w-5 text-sage-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">+{tx.amount} Pass</p>
                      <p className="text-[11px] text-muted-foreground">
                        {method.icon} {method.name} · {format(new Date(tx.created_at), 'd MMM yyyy, HH:mm', { locale: fr })}
                      </p>
                    </div>
                    <span className="text-sm font-display font-bold text-foreground shrink-0">
                      {tx.price.toLocaleString()} <span className="text-[10px] text-muted-foreground">FCFA</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}