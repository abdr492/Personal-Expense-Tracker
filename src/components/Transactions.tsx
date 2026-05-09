import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Upload, 
  Camera, 
  Brain, 
  Loader2,
  Calendar as CalendarIcon,
  ShoppingBag,
  MoreVertical,
  Download
} from 'lucide-react';
import { Transaction, UserSettings, Category } from '../types/finance';
import { DEFAULT_CATEGORIES, CURRENCIES } from '../constants';
import { categorizeTransaction, scanReceipt } from '../lib/gemini';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { badgeVariants } from './ui/badge';
import { Label } from './ui/label';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import React from 'react';
import { Icon } from './Icon';

interface TransactionsProps {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  categories: Category[];
  settings: UserSettings;
}

export function Transactions({ transactions, addTransaction, deleteTransaction, categories, settings }: TransactionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    currency: settings.baseCurrency,
    categoryId: categories.length > 0 ? categories[0].id : '1',
    description: '',
    merchant: '',
  });

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((name: string, value: string) => {
    switch (name) {
      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.length < 2) return 'Description is too short';
        return '';
      case 'amount':
        if (!value) return 'Amount is required';
        const num = parseFloat(value);
        if (isNaN(num)) return 'Invalid number';
        if (num <= 0) return 'Must be positive';
        return '';
      case 'date':
        if (!value) return 'Date is required';
        const selectedDate = new Date(value);
        if (selectedDate > new Date()) return 'Future date not allowed';
        return '';
      default:
        return '';
    }
  }, []);

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, (formData as any)[name]) }));
  };


  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsScanning(true);
    try {
      const categoryNames = categories.map(c => c.name);
      const scanPromises = acceptedFiles.map(file => {
        return new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64 = (reader.result as string).split(',')[1];
              const result = await scanReceipt(base64, categoryNames);
              
              const category = categories.find(c => 
                c.name.toLowerCase().includes(result.suggestedCategory.toLowerCase())
              );

              // If only one file, update form, else add directly
              if (acceptedFiles.length === 1) {
                setFormData({
                  date: result.date || format(new Date(), 'yyyy-MM-dd'),
                  amount: result.amount.toString(),
                  currency: settings.baseCurrency,
                  categoryId: category?.id || (categories.length > 0 ? categories[0].id : '1'),
                  description: result.description || `Scanned purchase at ${result.merchant}`,
                  merchant: result.merchant || '',
                });
              } else {
                addTransaction({
                  date: result.date || format(new Date(), 'yyyy-MM-dd'),
                  amount: result.amount,
                  currency: settings.baseCurrency,
                  categoryId: category?.id || (categories.length > 0 ? categories[0].id : '1'),
                  description: result.description || `Batch scan: ${result.merchant}`,
                  merchant: result.merchant || '',
                });
              }
            } catch (err) {
              console.error("File scan failed:", err);
            } finally {
              resolve();
            }
          };
          reader.readAsDataURL(file);
        });
      });

      await Promise.all(scanPromises);
      setIsScanning(false);
    } catch (error) {
      console.error("Batch scanning failed:", error);
      setIsScanning(false);
    }
  }, [settings.baseCurrency, addTransaction, categories]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    multiple: true
  } as any);

  const handleAutoCategorize = async () => {
    if (!formData.description) return;
    setIsCategorizing(true);
    const categoryNames = categories.map(c => c.name);
    const categoryName = await categorizeTransaction(formData.description, categoryNames);
    const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (category) {
      setFormData(prev => ({ ...prev, categoryId: category.id }));
    }
    setIsCategorizing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only check fields that have validators
    const newErrors = {
      description: validateField('description', formData.description),
      amount: validateField('amount', formData.amount),
      date: validateField('date', formData.date),
    };
    
    setErrors(newErrors);
    const hasErrors = Object.values(newErrors).some(err => err !== '');

    if (hasErrors) {
      setTouched({ description: true, amount: true, date: true });
      return;
    }

    addTransaction({
      ...formData,
      amount: parseFloat(formData.amount),
    });
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: '',
      currency: settings.baseCurrency,
      categoryId: categories.length > 0 ? categories[0].id : '1',
      description: '',
      merchant: '',
    });
    setErrors({});
    setTouched({});
    setIsAdding(false);
  };

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categories.find(c => c.id === t.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight italic">Transaction Archive</h2>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Comprehensive Ledger History</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-6 h-10 text-xs font-bold uppercase tracking-wider">
                <Plus size={16} className="mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl bg-[#111114] border-slate-800 rounded-2xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-white font-bold uppercase tracking-widest text-sm text-center">New Transaction</DialogTitle>
                <DialogDescription className="text-slate-500 text-center text-xs">AI-categorization and safe-sync enabled.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div 
                  {...getRootProps()} 
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                    isDragActive ? "border-indigo-500 bg-indigo-500/5" : "border-slate-800 hover:border-slate-700 bg-slate-900/50"
                  )}
                >
                  <input {...getInputProps()} />
                  {isScanning ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-indigo-500" />
                      <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Processing Batch Upload...</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-indigo-600/10 rounded-full text-indigo-500">
                        <Camera size={24} />
                      </div>
                      <p className="font-bold text-xs uppercase tracking-widest text-white">Upload Receipt</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Drag or Click to Scan</p>
                    </>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Transaction Detail</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <Input 
                          placeholder="Purpose/Vendor" 
                          value={formData.description}
                          onChange={e => handleFieldChange('description', e.target.value)}
                          onBlur={() => handleBlur('description')}
                          required
                          className={cn(
                            "bg-slate-900 border-slate-800 h-10 text-xs rounded-lg transition-colors",
                            touched.description && errors.description ? "border-rose-500 ring-rose-500/20" : "border-slate-800"
                          )}
                        />
                        {touched.description && errors.description && (
                          <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest ml-1">{errors.description}</p>
                        )}
                      </div>
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={handleAutoCategorize} 
                        disabled={isCategorizing || !formData.description}
                        className="bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border-none h-10"
                      >
                        {isCategorizing ? <Loader2 className="animate-spin" size={16} /> : <Brain size={16} />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Merchant</Label>
                    <Input 
                      placeholder="e.g. Apple, Uber" 
                      value={formData.merchant}
                      onChange={e => setFormData(p => ({...p, merchant: e.target.value}))}
                      className="bg-slate-900 border-slate-800 h-10 text-xs rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Classification</Label>
                    <Select 
                      value={formData.categoryId} 
                      onValueChange={v => setFormData(p => ({...p, categoryId: v}))}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-800 h-10 text-xs rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111114] border-slate-800">
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id} className="text-xs">{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Amount & Currency</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={formData.currency} 
                        onValueChange={v => setFormData(p => ({...p, currency: v}))}
                      >
                        <SelectTrigger className="w-20 bg-slate-900 border-slate-800 h-10 text-xs rounded-lg shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111114] border-slate-800">
                          {CURRENCIES.map(curr => (
                            <SelectItem key={curr.code} value={curr.code} className="text-xs">{curr.code}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex-1 space-y-1">
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          value={formData.amount}
                          onChange={e => handleFieldChange('amount', e.target.value)}
                          onBlur={() => handleBlur('amount')}
                          required
                          className={cn(
                            "bg-slate-900 border-slate-800 h-10 text-xs rounded-lg transition-colors",
                            touched.amount && errors.amount ? "border-rose-500 ring-rose-500/20" : "border-slate-800"
                          )}
                        />
                        {touched.amount && errors.amount && (
                          <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest ml-1">{errors.amount}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Date</Label>
                    <div className="space-y-1">
                      <Input 
                        type="date" 
                        value={formData.date}
                        onChange={e => handleFieldChange('date', e.target.value)}
                        onBlur={() => handleBlur('date')}
                        required
                        className={cn(
                          "bg-slate-900 border-slate-800 h-10 text-xs rounded-lg text-white transition-colors",
                          touched.date && errors.date ? "border-rose-500 ring-rose-500/20" : "border-slate-800"
                        )}
                      />
                      {touched.date && errors.date && (
                        <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest ml-1">{errors.date}</p>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className={cn(
                      "col-span-2 mt-4 rounded-lg h-11 text-xs font-bold uppercase tracking-widest transition-all",
                      Object.values(errors).some(err => err !== '') 
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                        : "bg-indigo-600 hover:bg-indigo-500 text-white"
                    )}
                  >
                    Commit Transaction
                  </Button>
                </form>

              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <Card className="border border-slate-800 shadow-xl bg-[#18181B] rounded-2xl overflow-hidden">
        <CardHeader className="p-6 pb-2">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <Input 
                placeholder="Search ledger entries..." 
                className="pl-12 h-10 bg-slate-900 border-slate-800 rounded-xl text-xs"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 border-slate-800 bg-slate-900 text-slate-400 hover:text-white">
              <Filter size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-6">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-800 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase font-bold text-slate-500 tracking-widest py-4">Entity</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Sector</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Date</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-slate-500 tracking-widest text-right">Magnitude</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredTransactions.map((t) => {
                    const category = categories.find(c => c.id === t.categoryId);
                    return (
                      <motion.tr 
                        key={t.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group border-b border-slate-900 hover:bg-slate-900/50 transition-colors"
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center">
                              <Icon name={category?.icon || 'Wallet'} size={14} className="text-slate-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-white tracking-tight leading-none mb-1">{t.merchant || t.description}</span>
                              {t.merchant && <span className="text-[10px] text-slate-500 font-medium">{t.description}</span>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider bg-slate-800/50 px-2 py-0.5 rounded italic">
                            {category?.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          {format(new Date(t.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-bold text-sm tracking-tight font-mono",
                          category?.type === 'income' ? 'text-emerald-400' : 'text-white'
                        )}>
                          {category?.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, t.currency)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-600 hover:text-rose-500 h-8 w-8 transition-colors"
                            onClick={() => deleteTransaction(t.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
