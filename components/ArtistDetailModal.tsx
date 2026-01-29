
import React from 'react';
import { Artist, Event } from '../types';
import { X, Calendar, Euro, Briefcase, Award, TrendingUp, History } from 'lucide-react';
import { formatDate } from '../utils/helpers';

interface ArtistDetailModalProps {
  artist: Artist;
  events: Event[];
  isOpen: boolean;
  onClose: () => void;
}

const ArtistDetailModal: React.FC<ArtistDetailModalProps> = ({ artist, events, isOpen, onClose }) => {
  if (!isOpen) return null;

  // Filtra gli eventi a cui ha partecipato l'artista
  const artistEvents = events.filter(e => 
    e.invitations.some(inv => inv.artistId === artist.id)
  ).map(e => ({
    event: e,
    invitation: e.invitations.find(inv => inv.artistId === artist.id)!
  })).sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());

  const totalPaid = artistEvents.reduce((sum, item) => sum + item.invitation.fee, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-slate-900 w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-[2.5rem] border border-amber-900/30 shadow-2xl flex flex-col animate-scaleIn">
        
        {/* Header Profilo */}
        <div className="p-8 bg-gradient-to-b from-amber-600/10 to-transparent border-b border-amber-900/10">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-xl border-2 border-amber-400/30">
                {artist.name[0]}
              </div>
              <div>
                <h2 className="text-3xl font-bold theatrical-font text-white">{artist.name}</h2>
                <div className="flex items-center text-amber-400 font-bold uppercase tracking-widest text-[10px] mt-1">
                  <Award size={12} className="mr-1" /> {artist.role}
                </div>
                <p className="text-slate-500 text-sm mt-1">{artist.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-emerald-500/20">
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Totale Pagato</p>
              <p className="text-2xl font-bold text-emerald-400">€{totalPaid.toLocaleString()}</p>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-blue-500/20">
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Eventi Totali</p>
              <p className="text-2xl font-bold text-blue-400">{artistEvents.length}</p>
            </div>
          </div>
        </div>

        {/* Lista Storico */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center">
            <History size={16} className="mr-2" /> Storico Prestazioni e Compensi
          </h3>
          
          <div className="space-y-3">
            {artistEvents.length > 0 ? artistEvents.map(({ event, invitation }, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50 hover:border-amber-500/20 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-slate-900 rounded-xl">
                    <Calendar size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{event.title}</h4>
                    <p className="text-[10px] text-slate-500">{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-amber-400 flex items-center justify-end">
                    <Euro size={14} className="mr-0.5" /> {invitation.fee.toLocaleString()}
                  </div>
                  <p className="text-[9px] uppercase font-bold text-slate-600">{event.venueName}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-600 italic text-sm">
                Nessun evento registrato per questo artista.
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 bg-slate-900 border-t border-amber-900/10">
          <button onClick={onClose} className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-colors">
            Chiudi Scheda
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtistDetailModal;
