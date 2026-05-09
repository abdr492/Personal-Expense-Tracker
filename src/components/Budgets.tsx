import { useState } from 'react';
import { Target, Trash2, PieChart, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { Budget, UserSettings, Category } from '../types/finance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { formatCurrency, cn } from '../lib/utils';
import { Label } from './ui/label';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './Icon';

interface BudgetsProps {
  budgets: Budget[];
  updateBudget: (b: Budget) => void;
  deleteBudget?: (id: string) => void; 
  categories: Category[];
  settings: UserSettings;
}

export function Budgets({ budgets, updateBudget, deleteBudget, categories, settings }: BudgetsProps) {
  const [newBudget, setNewBudget] = useState({
    categoryId: '',
    amount: '',
  });

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleAddBudget = () => {
    if (!newBudget.categoryId || !newBudget.amount) return;
    updateBudget({
      id: crypto.randomUUID(),
      categoryId: newBudget.categoryId,
      amount: parseFloat(newBudget.amount),
      period: 'monthly',
      currency: settings.baseCurrency
    });
    setNewBudget({ categoryId: '', amount: '' });
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight italic">Budget Allocation</h2>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Planned Expenditure vs Actuals</p>
        </div>
      </header>

      <div className="grid gap-6 md:gap-8 md:grid-cols-12">
        <div className="md:col-span-4">
          <Card className="border border-slate-800 shadow-xl bg-[#111114] rounded-2xl md:sticky md:top-24">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-bold text-white uppercase tracking-widest">Set Capital Limit</CardTitle>
              <CardDescription className="text-[10px] text-slate-500 uppercase tracking-tighter">Define spending boundaries by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 md:space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Classification</Label>
                <Select value={newBudget.categoryId} onValueChange={(v) => setNewBudget(prev => ({...prev, categoryId: v}))}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 h-10 md:h-11 text-xs rounded-lg">
                    <SelectValue placeholder="Select Sector" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111114] border-slate-800">
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="text-xs">{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Monthly Limit ({settings.baseCurrency})</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">$</span>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="pl-8 bg-slate-900 border-slate-800 h-10 md:h-11 text-sm font-bold rounded-lg"
                    value={newBudget.amount}
                    onChange={e => setNewBudget(p => ({...p, amount: e.target.value}))}
                  />
                </div>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 h-11 md:h-12 text-xs font-bold uppercase tracking-widest rounded-xl transition-all" onClick={handleAddBudget}>
                Apply Budget Limit
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8 grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 h-fit">
          <AnimatePresence mode="popLayout">
            {budgets.length > 0 ? budgets.map((budget) => {
              const category = categories.find(c => c.id === budget.categoryId);
              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="border border-slate-800 shadow-lg bg-[#18181B] rounded-2xl overflow-hidden group">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 transition-colors">
                            <Icon name={category?.icon || 'Target'} size={18} />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-bold text-white tracking-tight uppercase leading-none">{category?.name}</CardTitle>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Monthly cycle</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider border-slate-800 text-slate-500">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between text-[10px] mb-3 uppercase font-bold tracking-widest">
                        <span className="text-slate-400">Compliance Track</span>
                        <span className="text-slate-300">{formatCurrency(budget.amount, budget.currency)} LIMIT</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden shadow-inner border border-slate-800/50">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "45%" }} 
                          className="h-full bg-indigo-600 rounded-full"
                        />
                      </div>
                      <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-900">
                        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                          <CheckCircle2 size={12} />
                          On Track
                        </div>
                        {deleteBudget && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-full px-3"
                            onClick={() => deleteBudget(budget.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            }) : (
              <div className="col-span-2 h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20 text-slate-600 group hover:border-slate-700 transition-colors">
                <PieChart size={48} className="opacity-10 group-hover:opacity-20 transition-opacity mb-4" />
                <p className="text-[10px] uppercase font-bold tracking-widest">No active budget allocations</p>
                <p className="text-[10px] text-slate-700 mt-1 uppercase">Define category limits to enable monitoring</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, variant, className, style }: any) {
  return (
    <span 
      style={style}
      className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
        variant === 'outline' ? 'border border-border text-muted-foreground' : 'bg-primary text-primary-foreground',
        className
      )}
    >
      {children}
    </span>
  );
}
