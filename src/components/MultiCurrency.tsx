import { useMemo } from 'react';
import { Transaction, UserSettings } from '../types/finance';
import { CURRENCIES } from '../constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { formatCurrency } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Globe, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { ExchangeRates } from '../services/currencyService';

interface MultiCurrencyProps {
  transactions: Transaction[];
  settings: UserSettings;
  rates: ExchangeRates;
}

export function MultiCurrency({ transactions, settings, rates }: MultiCurrencyProps) {
  const currencyAnalysis = useMemo(() => {
    const balances: Record<string, number> = {};
    
    // Group transactions by currency
    transactions.forEach(t => {
      if (!balances[t.currency]) balances[t.currency] = 0;
      balances[t.currency] += t.amount;
    });

    const data = Object.entries(balances).map(([code, amount]) => {
      const currency = CURRENCIES.find(c => c.code === code);
      // Convert to base currency for the chart
      // If code is the base currency, rate is 1. 
      // Otherwise, amount / rates[code] gives value in base currency
      const rateToTarget = rates[code] || 1;
      const baseValue = amount / rateToTarget;
      
      return {
        name: code,
        value: Math.abs(baseValue), // Use absolute for chart
        actualBalance: amount,
        symbol: currency?.symbol || '',
        fullName: currency?.name || code
      };
    }).filter(d => d.value > 0);

    return data;
  }, [transactions, settings.baseCurrency, rates]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 md:pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight italic">Multi-Currency Exposure</h2>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Global Portfolio Distribution</p>
        </div>
        <div className="flex items-center w-fit gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full">
          <ArrowRightLeft size={12} className="text-indigo-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base: {settings.baseCurrency}</span>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Exposure Chart */}
        <div className="md:col-span-12 lg:col-span-7">
          <Card className="border border-slate-800 shadow-xl bg-[#18181B] rounded-2xl overflow-hidden h-full">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-white uppercase tracking-widest">Balance Distribution</CardTitle>
              <CardDescription className="text-[10px] text-slate-500 uppercase tracking-tighter">Value normalized to {settings.baseCurrency}</CardDescription>
            </CardHeader>
            <CardContent className="h-64 sm:h-80 pt-0">
              {currencyAnalysis.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currencyAnalysis}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {currencyAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111114', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                  <Globe size={48} className="opacity-10" />
                  <p className="text-[10px] uppercase font-bold tracking-widest">No global data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Currency Details */}
        <div className="md:col-span-12 lg:col-span-5 flex flex-col gap-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Holdings by Asset</h3>
          {currencyAnalysis.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border border-slate-800 shadow-lg bg-slate-900/40 hover:bg-slate-900/60 transition-colors rounded-xl overflow-hidden group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-inner" style={{ backgroundColor: `${COLORS[index % COLORS.length]}20`, color: COLORS[index % COLORS.length] }}>
                      <span className="font-bold text-sm tracking-tighter">{item.symbol}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white tracking-tight uppercase">{item.fullName}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{item.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white tracking-tight font-mono">{formatCurrency(item.actualBalance, item.name)}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight mt-1 flex items-center justify-end gap-1">
                      <TrendingUp size={10} className="text-emerald-500" />
                      ≈ {formatCurrency(item.value, settings.baseCurrency)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {currencyAnalysis.length === 0 && (
            <div className="h-40 border border-slate-800 border-dashed rounded-xl flex items-center justify-center text-slate-700">
              <p className="text-[10px] uppercase font-bold tracking-widest italic">Global ledger holds no record...</p>
            </div>
          )}
        </div>
      </div>

      {/* Exchange Rate Matrix */}
      <Card className="border border-slate-800 shadow-xl bg-[#111114] rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-slate-900">
          <CardTitle className="text-xs font-bold text-white uppercase tracking-widest">Global Market Indicators</CardTitle>
          <CardDescription className="text-[10px] text-slate-500 uppercase tracking-tighter">Live valuation relative to {settings.baseCurrency}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y md:divide-y-0 divide-slate-900 border-b border-slate-900 last:border-0 border-r border-slate-900">
            {CURRENCIES.map(curr => {
              const rate = rates[curr.code] || 1;
              return (
                <div key={curr.code} className="p-4 md:p-6 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-900/50 transition-colors border-r border-slate-900 last:border-r-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{curr.code} / {settings.baseCurrency}</span>
                  <span className="text-base md:text-lg font-bold text-white tracking-tighter font-mono">{rate.toFixed(4)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
