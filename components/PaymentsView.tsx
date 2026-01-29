
import React from 'react';
import { Event, EventStatus } from '../types';
import { CreditCard, Wallet, Clock, CheckCircle, TrendingUp, Calendar, Trophy, BarChart3 } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PaymentsViewProps {
  events: Event[];
  artistId: string;
}

const PaymentsView: React.FC<PaymentsViewProps> = ({ events, artistId }) => {
  const currentYear = new Date().getFullYear();
  
  // Filtra solo gli inviti dell'artista corrente che sono stati confermati
  const myInvitations = events
    .map(e => ({ event: e, invitation: e.invitations.find(i => i.artistId === artistId) }))
    .filter(item => item.invitation !== undefined && item.invitation.status === EventStatus.CONFIRMED);

  // Filtra per l'anno in corso
  const thisYearInvitations = myInvitations.filter(item => 
    new Date(item.event.date).getFullYear() === currentYear
  );

  const totalEarned = myInvitations
    .filter(item => item.invitation?.paymentStatus === 'PAID')
    .reduce((sum, item) => sum + (item.invitation?.fee || 0), 0);

  const pendingPayments = myInvitations
    .filter(item => item.invitation?.paymentStatus === 'PENDING')
    .reduce((sum, item) => sum + (item.invitation?.fee || 0), 0);

  const showsThisYear = thisYearInvitations.length;
  const earningsThisYear = thisYearInvitations.reduce((sum, item) => sum + (item.invitation?.fee || 0), 0);

  // Prepara i dati per il grafico mensile dell'anno corrente
  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  const chartData = months.map((month, index) => {
    const monthEarnings = thisYearInvitations
      .filter(item => new Date(item.event.date).getMonth() === index)
      .reduce((sum, item) => sum + (item.invitation?.fee || 0), 0);
    return { name: month, guadagno: monthEarnings };
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-32">
      <div>
        <h2 className="text-2xl font-bold theatrical-font text-white">I Miei Guadagni</h2>
        <p className="text-slate-500 text-sm uppercase font-black tracking-widest mt-1">Riepilogo performance {currentYear}</p>
      </div>

      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-amber-600 to-amber-900 p-6 rounded-[2.5rem] shadow-2xl border border-amber-400/20 relative overflow-hidden group">
          <Trophy className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform" size={100} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200 mb-2">Show {currentYear}</p>
          <h3 className="text-4xl font-black text-white">{showsThisYear}</h3>
          <p className="text-xs text-amber-200/60 mt-2 font-bold uppercase tracking-tight">Show Confermati</p>
        </div>

        <div className="bg-slate-900/60 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden group">
          <Wallet className="absolute -right-4 -bottom-4 text-slate-800 group-hover:scale-110 transition-transform" size={100} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Guadagno {currentYear}</p>
          <h3 className="text-4xl font-black text-white">€{earningsThisYear.toLocaleString()}</h3>
          <p className="text-xs text-emerald-500 mt-2 font-bold uppercase tracking-tight flex items-center">
            <TrendingUp size={14} className="mr-1" /> Lordo Maturato
          </p>
        </div>

        <div className="bg-slate-900/60 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Da Incassare</p>
           <h3 className="text-4xl font-black text-amber-500">€{pendingPayments.toLocaleString()}</h3>
           <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-tight">Fatture Pendenti</p>
        </div>

        <div className="bg-slate-900/60 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Già Pagato</p>
           <h3 className="text-4xl font-black text-emerald-500">€{totalEarned.toLocaleString()}</h3>
           <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-tight">Totale Storico</p>
        </div>
      </div>

      {/* Grafico Andamento */}
      <section className="bg-slate-900/40 p-8 rounded-[3rem] border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold theatrical-font text-white flex items-center">
            <BarChart3 size={20} className="mr-3 text-amber-500" /> Andamento Mensile
          </h3>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} dy={10} />
              <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} tickFormatter={(val) => `€${val}`} />
              <Tooltip 
                cursor={{fill: '#1e293b', radius: 10}}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#fbbf24', fontWeight: 'bold' }}
              />
              <Bar dataKey="guadagno" radius={[10, 10, 10, 10]} barSize={30}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.guadagno > 0 ? '#fbbf24' : '#334155'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Lista Transazioni Dettagliata */}
      <div className="bg-slate-900/40 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
          <h3 className="text-lg font-bold theatrical-font text-white">Dettaglio Pagamenti</h3>
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
            <CreditCard size={20} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800/50">
                <th className="px-8 py-5 font-black">Evento</th>
                <th className="px-8 py-5 font-black">Data</th>
                <th className="px-8 py-5 font-black text-right">Compenso</th>
                <th className="px-8 py-5 font-black text-center">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {myInvitations.length > 0 ? myInvitations.sort((a,b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime()).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-all group">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{item.event.title}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">{item.event.venueName}</p>
                  </td>
                  <td className="px-8 py-6 text-xs text-slate-400 font-medium">
                    {formatDate(item.event.date)}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-lg font-black text-white">€{item.invitation?.fee.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-lg ${
                      item.invitation?.paymentStatus === 'PAID' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {item.invitation?.paymentStatus === 'PAID' ? (
                        <><CheckCircle size={10} className="mr-2" /> Pagato</>
                      ) : (
                        <><Clock size={10} className="mr-2" /> Attesa</>
                      )}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-600 font-bold italic">
                    Nessun pagamento registrato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsView;
