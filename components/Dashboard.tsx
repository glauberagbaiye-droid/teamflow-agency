
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area } from 'recharts';
import { Event, Artist } from '../types';
import { safeCopyToClipboard, exportEventsToCSV, formatDate } from '../utils/helpers';
import { DollarSign, Calendar, Star, TrendingUp, Download, Check, Copy, Share2, Trash2, AlertCircle, PiggyBank, Briefcase, BellRing } from 'lucide-react';

interface DashboardProps {
  events: Event[];
  artists: Artist[];
  onSelectEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
  onResetData: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ events, artists, onSelectEvent, onDeleteEvent, onResetData }) => {
  const [copied, setCopied] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const yearlyEvents = events.filter(e => new Date(e.date).getFullYear() === currentYear);

  const totalRevenue = yearlyEvents.reduce((sum, e) => sum + (e.revenue || 0), 0);
  const totalExpenses = yearlyEvents.reduce((sum, e) => {
    return sum + e.invitations.reduce((isum, inv) => isum + inv.fee, 0);
  }, 0);
  const totalProfit = totalRevenue - totalExpenses;

  const confirmedEventsCount = events.filter(e => 
    e.invitations.some(inv => inv.status === 'CONFIRMED')
  ).length;

  // Filtra eventi imminenti (prossimi 2 giorni)
  const imminentEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Monthly breakdown
  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  const monthlyData = months.map((month, index) => {
    const monthEvents = yearlyEvents.filter(e => new Date(e.date).getMonth() === index);
    const revenue = monthEvents.reduce((sum, e) => sum + (e.revenue || 0), 0);
    const expenses = monthEvents.reduce((sum, e) => sum + e.invitations.reduce((isum, inv) => isum + inv.fee, 0), 0);
    return {
      name: month,
      guadagno: revenue - expenses,
      fatturato: revenue
    };
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold theatrical-font text-white">Dashboard Amministrativa</h2>
          <p className="text-slate-500 text-sm">Performance economica anno {currentYear}</p>
        </div>
        <button 
          onClick={() => exportEventsToCSV(events)}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold border border-amber-900/30 transition-all"
        >
          <Download size={16} />
          <span>Esporta Report</span>
        </button>
      </div>

      {/* Sezione Alert Imminenti */}
      {imminentEvents.length > 0 && (
        <section className="bg-amber-600/10 border border-amber-500/30 rounded-[2.5rem] p-6 shadow-2xl animate-pulse-slow">
          <div className="flex items-center space-x-3 mb-4">
            <BellRing className="text-amber-400" size={24} />
            <h3 className="text-lg font-bold theatrical-font text-white">Promemoria Imminenti (Prossime 48h)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {imminentEvents.map(event => (
              <div 
                key={event.id} 
                onClick={() => onSelectEvent(event)}
                className="bg-slate-900/60 p-4 rounded-2xl border border-amber-500/20 hover:border-amber-400 transition-all cursor-pointer flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{event.title}</h4>
                  <p className="text-[10px] text-amber-400 uppercase font-bold">{formatDate(event.date)}</p>
                </div>
                <div className="text-[10px] bg-amber-500 text-black px-2 py-1 rounded-lg font-bold">INVIA AVVISO</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Fatturato Annuo', value: `€${totalRevenue.toLocaleString()}`, icon: <Briefcase className="text-blue-400" />, sub: 'Totale lordo clienti', color: 'border-blue-500/20' },
          { label: 'Costi Artisti', value: `€${totalExpenses.toLocaleString()}`, icon: <DollarSign className="text-rose-400" />, sub: 'Uscite per il cast', color: 'border-rose-500/20' },
          { label: 'Guadagno Netto', value: `€${totalProfit.toLocaleString()}`, icon: <PiggyBank className="text-emerald-400" />, sub: 'Utile dell\'agenzia', color: 'border-emerald-500/20' },
          { label: 'Eventi Gestiti', value: confirmedEventsCount, icon: <Calendar className="text-amber-400" />, sub: `${events.length} totali inseriti`, color: 'border-amber-500/20' },
        ].map((stat, i) => (
          <div key={i} className={`bg-slate-900/40 backdrop-blur-sm p-6 rounded-2xl border ${stat.color} shadow-lg shadow-black/20`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-800/80 rounded-lg">{stat.icon}</div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold theatrical-font text-white mt-1">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-2">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-slate-900/40 p-6 rounded-3xl border border-amber-900/10 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold theatrical-font text-amber-400">Trend Guadagno Netto</h3>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `€${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Area type="monotone" dataKey="guadagno" stroke="#fbbf24" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-slate-900/40 p-6 rounded-3xl border border-amber-900/10 shadow-xl flex flex-col">
          <h3 className="text-lg font-semibold theatrical-font mb-4 text-amber-400">Attività Recente</h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {events.slice(0, 6).map(event => (
              <div key={event.id} className="group flex items-center justify-between p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50 hover:border-amber-500/30 transition-all cursor-pointer" onClick={() => onSelectEvent(event)}>
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="text-sm font-bold text-white truncate">{event.title}</h4>
                  <div className="flex items-center text-[10px] text-slate-500 mt-0.5">
                    <Calendar size={10} className="mr-1" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400">€{event.revenue}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-rose-900/20">
            <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center mb-3">
              <AlertCircle size={12} className="mr-2" /> Manutenzione
            </h4>
            <button 
              onClick={onResetData}
              className="w-full py-2.5 bg-rose-950/20 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-500 hover:text-white transition-all active:scale-95"
            >
              Reset Totale Archivio
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
