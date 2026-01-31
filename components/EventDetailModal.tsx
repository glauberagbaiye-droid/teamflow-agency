
import React, { useEffect, useRef, useState } from 'react';
import { Event, EventStatus, UserRole, Artist } from '../types';
import { formatDate, getStatusColor, getStatusLabel, generateMapsLink, generateWhatsAppLink, generateEmailLink, downloadCalendarFile, safeCopyToClipboard } from '../utils/helpers';
import { X, MapPin, Clock, Briefcase, Shirt, Truck, CreditCard, CheckCircle2, XCircle, ExternalLink, Trash2, PiggyBank, Euro, Users, TrendingUp, MessageSquare, Mail, CalendarPlus, Wand2, Loader2, Copy, Check } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface EventDetailModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  artists?: Artist[];
  currentUserId?: string;
  onUpdateStatus?: (status: EventStatus) => void;
  onDeleteEvent?: (id: string) => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, isOpen, onClose, role, artists = [], currentUserId, onUpdateStatus, onDeleteEvent }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null); // artistId
  const [generatedInvite, setGeneratedInvite] = useState<{id: string, text: string} | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const generateAIInvite = async (artist: Artist) => {
    setIsGenerating(artist.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Sei un esperto booker di un'agenzia di spettacolo premium chiamata Nexuop. 
      Scrivi un invito professionale ed entusiasta per l'artista ${artist.name} (ruolo: ${artist.role}) per l'evento "${event.title}".
      Dettagli:
      - Data: ${formatDate(event.date)}
      - Ora show: ${event.startTime}
      - Location: ${event.venueName}, ${event.location}
      - Compenso: €${event.invitations.find(i => i.artistId === artist.id)?.fee}
      
      Il tono deve essere formale ma caloroso. Includi una call to action per confermare tramite l'app.
      Scrivi solo il corpo del messaggio, senza oggetto.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const text = response.text || '';
      setGeneratedInvite({ id: artist.id, text });
    } catch (error) {
      console.error("AI Error:", error);
      alert("Errore nella generazione dell'invito. Riprova.");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleSendAction = (type: 'WA' | 'MAIL', artist: Artist, text: string) => {
    if (type === 'WA') {
      window.open(generateWhatsAppLink(artist.phone || '', text), '_blank');
    } else {
      const subject = `Invito Ufficiale: ${event.title}`;
      window.open(generateEmailLink(artist.email, subject, text), '_blank');
    }
  };

  const handleCopy = async (text: string, id: string) => {
    const success = await safeCopyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div 
        ref={modalRef}
        role="dialog"
        className="relative bg-slate-900 w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-[2.5rem] border border-amber-900/40 shadow-2xl animate-scaleIn focus:outline-none custom-scrollbar"
      >
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md px-6 py-4 border-b border-amber-900/20 flex justify-between items-center z-10 shrink-0">
          <div>
            <h2 className="text-xl font-bold theatrical-font text-white truncate max-w-[200px] sm:max-w-none">{event.title}</h2>
            <div className="flex items-center space-x-3">
              <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest">{formatDate(event.date)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <button 
                onClick={() => { if(window.confirm('Eliminare questo evento?')) { onDeleteEvent?.(event.id); onClose(); } }}
                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"><X size={24} /></button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {isAdmin && (
            <div className="grid grid-cols-3 gap-3">
               <div className="bg-slate-950/50 p-3 rounded-2xl border border-blue-500/20 text-center">
                  <h4 className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Lordo</h4>
                  <p className="text-sm font-bold text-white">€{event.revenue}</p>
               </div>
               <div className="bg-slate-950/50 p-3 rounded-2xl border border-rose-500/20 text-center">
                  <h4 className="text-[8px] font-black uppercase tracking-widest text-slate-500">Costi</h4>
                  <p className="text-sm font-bold text-rose-400">€{totalArtistFees}</p>
               </div>
               <div className={`p-3 rounded-2xl border text-center ${netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                  <h4 className="text-[8px] font-black uppercase tracking-widest text-slate-500">Netto</h4>
                  <p className={`text-sm font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>€{netProfit}</p>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <section className="space-y-4">
              <div className="flex items-start">
                <div className="p-2 bg-amber-500/10 rounded-lg mr-3 text-amber-500"><MapPin size={18} /></div>
                <div className="flex-1">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Location</h3>
                  <p className="text-sm font-bold text-slate-200">{event.venueName}</p>
                  <p className="text-slate-500 text-xs mb-2">{event.location}</p>
                  <a href={generateMapsLink(event.location)} target="_blank" className="text-[9px] font-black text-amber-400 uppercase tracking-widest hover:underline">Vedi Mappa</a>
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-2 bg-amber-500/10 rounded-lg mr-3 text-amber-500"><Clock size={18} /></div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Orari</h3>
                  <p className="text-sm font-bold text-slate-200">Show: {event.startTime} ({event.duration})</p>
                  {event.rehearsalTime && <p className="text-slate-500 text-xs">Prove: {event.rehearsalTime}</p>}
                </div>
              </div>
            </section>

            <section className="space-y-4">
               <div className="flex items-start">
                <div className="p-2 bg-amber-500/10 rounded-lg mr-3 text-amber-500"><Truck size={18} /></div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Logistica</h3>
                  <p className="text-sm font-bold text-slate-200">Partenza: {event.logistics.departureTime}</p>
                  <p className="text-slate-500 text-xs uppercase">{event.logistics.transportType}</p>
                </div>
              </div>
              {!isAdmin && myInvitation && (
                <div className="flex items-start">
                  <div className="p-2 bg-emerald-500/10 rounded-lg mr-3 text-emerald-500"><CreditCard size={18} /></div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Compenso</h3>
                    <p className="text-emerald-400 font-bold text-lg leading-none">€{myInvitation.fee}</p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {isAdmin && (
            <div className="pt-6 border-t border-amber-900/10">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-5 flex items-center">
                <Users size={16} className="mr-2 text-amber-400" /> Casting & Inviti AI
              </h3>
              <div className="space-y-4">
                {event.invitations.map(inv => {
                  const artist = artists.find(a => a.id === inv.artistId);
                  if (!artist) return null;
                  const isCurrentGenerating = isGenerating === artist.id;
                  const hasInvite = generatedInvite?.id === artist.id;

                  return (
                    <div key={inv.artistId} className="bg-slate-950/30 p-5 rounded-[2rem] border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg">{artist.name[0]}</div>
                          <div>
                            <p className="text-sm font-bold text-white">{artist.name}</p>
                            <p className="text-[9px] text-slate-500 uppercase font-black">€{inv.fee} • {artist.role}</p>
                          </div>
                        </div>
                        <button 
                          disabled={!!isGenerating}
                          onClick={() => generateAIInvite(artist)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                            hasInvite ? 'bg-amber-600 text-white' : 'bg-slate-800 text-amber-400 border border-amber-900/30 hover:bg-slate-700'
                          }`}
                        >
                          {isCurrentGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                          <span>{hasInvite ? 'Rigenera' : 'Invito AI'}</span>
                        </button>
                      </div>

                      {hasInvite && (
                        <div className="bg-slate-900/80 p-4 rounded-2xl border border-amber-500/20 animate-fadeIn">
                          <p className="text-xs text-slate-300 leading-relaxed italic mb-4">"{generatedInvite.text.substring(0, 100)}..."</p>
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => handleSendAction('WA', artist, generatedInvite.text)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95"
                            >
                              <MessageSquare size={16} /> <span className="text-[9px] font-black uppercase">WhatsApp</span>
                            </button>
                            <button 
                              onClick={() => handleSendAction('MAIL', artist, generatedInvite.text)}
                              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95"
                            >
                              <Mail size={16} /> <span className="text-[9px] font-black uppercase">Email</span>
                            </button>
                            <button 
                              onClick={() => handleCopy(generatedInvite.text, artist.id)}
                              className="bg-slate-800 text-slate-300 p-3 rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95 border border-slate-700"
                            >
                              {copiedId === artist.id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                              <span className="text-[9px] font-black uppercase">Copia</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isAdmin && myInvitation && myInvitation.status === EventStatus.PENDING && (
            <div className="flex gap-4 pb-4">
              <button onClick={() => onUpdateStatus?.(EventStatus.CONFIRMED)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-95 text-xs uppercase">
                <CheckCircle2 size={18} /> <span>Accetta Invito</span>
              </button>
              <button onClick={() => onUpdateStatus?.(EventStatus.REJECTED)} className="flex-1 bg-rose-700 hover:bg-rose-600 text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-95 text-xs uppercase">
                <XCircle size={18} /> <span>Rifiuta</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
