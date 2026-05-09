/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Settings as SettingsIcon, 
  Plus, 
  Download, 
  TrendingUp, 
  Wallet,
  Globe,
  Menu,
  X
} from 'lucide-react';
import { useFinance } from './hooks/useFinance';
import { CURRENCIES, DEFAULT_CATEGORIES } from './constants';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Budgets } from './components/Budgets';
import { MultiCurrency } from './components/MultiCurrency';
import { Settings } from './components/Settings';
import { Button } from './components/ui/button';
import { TooltipProvider } from './components/ui/tooltip';

type View = 'dashboard' | 'transactions' | 'budgets' | 'multi-currency' | 'settings';

export default function App() {
  const { 
    transactions, 
    budgets, 
    categories,
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
    rates,
    isLoaded 
  } = useFinance();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isLoaded) return null;

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
        currentView === view 
          ? 'bg-indigo-600/10 text-indigo-400' 
          : 'text-slate-400 hover:text-white'
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  return (
    <TooltipProvider>
      <div className={`min-h-screen flex bg-background ${settings.theme === 'dark' ? 'dark' : ''}`}>
        {/* Sidebar for Desktop */}
        <aside className="hidden md:flex flex-col w-64 border-r border-border p-6 bg-card sticky top-0 h-screen">
          <div className="flex items-center gap-3 mb-10 px-2 text-white">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight">FinTrack Elite</h1>
          </div>

          <nav className="flex flex-col gap-1 flex-1">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="transactions" icon={Receipt} label="Transactions" />
            <NavItem view="budgets" icon={PieChart} label="Budgets" />
            <NavItem view="multi-currency" icon={Globe} label="Multi-Currency" />
            <NavItem view="settings" icon={SettingsIcon} label="Settings" />
          </nav>

          <div className="mt-auto space-y-4 pt-6 border-t border-slate-800">
            <div className="p-4 bg-[#18181B] border border-slate-800 rounded-xl">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Sync Status</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-xs text-slate-300 font-medium">Synced & Secure</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3">
              <div className="w-8 h-8 rounded-full bg-slate-700"></div>
              <div>
                <div className="text-xs font-semibold text-white">Alex Sterling</div>
                <div className="text-[10px] text-slate-500">Premium Member</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-slate-800 bg-[#111114] z-50 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="font-bold text-white">FinTrack Elite</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-400">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden fixed inset-x-0 top-16 bottom-0 bg-background z-40 p-6 flex flex-col gap-4"
            >
              <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem view="transactions" icon={Receipt} label="Transactions" />
              <NavItem view="budgets" icon={PieChart} label="Budgets" />
              <NavItem view="multi-currency" icon={Globe} label="Multi-Currency" />
              <NavItem view="settings" icon={SettingsIcon} label="Settings" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 pt-24 md:pt-10 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {currentView === 'dashboard' && (
                  <Dashboard 
                    transactions={transactions} 
                    budgets={budgets} 
                    categories={categories}
                    settings={settings} 
                    rates={rates}
                  />
                )}
                {currentView === 'transactions' && (
                  <Transactions 
                    transactions={transactions} 
                    addTransaction={addTransaction} 
                    deleteTransaction={deleteTransaction} 
                    categories={categories}
                    settings={settings} 
                  />
                )}
                {currentView === 'budgets' && (
                  <Budgets 
                    budgets={budgets} 
                    updateBudget={updateBudget} 
                    deleteBudget={deleteBudget} 
                    categories={categories}
                    settings={settings} 
                  />
                )}
                {currentView === 'multi-currency' && (
                  <MultiCurrency 
                    transactions={transactions} 
                    settings={settings} 
                    rates={rates}
                  />
                )}
                {currentView === 'settings' && (
                  <Settings 
                    settings={settings} 
                    setSettings={setSettings} 
                    categories={categories}
                    addCategory={addCategory}
                    updateCategory={updateCategory}
                    deleteCategory={deleteCategory}
                    exportData={exportData} 
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

