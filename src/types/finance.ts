export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export type CategoryType = 'expense' | 'income';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
};

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  currency: string;
  categoryId: string;
  description: string;
  merchant?: string;
  tags?: string[];
  receiptUrl?: string;
  isRecurring?: boolean;
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  currency: string;
};

export type UserSettings = {
  baseCurrency: string;
  theme: 'light' | 'dark' | 'system';
  autoCategorize: boolean;
};
