
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Event, Artist } from '../types';
import { safeCopyToClipboard, exportEventsToCSV } from '../utils/helpers';
import { DollarSign, Calendar, Star, TrendingUp, Download, Share2, Check, Copy } from 'lucide-react';

interface DashboardProps {
  events: Event[];
  artists: Artist[];
}

const Dashboard: React.FC<DashboardProps> = ({ events, artists }) => {
  const [copied, setCopied] = useState(false);
  
  const totalExpenses = events.reduce((sum, e) => {
    return sum + e.invitations.reduce((isum, inv) => isum + inv.fee, 0);
  }, 0);

  const confirmedEventsCount = events.filter(e => 
    e.invitations.some(inv => inv.status === 'CONFIRMED')
  ).length;

  const chartData = [
    { name: 'Gen', value: 2400 },
    { name: 'Feb', value: 1398 },
    { name: 'Mar', value: 9800 },
    { name: 'Apr', value: 3908 },
    { name: 'Mag', value: totalExpenses },
  ];

  const artistFeesData = artists.map((a, idx) => ({
    name: a.name.split(' ')[0],
    value: events.reduce((sum, e) => {
      const inv = e.invitations.find(i => i.artistId === a.id);
      return sum + (inv ? inv.fee : 0);
    }, 0)
  })).filter(d => d.value > 0);

  const PIE_COLORS = ['#fbbf24', '#f87171', '#818cf8', '#34d399', '#f472b6'];

  const handleCopyLink = async () => {
    const success = await safeCopyToClipboard(window.location.href);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold theatrical-font text-white">Panoramica Nexuop</h2>
          <p className="text-slate-500 text-sm">Monitoraggio performance e budget agenzia</p>
        </div>
        <button 
          onClick={() => exportEventsToCSV(events)}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold border border-amber-900/30 transition-all"
        >
          <Download size={16} />
          <span>Esporta Report Nexuop</span>
        </button>
      </div>

      <div className="bg-gradient-to-r from-amber-900/40 to-indigo-900/40 border border-amber-500/30 rounded-[2rem] p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-amber-600 rounded-2xl shadow-lg">
              <Share2 className="text-white" size={24} />
            </div>
            <div>
              <h4 className="text-white font-bold theatrical-font text-lg">Condividi Nexuop con il Team</h4>
              <p className="text-amber-200/60 text-xs">Copia questo link e invialo ai tuoi artisti.</p>
            </div>
          </div>
          <div className="flex w-full md:w-auto items-center space-x-2 bg-slate-950/50 p-3 rounded-2xl border border-amber-900/30">
            <input 
              readOnly 
              value={window.location.href} 
              className="bg-transparent border-none text-[10px] text-slate-400 w-48 outline-none truncate"
            />
            <button 
              onClick={handleCopyLink}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copiato!' : 'Copia Link'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Spese Totali', value: `€${totalExpenses.toLocaleString()}`, icon: <DollarSign className="text-amber-400" />, sub: '+12.5% vs mese scorso' },
          { label: 'Eventi Confermati', value: confirmedEventsCount, icon: <Calendar className="text-amber-400" />, sub: `${events.length} totali` },
          { label: 'Artisti Attivi', value: artists.length, icon: <Star className="text-amber-400" />, sub: 'Team Nexuop' },
          { label: 'ROI Previsto', value: '28%', icon: <TrendingUp className="text-amber-400" />, sub: 'Performance stabile' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-2xl border border-amber-900/20">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-950/30 rounded-lg">{stat.icon}</div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold theatrical-font text-white mt-1">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-2">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-amber-900/10">
          <h3 className="text-lg font-semibold theatrical-font mb-6 text-amber-400">Andamento Spese</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(251, 191, 36, 0.1)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #78350f', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/40 p-6 rounded-2xl border border-amber-900/10">
          <h3 className="text-lg font-semibold theatrical-font mb-6 text-amber-400">Distribuzione Cachet</h3>
          <div className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={artistFeesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {artistFeesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #78350f', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="hidden sm:block space-y-2 ml-4">
               {artistFeesData.map((d, i) => (
                 <div key={i} className="flex items-center space-x-2 text-sm">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                   <span className="text-slate-400">{d.name}:</span>
                   <span className="font-bold">€{d.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
