
import React from 'react';
import { UserRole } from '../types';
import { LayoutDashboard, Calendar, Users, Bell, LogOut, CheckCircle2, Wallet } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, role, onLogout, activeTab, setActiveTab }) => {
  const navItems = role === 'ADMIN' ? [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
    { id: 'events', label: 'Eventi', icon: <Calendar size={20} /> },
    { id: 'confirmed-events', label: 'Confermati', icon: <CheckCircle2 size={20} /> },
    { id: 'artists', label: 'Artisti', icon: <Users size={20} /> },
    { id: 'notifications', label: 'Avvisi', icon: <Bell size={20} /> },
  ] : [
    { id: 'my-calendar', label: 'Agenda', icon: <Calendar size={20} /> },
    { id: 'confirmed-events', label: 'Confermati', icon: <CheckCircle2 size={20} /> },
    { id: 'payments', label: 'Guadagni', icon: <Wallet size={20} /> },
    { id: 'notifications', label: 'Avvisi', icon: <Bell size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-amber-900/30" aria-label="Menu laterale">
        <div className="p-8">
          <h1 className="text-2xl theatrical-font font-bold text-amber-400 tracking-wider">TeamFlow</h1>
          <p className="text-[10px] text-amber-200/50 uppercase tracking-[0.3em] mt-1 font-bold">Premium Management</p>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                ? 'bg-amber-600 text-white shadow-xl shadow-amber-900/40 translate-x-1' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-amber-900/20">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3.5 text-rose-400 hover:bg-rose-900/20 rounded-2xl transition-colors font-bold text-sm"
          >
            <LogOut size={20} />
            <span>Esci</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="sticky top-0 h-16 shrink-0 bg-slate-950/80 backdrop-blur-xl border-b border-amber-900/20 flex items-center justify-between px-6 z-40 pt-[env(safe-area-inset-top)] box-content">
          <h2 className="text-lg font-bold theatrical-font text-white">
            {navItems.find(i => i.id === activeTab)?.label || 'TeamFlow'}
          </h2>
          <div className="flex items-center space-x-4">
             <div className="w-8 h-8 rounded-xl bg-indigo-600 border border-amber-400/50 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
              {role === 'ADMIN' ? 'AD' : 'AR'}
            </div>
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto pb-[calc(env(safe-area-inset-bottom)+8rem)] md:pb-8">
            {children}
          </div>
        </main>

        {/* Bottom Navigation Mobile */}
        <nav className="md:hidden shrink-0 bg-slate-900/95 backdrop-blur-2xl border-t border-amber-900/30 flex justify-around items-center px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] fixed bottom-0 left-0 right-0 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[60px] py-1 rounded-2xl transition-all active:scale-90 ${
                activeTab === item.id ? 'text-amber-400' : 'text-slate-500'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${activeTab === item.id ? 'bg-amber-400/10' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[8px] mt-1 uppercase font-black tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
