import { useState, useEffect } from 'react';
import { subDays } from 'date-fns';
import { Transaction, Budget, UserSettings, Category } from '../types/finance';
import { APP_CONFIG, DEFAULT_CATEGORIES } from '../constants';
import { fetchExchangeRates, ExchangeRates } from '../services/currencyService';

export function useFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rates, setRates] = useState<ExchangeRates>({});
  const [settings, setSettings] = useState<UserSettings>({
    baseCurrency: 'USD',
    theme: 'dark',
    autoCategorize: true,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedTransactions = localStorage.getItem(APP_CONFIG.EXPENSES_KEY);
    const savedBudgets = localStorage.getItem(APP_CONFIG.BUDGETS_KEY);
    const savedCategories = localStorage.getItem('fintrack_categories');
    const savedSettings = localStorage.getItem(APP_CONFIG.SETTINGS_KEY);

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      const seedTransactions: Transaction[] = [
        { id: 'm1', date: new Date().toISOString(), amount: 3500, currency: 'USD', categoryId: '9', description: 'Monthly Salary', merchant: 'Acme Corp' },
        { id: 'm2', date: new Date().toISOString(), amount: 45.50, currency: 'USD', categoryId: '1', description: 'Dinner with friends', merchant: 'Pasta Palace' },
        { id: 'm3', date: subDays(new Date(), 1).toISOString(), amount: 120, currency: 'USD', categoryId: '2', description: 'New Sneakers', merchant: 'Nike Store' },
        { id: 'm4', date: subDays(new Date(), 2).toISOString(), amount: 85, currency: 'USD', categoryId: '5', description: 'Electricity Bill', merchant: 'Utility Co' },
        { id: 'm5', date: subDays(new Date(), 5).toISOString(), amount: 15.99, currency: 'USD', categoryId: '4', description: 'Streaming Service', merchant: 'Netflix' },
      ];
      setTransactions(seedTransactions);
    }
    
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    } else {
      const seedBudgets: Budget[] = [
        { id: 'b1', categoryId: '1', amount: 500, period: 'monthly', currency: 'USD' },
        { id: 'b2', categoryId: '2', amount: 300, period: 'monthly', currency: 'USD' },
      ];
      setBudgets(seedBudgets);
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(DEFAULT_CATEGORIES);
    }
    
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const loadRates = async () => {
      const newRates = await fetchExchangeRates(settings.baseCurrency);
      setRates(newRates);
    };
    loadRates();
  }, [settings.baseCurrency]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(APP_CONFIG.EXPENSES_KEY, JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(APP_CONFIG.BUDGETS_KEY, JSON.stringify(budgets));
    }
  }, [budgets, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fintrack_categories', JSON.stringify(categories));
    }
  }, [categories, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(APP_CONFIG.SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateBudget = (budget: Budget) => {
    setBudgets(prev => {
      const existing = prev.find(b => b.categoryId === budget.categoryId);
      if (existing) {
        return prev.map(b => b.categoryId === budget.categoryId ? budget : b);
      }
      return [...prev, { ...budget, id: crypto.randomUUID() }];
    });
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...category, id: crypto.randomUUID() }]);
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...category } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    // Optionally clean up transactions/budgets linked to this category
  };

  const exportData = (format: 'json' | 'csv') => {
    const data = { transactions, budgets, settings, categories };
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fintrack-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } else {
      const headers = ['Date', 'Amount', 'Currency', 'Category', 'Description', 'Merchant'];
      const rows = transactions.map(t => [
        t.date,
        t.amount,
        t.currency,
        categories.find(c => c.id === t.categoryId)?.name || 'Unknown',
        t.description,
        t.merchant || ''
      ]);
      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fintrack-transactions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  return {
    transactions,
    budgets,
    categories,
    rates,
    settings,
    setSettings,
    addTransaction,
    deleteTransaction,
    updateBudget,
    deleteBudget,
    addCategory,
    updateCategory,
    deleteCategory,
    exportData,
    isLoaded
  };
}
