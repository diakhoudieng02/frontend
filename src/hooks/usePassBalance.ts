// hooks/usePassBalance.ts
import { useState, useEffect, useCallback } from 'react';
import { passService } from '@/services/pass.service';
import { useToast } from '@/hooks/use-toast';

export function usePassBalance() {
  const [balance, setBalance] = useState<number>(0);
  const [tokens, setTokens] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [consuming, setConsuming] = useState(false);
  const { toast } = useToast();

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    try {
      const data = await passService.getBalance();
      setBalance(data.remainingPasses);
      setTokens(data.totalTokens);
    } catch (error) {
      console.error('❌ Erreur chargement solde:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const consumePass = useCallback(async (amount: number = 1) => {
    if (balance < amount) {
      toast({
        title: 'Solde insuffisant',
        description: `Il vous faut ${amount} Pass pour cette action`,
        variant: 'destructive',
      });
      return false;
    }

    setConsuming(true);
    try {
      // 1 Pass = 1 000 000 tokens
      await passService.consumeTokens(amount * 1_000_000, 'IA_ANALYZE', {});
      
      setBalance(prev => prev - amount);
      setTokens(prev => prev - (amount * 1_000_000));
      
      return true;
    } catch (error) {
      console.error('❌ Erreur consommation pass:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de consommer le pass',
        variant: 'destructive',
      });
      return false;
    } finally {
      setConsuming(false);
    }
  }, [balance, toast]);

  const hasEnoughPass = useCallback((required: number = 1) => {
    return balance >= required;
  }, [balance]);

  return {
    balance,
    tokens,
    loading,
    consuming,
    hasEnoughPass,
    consumePass,
    refresh: fetchBalance
  };
}