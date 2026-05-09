import { Category, Currency } from './types/finance';

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', icon: 'Utensils', color: '#FF6B6B', type: 'expense' },
  { id: '2', name: 'Shopping', icon: 'ShoppingBag', color: '#4DABF7', type: 'expense' },
  { id: '3', name: 'Transport', icon: 'Car', color: '#51CF66', type: 'expense' },
  { id: '4', name: 'Entertainment', icon: 'Film', color: '#FCC419', type: 'expense' },
  { id: '5', name: 'Bills & Utilities', icon: 'Zap', color: '#FF922B', type: 'expense' },
  { id: '6', name: 'Health', icon: 'Heart', color: '#FF8787', type: 'expense' },
  { id: '7', name: 'Travel', icon: 'Plane', color: '#339AF0', type: 'expense' },
  { id: '8', name: 'Education', icon: 'GraduationCap', color: '#845EF7', type: 'expense' },
  { id: '9', name: 'Salary', icon: 'Wallet', color: '#20C997', type: 'income' },
  { id: '10', name: 'Investments', icon: 'TrendingUp', color: '#94D82D', type: 'income' },
  { id: '11', name: 'Freelance', icon: 'Briefcase', color: '#748FFC', type: 'income' },
  { id: '12', name: 'Gift', icon: 'Gift', color: '#F06595', type: 'income' },
];

export const APP_CONFIG = {
  VERSION: '1.0.0',
  AUTH_KEY: 'fintrack_auth',
  EXPENSES_KEY: 'fintrack_expenses',
  BUDGETS_KEY: 'fintrack_budgets',
  SETTINGS_KEY: 'fintrack_settings',
};
