
import React, { useEffect, useRef } from 'react';
import { Event, EventStatus, UserRole, Artist } from '../types';
import { formatDate, getStatusColor, getStatusLabel, generateMapsLink, generateWhatsAppLink, generateEmailLink, downloadCalendarFile } from '../utils/helpers';
import { X, MapPin, Clock, Briefcase, Shirt, Truck, CreditCard, CheckCircle2, XCircle, ExternalLink, Trash2, PiggyBank, Euro, Users, TrendingUp, MessageSquare, Mail, CalendarPlus } from 'lucide-react';

interface EventDetailModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  artists?: Artist[]; // Passati per recuperare i contatti
  currentUserId?: string;
  onUpdateStatus?: (status: EventStatus) => void;
  onDeleteEvent?: (id: string) => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, isOpen, onClose, role, artists = [], currentUserId, onUpdateStatus, onDeleteEvent }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isAdmin = role === 'ADMIN';
  const myInvitation = !isAdmin ? event.invitations.find(i => i.artistId === currentUserId) : null;
  const totalArtistFees = event.invitations.reduce((acc, inv) => acc + inv.fee, 0);
  const netProfit = event.revenue - totalArtistFees;

  const handleWhatsAppReminder = (artist: Artist) => {
    const msg = `Ciao ${artist.name}! Ti ricordo l'evento "${event.title}" il giorno ${formatDate(event.date)} alle ore ${event.startTime} presso ${event.venueName}. A presto!`;
    window.open(generateWhatsAppLink(artist.phone || '', msg), '_blank');
  };

  const handleEmailReminder = (artist: Artist) => {
    const subject = `Promemoria Show: ${event.title}`;
    const body = `Ciao ${artist.name},\n\nti ricordo i dettagli per il prossimo evento:\n\nEvento: ${event.title}\nData: ${formatDate(event.date)}\nOra: ${event.startTime}\nLocation: ${event.venueName} (${event.location})\n\nCordiali saluti,\nTeamFlow Agency`;
    window.location.href = generateEmailLink(artist.email, subject, body);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div 
        ref={modalRef}
        role="dialog"
        className="relative bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-amber-900/40 shadow-2xl animate-scaleIn focus:outline-none custom-scrollbar"
      >
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md px-6 py-4 border-b border-amber-900/20 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold theatrical-font text-white">{event.title}</h2>
            <div className="flex items-center space-x-3">
              <p className="text-amber-400 text-sm font-medium">{formatDate(event.date)}</p>
              <button 
                onClick={() => downloadCalendarFile(event)}
                className="flex items-center space-x-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 transition-all"
              >
                <CalendarPlus size={12} /> <span>Salva nel Calendario</span>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <button 
                onClick={() => { if(window.confirm('Eliminare questo evento?')) { onDeleteEvent?.(event.id); onClose(); } }}
                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
                title="Elimina Evento"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X size={24} /></button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Admin financial overview */}
          {isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="bg-slate-950/50 p-4 rounded-2xl border border-blue-500/20">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Incasso Lordo</h4>
                  <p className="text-xl font-bold text-white flex items-center">
                    <Euro size={16} className="mr-1 text-blue-400" /> {event.revenue.toLocaleString()}
                  </p>
               </div>
               <div className="bg-slate-950/50 p-4 rounded-2xl border border-rose-500/20">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Costi Cast</h4>
                  <p className="text-xl font-bold text-rose-400 flex items-center">
                    <Euro size={16} className="mr-1" /> {totalArtistFees.toLocaleString()}
                  </p>
               </div>
               <div className={`p-4 rounded-2xl border ${netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Guadagno Netto</h4>
                  <p className={`text-xl font-bold flex items-center ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                    <PiggyBank size={18} className="mr-1" /> {netProfit.toLocaleString()}
                  </p>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <section className="space-y-4">
              <div className="flex items-start">
                <MapPin className="text-amber-500 mr-3 mt-1" size={20} />
                <div className="flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Location</h3>
                  <p className="text-slate-200">{event.venueName}</p>
                  <p className="text-slate-400 text-sm mb-2">{event.location}</p>
                  <a href={generateMapsLink(event.location)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors bg-amber-950/20 px-2 py-1 rounded border border-amber-900/30">
                    <ExternalLink size={12} className="mr-1" /> APRI IN MAPS
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="text-amber-500 mr-3 mt-1" size={20} />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Orari</h3>
                  <p className="text-slate-200">Show: {event.startTime} ({event.duration})</p>
                  {event.rehearsalTime && <p className="text-slate-400 text-sm">Prove: {event.rehearsalTime}</p>}
                </div>
              </div>
            </section>

            <section className="space-y-4">
               <div className="flex items-start">
                <Truck className="text-amber-500 mr-3 mt-1" size={20} />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Logistica</h3>
                  <p className="text-slate-200">Partenza: {event.logistics.departureTime}</p>
                  <p className="text-slate-400 text-sm">Mezzo: {event.logistics.transportType}</p>
                  {event.logistics.hotel && <p className="text-slate-400 text-sm">Hotel: {event.logistics.hotel}</p>}
                </div>
              </div>
              {!isAdmin && myInvitation && (
                <div className="flex items-start">
                  <CreditCard className="text-emerald-500 mr-3 mt-1" size={20} />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Il Tuo Compenso</h3>
                    <p className="text-emerald-400 font-bold text-lg">€{myInvitation.fee.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {isAdmin && (
            <div className="pt-6 border-t border-amber-900/10">
              <h3 className="text-sm font-bold uppercase text-white mb-4 flex items-center">
                <Users size={18} className="mr-2 text-amber-400" /> Contatti & Invio Promemoria
              </h3>
              <div className="space-y-3">
                {event.invitations.map(inv => {
                  const artist = artists.find(a => a.id === inv.artistId);
                  if (!artist) return null;
                  return (
                    <div key={inv.artistId} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold">{artist.name[0]}</div>
                        <div>
                          <p className="text-sm font-bold text-white">{artist.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase">{artist.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleWhatsAppReminder(artist)}
                          className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                          title="Invia WhatsApp"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button 
                          onClick={() => handleEmailReminder(artist)}
                          className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                          title="Invia Email"
                        >
                          <Mail size={16} />
                        </button>
                        <span className="text-xs font-bold text-rose-400 ml-2">€{inv.fee.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isAdmin && myInvitation && myInvitation.status === EventStatus.PENDING && (
            <div className="pt-8 flex gap-4">
              <button onClick={() => onUpdateStatus?.(EventStatus.CONFIRMED)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all">
                <CheckCircle2 size={20} /> <span>Conferma Partecipazione</span>
              </button>
              <button onClick={() => onUpdateStatus?.(EventStatus.REJECTED)} className="flex-1 bg-rose-700 hover:bg-rose-600 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all">
                <XCircle size={20} /> <span>Rifiuta Invito</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
