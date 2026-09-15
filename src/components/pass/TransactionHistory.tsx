// components/pass/TransactionHistory.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Smartphone,
  Landmark,
  Loader2,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { passService } from '@/services/pass.service'; // ✅ Importer passService
import type { PassTransaction } from '@/types'; // ✅ Importer le bon type
import { cn } from '@/lib/utils';

const methodIcons = {
  wave: '📱',
  orange_money: '📞',
  card: '💳'
};

const methodColors = {
  wave: 'bg-blue-500/10 text-blue-500',
  orange_money: 'bg-orange-500/10 text-orange-500',
  card: 'bg-purple-500/10 text-purple-500'
};

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<PassTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'purchase' | 'consumption'>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // ✅ Utiliser passService.getHistory() au lieu de paymentService.getHistory()
      const data = await passService.getHistory();
      setTransactions(data.transactions);
    } catch (error) {
      console.error('❌ Erreur chargement historique:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transformer les transactions pour l'affichage
  const displayTransactions = transactions.map(tx => {
    const isPurchase = tx.amount > 0;
    const passAmount = Math.floor(Math.abs(tx.amount) / 1_000_000); // Convertir tokens en Pass
    
    return {
      id: tx.id,
      type: isPurchase ? 'purchase' as const : 'consumption' as const,
      amount: tx.amount,
      passChange: isPurchase ? passAmount : -passAmount,
      paymentMethod: tx.metadata?.packageId ? 'wave' as const : undefined,
      description: tx.actionType === 'PURCHASE' 
        ? `Achat de ${passAmount} Pass` 
        : `Consommation ${tx.actionType.replace('IA_', '').toLowerCase()}`,
      createdAt: tx.createdAt
    };
  });

  const filteredTransactions = displayTransactions.filter(tx => 
    filter === 'all' || tx.type === filter
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">Historique</h3>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs px-3">Tous</TabsTrigger>
            <TabsTrigger value="purchase" className="text-xs px-3">Achats</TabsTrigger>
            <TabsTrigger value="consumption" className="text-xs px-3">Consommations</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune transaction</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTransactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-card border"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    tx.type === 'purchase' ? 'bg-green-500/10' : 'bg-blue-500/10'
                  )}>
                    {tx.type === 'purchase' ? (
                      <ArrowDownCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <ArrowUpCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium text-sm">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </span>
                      {tx.paymentMethod && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            methodColors[tx.paymentMethod]
                          )}>
                            {methodIcons[tx.paymentMethod]} {tx.paymentMethod}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={cn(
                    "font-semibold",
                    tx.type === 'purchase' ? 'text-green-500' : 'text-blue-500'
                  )}>
                    {tx.type === 'purchase' ? '+' : '-'}{Math.abs(tx.passChange)} Pass
                  </span>
                  {tx.type === 'purchase' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {tx.amount.toLocaleString()} de Tokens
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}