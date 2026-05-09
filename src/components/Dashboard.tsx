import { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths } from 'date-fns';
import { Transaction, Budget, UserSettings, Category } from '../types/finance';
import { CURRENCIES } from '../constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { formatCurrency, cn } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, Wallet, PiggyBank, Target } from 'lucide-react';
import { Icon } from './Icon';
import { ExchangeRates } from '../services/currencyService';

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  settings: UserSettings;
  rates: ExchangeRates;
}

export function Dashboard({ transactions, budgets, categories, settings, rates }: DashboardProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const income = currentMonthTransactions
      .filter(t => categories.find(c => c.id === t.categoryId)?.type === 'income')
      .reduce((sum, t) => {
        const rate = rates[t.currency] || 1;
        return sum + (t.amount / rate);
      }, 0);

    const expenses = currentMonthTransactions
      .filter(t => categories.find(c => c.id === t.categoryId)?.type === 'expense')
      .reduce((sum, t) => {
        const rate = rates[t.currency] || 1;
        return sum + (t.amount / rate);
      }, 0);

    const balance = income - expenses;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    return { income, expenses, balance, savingsRate };
  }, [transactions, categories, rates]);

  const categoryData = useMemo(() => {
    const now = new Date();
    const currentMonthExpenses = transactions.filter(t => {
      const date = new Date(t.date);
      const isExpense = categories.find(c => c.id === t.categoryId)?.type === 'expense';
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() && isExpense;
    });

    const expenseCategories = categories.filter(c => c.type === 'expense');
    return expenseCategories.map(cat => {
      const amount = currentMonthExpenses
        .filter(t => t.categoryId === cat.id)
        .reduce((sum, t) => {
          const rate = rates[t.currency] || 1;
          return sum + (t.amount / rate);
        }, 0);
      return {
        name: cat.name,
        value: amount,
        color: cat.color
      };
    }).filter(c => c.value > 0);
  }, [transactions, categories, rates]);

  const trendData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), i);
      return format(date, 'MMM yyyy');
    }).reverse();

    return last6Months.map(month => {
      const monthTransactions = transactions.filter(t => format(new Date(t.date), 'MMM yyyy') === month);
      const income = monthTransactions
        .filter(t => categories.find(c => c.id === t.categoryId)?.type === 'income')
        .reduce((sum, t) => {
          const rate = rates[t.currency] || 1;
          return sum + (t.amount / rate);
        }, 0);
      const expenses = monthTransactions
        .filter(t => categories.find(c => c.id === t.categoryId)?.type === 'expense')
        .reduce((sum, t) => {
          const rate = rates[t.currency] || 1;
          return sum + (t.amount / rate);
        }, 0);
      return { month, income, expenses };
    });
  }, [transactions, categories, rates]);

  const budgetProgress = useMemo(() => {
    const now = new Date();
    return budgets.map(budget => {
      const category = categories.find(c => c.id === budget.categoryId);
      const spent = transactions
        .filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === now.getMonth() && 
                 date.getFullYear() === now.getFullYear() && 
                 t.categoryId === budget.categoryId;
        })
        .reduce((sum, t) => {
          const rate = rates[t.currency] || 1;
          return sum + (t.amount / rate);
        }, 0);
      
      return {
        category: category?.name || 'Unknown',
        spent,
        limit: budget.amount,
        percent: Math.min((spent / budget.amount) * 100, 100),
        color: category?.color || '#ccc'
      };
    });
  }, [transactions, budgets, categories, rates]);

  const StatCard = ({ title, amount, icon: Icon, trend, type }: any) => (
    <Card className="overflow-hidden border border-slate-800 shadow-lg bg-[#18181B] rounded-2xl">
      <CardContent className="p-5 flex flex-col justify-between h-full min-h-[120px]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">{title}</span>
          <div className={`p-1.5 rounded-md ${type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : type === 'expense' ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
            <Icon size={16} />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold tracking-tight text-white">{formatCurrency(amount, settings.baseCurrency)}</h3>
          {trend && (
            <div className={`text-[10px] mt-1 font-medium ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight italic">Financial Overview</h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{format(new Date(), 'MMMM yyyy')} Summary</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-xs text-slate-500">Currency:</span>
            <span className="text-xs font-bold text-white uppercase">{settings.baseCurrency} (${CURRENCIES.find(c => c.code === settings.baseCurrency)?.symbol})</span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Balance" amount={stats.balance} icon={Wallet} type="balance" />
        <StatCard title="Monthly Income" amount={stats.income} icon={ArrowUpRight} type="income" trend={12} />
        <StatCard title="Monthly Spending" amount={stats.expenses} icon={ArrowDownRight} type="expense" trend={-5} />
        <StatCard title="Savings Efficiency" amount={stats.balance > 0 ? stats.savingsRate : 0} icon={PiggyBank} type="savings" trend={2} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border border-slate-800 shadow-md bg-[#18181B] rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold text-white uppercase tracking-widest">Spending Trends by Category</CardTitle>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-400"></div><span className="text-[10px] text-slate-500 font-bold uppercase">Target</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div><span className="text-[10px] text-slate-500 font-bold uppercase">Actual</span></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="income" stroke="#4f46e5" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} name="Income" />
                <Area type="monotone" dataKey="expenses" stroke="#22d3ee" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border border-slate-800 shadow-md bg-[#18181B] rounded-2xl overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-xs font-bold text-white uppercase tracking-widest">Budget Monitors</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col pt-6">
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {budgetProgress.length > 0 ? budgetProgress.map((budget) => (
                <div key={budget.category}>
                  <div className="flex justify-between text-[10px] mb-2 uppercase font-bold tracking-wider">
                    <span className="text-slate-300">{budget.category}</span>
                    <span className="text-slate-500">
                      {formatCurrency(budget.spent, settings.baseCurrency)} / {formatCurrency(budget.limit, settings.baseCurrency)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${budget.percent}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        budget.percent > 90 ? "bg-rose-500" : budget.percent > 70 ? "bg-amber-400" : "bg-indigo-600"
                      )}
                    />
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                  <Target size={32} className="opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No active budgets</p>
                </div>
              )}
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3">Portfolio Distribution</div>
              <div className="flex h-6 w-full rounded-md overflow-hidden">
                <div className="bg-indigo-600 w-[60%]" />
                <div className="bg-indigo-400 w-[25%]" />
                <div className="bg-indigo-200 w-[15%]" />
              </div>
              <div className="flex justify-between text-[8px] uppercase font-bold text-slate-500 mt-2 tracking-widest">
                <span>60% Core</span>
                <span>25% Growth</span>
                <span>15% Alt</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-800 shadow-md bg-[#18181B] rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-bold text-white uppercase tracking-widest">Recent Activity</CardTitle>
            <button className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest">View Full Archive</button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="px-6 space-y-1">
            {transactions.slice(0, 4).map((t) => {
              const category = categories.find(c => c.id === t.categoryId);
              return (
                <div key={t.id} className="flex items-center justify-between py-3 border-b border-slate-900 last:border-0 group cursor-pointer hover:bg-slate-900/50 px-2 -mx-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs group-hover:bg-slate-700 transition-colors">
                      <Icon name={category?.icon || 'Wallet'} size={14} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white tracking-tight">{t.merchant || t.description}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{category?.name} • {t.currency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-sm font-bold tracking-tight", category?.type === 'income' ? 'text-emerald-400' : 'text-white')}>
                      {category?.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, t.currency)}
                    </p>
                    <p className="text-[10px] text-slate-600 font-medium">{format(new Date(t.date), 'MMM dd')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
