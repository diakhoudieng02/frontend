// hooks/usePasses.ts
import { useState, useCallback, useEffect } from 'react';
import { usePassBalance } from './usePassBalance';
import { useToast } from '@/hooks/use-toast';
import { passService } from '@/services/pass.service';
import { paymentService } from '@/services/payment.service';
import type { PassTransaction, Provider } from '@/types';

export function usePasses() {
  const { balance, loading: balanceLoading, refresh: refreshBalance } = usePassBalance();
  
  const [transactions, setTransactions] = useState<PassTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await passService.getHistory();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Erreur chargement transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // ✅ AJOUTER la fonction consumePass
  const consumePass = useCallback(async (amount: number = 1): Promise<boolean> => {
    try {
      // Vérifier le solde
      if (balance < amount) {
        toast({
          title: 'Solde insuffisant',
          description: `Vous n'avez pas assez de passes (${balance} / ${amount})`,
          variant: 'destructive',
        });
        return false;
      }

      // Appel au service pour consommer des passes
      const result = await passService.consumePass(amount);
      
      if (result.success) {
        // Rafraîchir le solde
        await refreshBalance();
        
        // Optionnel : recharger les transactions pour voir la consommation
        await loadTransactions();
        
        toast({
          title: '✅ Pass consommé',
          description: `Il vous reste ${balance - amount} passes`,
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('❌ Erreur consommation pass:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de consommer le pass',
        variant: 'destructive',
      });
      return false;
    }
  }, [balance, refreshBalance, loadTransactions, toast]);

  const createPayment = useCallback(async (provider: Provider, packageId: string, phoneNumber: string) => {
    try {
      const result = await paymentService.createPayment({
        provider,
        packageId,
        phoneNumber
      });
      return { success: true, data: result };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le paiement',
        variant: 'destructive',
      });
      return { success: false };
    }
  }, [toast]);

  const checkPaymentStatus = useCallback(async (transactionId: string) => {
    try {
      const status = await paymentService.checkPaymentStatus(transactionId);
      return { success: true, status };
    } catch (error) {
      return { success: false };
    }
  }, []);

  const addTransaction = useCallback((tx: PassTransaction) => {
    setTransactions(prev => [tx, ...prev]);
    refreshBalance();
  }, [refreshBalance]);

  return {
    balance,
    loading: loading || balanceLoading,
    transactions,
    createPayment,
    checkPaymentStatus,
    refreshBalance,
    addTransaction,
    consumePass, // ✅ AJOUTÉ
  };
}