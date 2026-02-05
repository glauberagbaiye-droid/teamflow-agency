
import React from 'react';
import { UserRole } from '../types';
import { LayoutDashboard, Calendar, Users, Bell, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, role, onLogout, activeTab, setActiveTab }) => {
  const navItems = (role === 'ADMIN' || role === 'SUPER_ADMIN') ? [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'events', label: 'Eventi', icon: <Calendar size={20} /> },
    { id: 'artists', label: 'Artisti', icon: <Users size={20} /> },
    { id: 'notifications', label: 'Notifiche', icon: <Bell size={20} /> },
  ] : [
    { id: 'my-calendar', label: 'Calendario', icon: <Calendar size={20} /> },
    { id: 'my-payments', label: 'Pagamenti', icon: <Users size={20} /> },
    { id: 'notifications', label: 'Notifiche', icon: <Bell size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-amber-900/30" aria-label="Menu laterale">
        <div className="p-6">
          <h1 className="text-2xl theatrical-font font-bold text-amber-400 tracking-wider">Nexuop</h1>
          <p className="text-[10px] text-amber-200/50 uppercase tracking-[0.2em] mt-1">
            Show Management 
            {role === 'SUPER_ADMIN' && <span className="text-rose-400 ml-1 font-bold">• SUPER ADMIN</span>}
          </p>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-amber-900/20">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-rose-400 hover:bg-rose-900/20 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 shrink-0 bg-slate-900/50 backdrop-blur-md border-b border-amber-900/20 flex items-center justify-between px-6 z-10 pt-[env(safe-area-inset-top)] box-content">
          <h2 className="text-xl font-semibold theatrical-font">
            {navItems.find(i => i.id === activeTab)?.label || 'Nexuop'}
          </h2>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`p-2 relative active:scale-95 transition-transform ${activeTab === 'notifications' ? 'text-amber-400' : 'text-slate-400'}`}
            >
              <Bell size={22} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-950"></span>
            </button>
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shadow-sm ${role === 'SUPER_ADMIN' ? 'bg-rose-600 border-white' : 'bg-indigo-600 border-amber-400'}`}>
              {role === 'SUPER_ADMIN' ? 'SA' : role === 'ADMIN' ? 'AD' : 'AR'}
            </div>
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="max-w-7xl mx-auto pb-24 md:pb-8">
            {children}
          </div>
        </main>

        <nav className="md:hidden shrink-0 bg-slate-900/90 backdrop-blur-lg border-t border-amber-900/30 flex justify-around items-center px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] fixed bottom-0 left-0 right-0 z-50">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all active:scale-90 ${
                activeTab === item.id ? 'text-amber-400 bg-amber-400/5' : 'text-slate-500'
              }`}
            >
              <div className={activeTab === item.id ? 'scale-110 transition-transform' : ''}>
                {item.icon}
              </div>
              <span className="text-[10px] mt-1 uppercase font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center w-16 py-1 text-rose-500 active:scale-90"
          >
            <LogOut size={20} />
            <span className="text-[10px] mt-1 uppercase font-bold tracking-tight">Esci</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
