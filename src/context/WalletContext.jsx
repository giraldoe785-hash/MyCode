import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { PLANS_DATA } from '../services/mockData';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(48);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshWallet = async () => {
    try {
      const integrity = api.wallet.validateBalanceIntegrity();
      const b = await api.wallet.getBalance();
      const txs = await api.wallet.getTransactions();
      setBalance(integrity.valid ? b : integrity.adjustedBalance);
      setTransactions(txs);
    } catch (e) {
      console.error('Wallet fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWallet();
  }, []);

  const deductTokens = async (amount, description, type = 'Consumo') => {
    const res = await api.wallet.deductTokens(amount, description, type);
    if (res.success) {
      setBalance(res.newBalance);
      setTransactions(prev => [res.transaction, ...prev]);
      addToast(`-${amount} tokens: ${description}`, 'warning');
      return true;
    } else {
      addToast(res.error || 'Saldo insuficiente de tokens', 'danger');
      return false;
    }
  };

  const addTokens = async (amount, description, type = 'Recarga') => {
    const res = await api.wallet.addTokens(amount, description, type);
    if (res.success) {
      setBalance(res.newBalance);
      setTransactions(prev => [res.transaction, ...prev]);
      addToast(`+${amount} tokens acreditados: ${description}`, 'success');
      return true;
    }
    return false;
  };

  const upgradePlan = async (planId, isAnnual = false) => {
    const res = await api.wallet.upgradePlan(planId, isAnnual);
    if (res.success) {
      setBalance(res.newBalance);
      await refreshWallet();
      addToast(`¡Plan actualizado a ${res.plan.nombre}! Recibiste +${res.plan.tokensMensuales} tokens.`, 'success');
      return res;
    }
    return res;
  };

  const canConsumeTokens = (amount) => {
    return balance >= amount;
  };

  const consumeTokens = async (amount, description) => {
    return await deductTokens(amount, description, 'Consumo Sandbox');
  };

  return (
    <WalletContext.Provider value={{
      balance,
      transactions,
      loading,
      canConsumeTokens,
      consumeTokens,
      deductTokens,
      addTokens,
      upgradePlan,
      refreshWallet,
      toasts,
      addToast,
      removeToast,
      plans: PLANS_DATA
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}