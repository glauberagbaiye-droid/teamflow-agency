
import React, { useEffect, useRef } from 'react';
import { Event, EventStatus, UserRole } from '../types';
import { formatDate, getStatusColor, getStatusLabel, generateMapsLink } from '../utils/helpers';
import { X, MapPin, Clock, Briefcase, Shirt, Truck, CreditCard, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

interface EventDetailModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  currentUserId?: string;
  onUpdateStatus?: (status: EventStatus) => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, isOpen, onClose, role, currentUserId, onUpdateStatus }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the modal when it opens for screen readers
      modalRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isAdmin = role === 'ADMIN';
  const myInvitation = !isAdmin ? event.invitations.find(i => i.artistId === currentUserId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="relative bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-amber-900/40 shadow-2xl animate-scaleIn focus:outline-none"
      >
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md px-6 py-4 border-b border-amber-900/20 flex justify-between items-center z-10">
          <div>
            <h2 id="modal-title" className="text-2xl font-bold theatrical-font text-white">{event.title}</h2>
            <p className="text-amber-400 text-sm font-medium">{formatDate(event.date)}</p>
          </div>
          <button 
            onClick={onClose} 
            aria-label="Chiudi finestra"
            className="p-2 hover:bg-slate-800 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <section className="space-y-4" aria-label="Dettagli Luogo e Orario">
              <div className="flex items-start">
                <MapPin className="text-amber-500 mr-3 mt-1" size={20} aria-hidden="true" />
                <div className="flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Location</h3>
                  <p className="text-slate-200">{event.venueName}</p>
                  <p className="text-slate-400 text-sm mb-2">{event.location}</p>
                  <a 
                    href={generateMapsLink(event.location)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors bg-amber-950/20 px-2 py-1 rounded border border-amber-900/30 focus-visible:outline-amber-400"
                  >
                    <ExternalLink size={12} className="mr-1" aria-hidden="true" />
                    APRI IN MAPS
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="text-amber-500 mr-3 mt-1" size={20} aria-hidden="true" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Orari</h3>
                  <p className="text-slate-200">Show: {event.startTime} ({event.duration})</p>
                  {event.rehearsalTime && <p className="text-slate-400 text-sm">Prove: {event.rehearsalTime}</p>}
                </div>
              </div>
            </section>

            <section className="space-y-4" aria-label="Logistica e Compenso">
               <div className="flex items-start">
                <Truck className="text-amber-500 mr-3 mt-1" size={20} aria-hidden="true" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Logistica</h3>
                  <p className="text-slate-200">Partenza: {event.logistics.departureTime}</p>
                  <p className="text-slate-400 text-sm">Mezzo: {event.logistics.transportType}</p>
                  {event.logistics.hotel && <p className="text-slate-400 text-sm">Hotel: {event.logistics.hotel}</p>}
                </div>
              </div>
              {!isAdmin && myInvitation && (
                <div className="flex items-start">
                  <CreditCard className="text-emerald-500 mr-3 mt-1" size={20} aria-hidden="true" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Compenso</h3>
                    <p className="text-emerald-400 font-bold">€{myInvitation.fee}</p>
                    <p className="text-slate-400 text-xs">Stato: {myInvitation.paymentStatus}</p>
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-amber-900/10">
            <div>
              <div className="flex items-center mb-3">
                <Briefcase className="text-amber-400 mr-2" size={18} aria-hidden="true" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">Attrezzatura</h3>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl text-slate-300 text-sm border border-slate-700">
                {event.equipment || 'Nessuna specifica'}
              </div>
            </div>
            <div>
              <div className="flex items-center mb-3">
                <Shirt className="text-amber-400 mr-2" size={18} aria-hidden="true" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">Abbigliamento</h3>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl text-slate-300 text-sm border border-slate-700">
                {event.costumes || 'Abbigliamento libero'}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-amber-900/10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-3">Dettagli Evento</h3>
            <p className="text-slate-400 leading-relaxed italic">{event.description || 'Nessuna descrizione fornita.'}</p>
          </div>

          {isAdmin && (
            <div className="pt-6 border-t border-amber-900/10">
               <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">Stato Partecipanti</h3>
               <div className="space-y-3" role="list">
                 {event.invitations.map((inv, idx) => (
                   <div key={idx} role="listitem" className="flex items-center justify-between bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                     <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs" aria-hidden="true">U{inv.artistId}</div>
                        <div>
                          <p className="text-sm font-medium">Artista ID {inv.artistId}</p>
                          <p className="text-[10px] text-slate-500 uppercase">Cachet: €{inv.fee}</p>
                        </div>
                     </div>
                     <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${getStatusColor(inv.status)}`}>
                       {getStatusLabel(inv.status)}
                     </span>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {!isAdmin && myInvitation && myInvitation.status === EventStatus.PENDING && (
            <div className="pt-8 flex gap-4">
              <button 
                onClick={() => onUpdateStatus?.(EventStatus.CONFIRMED)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/20 transition-all focus-visible:ring-offset-2 focus-visible:ring-emerald-400"
              >
                <CheckCircle2 size={20} aria-hidden="true" />
                <span>Conferma Presenza</span>
              </button>
              <button 
                onClick={() => onUpdateStatus?.(EventStatus.REJECTED)}
                className="flex-1 bg-rose-700 hover:bg-rose-600 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-rose-900/20 transition-all focus-visible:ring-offset-2 focus-visible:ring-rose-400"
              >
                <XCircle size={20} aria-hidden="true" />
                <span>Rifiuta Invito</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
