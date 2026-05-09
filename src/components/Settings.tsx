import { useState } from 'react';
import { Moon, Sun, Monitor, Globe, Bell, Shield, Database, Trash2, Github, Plus, Tag, Pencil } from 'lucide-react';
import { UserSettings, Category } from '../types/finance';
import { CURRENCIES, APP_CONFIG } from '../constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from './ui/dialog';

interface SettingsProps {
  settings: UserSettings;
  setSettings: (s: UserSettings) => void;
  categories: Category[];
  addCategory: (c: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  exportData: (format: 'json' | 'csv') => void;
}

export function Settings({ settings, setSettings, categories, addCategory, updateCategory, deleteCategory, exportData }: SettingsProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#4f46e5',
    icon: 'Tag',
    type: 'expense' as 'income' | 'expense'
  });

  const clearData = () => {
    if (confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      localStorage.removeItem(APP_CONFIG.EXPENSES_KEY);
      localStorage.removeItem(APP_CONFIG.BUDGETS_KEY);
      localStorage.removeItem('fintrack_categories');
      window.location.reload();
    }
  };

  const handleCategorySubmit = () => {
    if (!categoryForm.name) return;
    if (editingCategory) {
      updateCategory(editingCategory.id, categoryForm);
      setEditingCategory(null);
    } else {
      addCategory(categoryForm);
    }
    setCategoryForm({ name: '', color: '#4f46e5', icon: 'Tag', type: 'expense' });
    setIsAddingCategory(false);
  };

  const startEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      type: cat.type
    });
    setIsAddingCategory(true);
  };

  return (
    <div className="space-y-8">
      <header className="pb-6 border-b border-slate-800">
        <h2 className="text-xl font-semibold text-white tracking-tight italic">System Configuration</h2>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Preferences & Data Management</p>
      </header>

      <div className="grid gap-8 max-w-4xl">
        {/* General Preferences */}
        <Card className="border border-slate-800 shadow-xl bg-[#18181B] rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Globe size={14} className="text-indigo-400" />
              General Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-900 pb-6">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Base Currency</Label>
                <p className="text-[10px] text-slate-500 uppercase">Default localization for financial reports.</p>
              </div>
              <Select 
                value={settings.baseCurrency} 
                onValueChange={(v) => setSettings({...settings, baseCurrency: v})}
              >
                <SelectTrigger className="w-32 bg-slate-900 border-slate-800 h-10 text-xs rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111114] border-slate-800">
                  {CURRENCIES.map(curr => (
                    <SelectItem key={curr.code} value={curr.code} className="text-xs">
                      {curr.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Intelligence</Label>
                <p className="text-[10px] text-slate-500 uppercase tracking-tight">Auto-classify transactions via Gemini Pro Vision.</p>
              </div>
              <Switch 
                checked={settings.autoCategorize} 
                onCheckedChange={(v) => setSettings({...settings, autoCategorize: v})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Management */}
        <Card className="border border-slate-800 shadow-xl bg-[#18181B] rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Tag size={14} className="text-indigo-400" />
                Category Architecture
              </CardTitle>
              <CardDescription className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">Manage semantic classification system.</CardDescription>
            </div>
            <Dialog open={isAddingCategory} onOpenChange={(open) => {
              setIsAddingCategory(open);
              if (!open) setEditingCategory(null);
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                  <Plus size={14} className="mr-1.5" /> New Sector
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#111114] border-slate-800 text-white rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold uppercase tracking-widest">{editingCategory ? 'Modify Sector' : 'Architect New Sector'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Sector Name</Label>
                    <Input 
                      value={categoryForm.name} 
                      onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                      className="bg-slate-900 border-slate-800 h-10 text-xs"
                      placeholder="e.g. Infrastructure, Leisure"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Operation Type</Label>
                      <Select 
                        value={categoryForm.type} 
                        onValueChange={(v: any) => setCategoryForm({...categoryForm, type: v})}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-800 h-10 text-xs text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111114] border-slate-800">
                          <SelectItem value="expense" className="text-xs">Expense</SelectItem>
                          <SelectItem value="income" className="text-xs">Income</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Visual Identifier (Hex)</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={categoryForm.color} 
                          onChange={e => setCategoryForm({...categoryForm, color: e.target.value})}
                          className="w-10 h-10 p-1 bg-slate-900 border-slate-800 rounded-lg cursor-pointer"
                        />
                        <Input 
                          value={categoryForm.color} 
                          onChange={e => setCategoryForm({...categoryForm, color: e.target.value})}
                          className="bg-slate-900 border-slate-800 h-10 text-xs flex-1 font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCategorySubmit} className="bg-indigo-600 hover:bg-indigo-500 w-full h-11 text-xs font-bold uppercase tracking-widest">
                    {editingCategory ? 'Commit Modifications' : 'Initialize Sector'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.map((cat) => (
                <div key={cat.id} className="group flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                      <Tag size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white tracking-tight uppercase">{cat.name}</p>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{cat.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-white" onClick={() => startEdit(cat)}>
                      <Pencil size={12} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-rose-500" onClick={() => deleteCategory(cat.id)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export & Data Control */}
        <Card className="border border-slate-800 shadow-xl bg-[#18181B] rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Database size={14} className="text-indigo-400" />
              Data Sovereignty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-900 pb-6">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Export Ledger</Label>
                <p className="text-[10px] text-slate-500 uppercase">Extract your financial data in structured formats.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => exportData('json')} className="h-9 border-slate-800 bg-slate-900 text-[10px] font-bold uppercase tracking-widest hover:text-white">JSON</Button>
                <Button variant="outline" size="sm" onClick={() => exportData('csv')} className="h-9 border-slate-800 bg-slate-900 text-[10px] font-bold uppercase tracking-widest hover:text-white">CSV</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl">
              <div className="space-y-1">
                <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">Wipe Local Cluster</p>
                <p className="text-[10px] text-rose-500/60 uppercase">Permanent destruction of all local data nodes.</p>
              </div>
              <Button variant="destructive" size="sm" onClick={clearData} className="h-9 rounded-lg px-4 text-[10px] font-bold uppercase tracking-widest bg-rose-600 hover:bg-rose-500">Purge Data</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center justify-center gap-4 py-10 opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
            <Shield size={12} fill="currentColor" className="opacity-50" />
            Zero-Knowledge Architecture • Edge Computing Only
          </p>
        </div>
      </div>
    </div>
  );
}

function ThemeButton({ active, onClick, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg transition-all",
        active ? "bg-slate-800 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
      )}
    >
      <Icon size={16} />
    </button>
  );
}
