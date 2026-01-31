
import React, { useState, useMemo } from 'react';
import { Event, Artist, EventStatus, TravelLogistics } from '../types';
import { X, Calendar, MapPin, Clock, Truck, Users, Save, Wand2, Loader2, Euro, TrendingUp, PiggyBank, Share2, CalendarPlus, CheckCircle2, AlertTriangle, Smartphone, Apple, Check } from 'lucide-react';
import { generateGoogleCalendarLink, syncAllEventsToMobile } from '../utils/helpers';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  artists: Artist[];
}

type ModalStep = 'FORM' | 'SUCCESS';

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSave, artists }) => {
  const [step, setStep] = useState<ModalStep>('FORM');
  const [createdEvent, setCreatedEvent] = useState<Event | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    date: '',
    startTime: '',
    duration: '2h',
    location: '',
    venueName: '',
    description: '',
    equipment: '',
    costumes: '',
    rehearsalTime: '',
    departureTime: '',
    transportType: 'VAN' as TravelLogistics['transportType'],
    hotel: '',
    revenue: ''
  });

  const [selectedArtists, setSelectedArtists] = useState<{artistId: string, fee: string}[]>([]);

  const { totalExpenses, netProfit, numRevenue } = useMemo(() => {
    const rev = parseFloat(formData.revenue) || 0;
    const expenses = selectedArtists.reduce((sum, sa) => sum + (parseFloat(sa.fee) || 0), 0);
    return {
      numRevenue: rev,
      totalExpenses: expenses,
      netProfit: rev - expenses
    };
  }, [formData.revenue, selectedArtists]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Event = {
      id: 'e' + Math.random().toString(36).substr(2, 9),
      title: formData.title,
      client: formData.client,
      date: formData.date,
      startTime: formData.startTime,
      duration: formData.duration,
      location: formData.location,
      venueName: formData.venueName,
      description: formData.description,
      equipment: formData.equipment,
      costumes: formData.costumes,
      rehearsalTime: formData.rehearsalTime,
      logistics: {
        departureTime: formData.departureTime,
        transportType: formData.transportType,
        hotel: formData.hotel || undefined
      },
      invitations: selectedArtists.map(sa => ({
        artistId: sa.artistId,
        fee: parseFloat(sa.fee) || 0,
        status: EventStatus.PENDING,
        paymentStatus: 'PENDING'
      })),
      revenue: parseFloat(formData.revenue) || 0,
      createdAt: new Date().toISOString()
    };

    onSave(newEvent);
    setCreatedEvent(newEvent);
    setStep('SUCCESS');
  };

  const toggleArtist = (id: string) => {
    if (selectedArtists.some(sa => sa.artistId === id)) {
      setSelectedArtists(selectedArtists.filter(sa => sa.artistId !== id));
    } else {
      setSelectedArtists([...selectedArtists, { artistId: id, fee: '' }]);
    }
  };

  const handleClose = () => {
    setStep('FORM');
    setCreatedEvent(null);
    onClose();
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-amber-400 transition-colors text-sm";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block";

  return (
    /* Aumentato z-index a 100 per coprire la barra di navigazione inferiore */
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={handleClose}></div>
      
      {/* max-h regolato per dvh (dynamic viewport height) per gestire la barra indirizzi iOS */}
      <div className="relative bg-slate-900 w-full max-w-4xl max-h-[90dvh] overflow-hidden rounded-[2.5rem] border border-amber-900/40 shadow-2xl flex flex-col lg:flex-row animate-scaleIn">
        
        {step === 'FORM' ? (
          <>
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-amber-900/20 flex justify-between items-center bg-slate-900/50 shrink-0">
                <h2 className="text-xl font-bold theatrical-font text-white">Nuovo Evento</h2>
                <button onClick={handleClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <form id="create-event-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="bg-amber-600/5 p-4 rounded-2xl border border-amber-500/20 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <AlertTriangle size={14} />
                    <span className="text-[10px] font-bold uppercase">Nota Sicurezza</span>
                  </div>
                  <p className="text-[11px] text-slate-400">L'evento verrà creato prima nell'app. Al termine potrai decidere se sincronizzarlo con il tuo iPhone o Google.</p>
                </div>

                <section className="space-y-4">
                  <label className={labelClass}>Titolo Evento *</label>
                  <input required type="text" className={inputClass} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Es: Gala Aziendale" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Data *</label>
                      <input required type="date" className={inputClass} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    </div>
                    <div>
                      <label className={labelClass}>Inizio Show *</label>
                      <input required type="time" className={inputClass} value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <label className={labelClass}>Location & Indirizzo *</label>
                  <input required type="text" className={inputClass} value={formData.venueName} onChange={e => setFormData({...formData, venueName: e.target.value})} placeholder="Nome del posto" />
                  <input required type="text" className={inputClass} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Via, Città" />
                </section>

                <section className="space-y-4">
                  <label className={labelClass}>Cachet Cliente (€) *</label>
                  <input required type="text" className={inputClass} value={formData.revenue} onChange={e => setFormData({...formData, revenue: e.target.value.replace(/[^0-9.]/g, '')})} placeholder="Fatturato" />
                </section>

                <section className="space-y-4">
                  <label className={labelClass}>Seleziona Artisti</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {artists.length > 0 ? artists.map(artist => {
                      const selection = selectedArtists.find(sa => sa.artistId === artist.id);
                      return (
                        <div key={artist.id} onClick={() => toggleArtist(artist.id)} className={`p-3 rounded-xl border cursor-pointer transition-all ${!!selection ? 'bg-amber-600/10 border-amber-400' : 'bg-slate-800/40 border-slate-700'}`}>
                          <p className="text-xs font-bold text-white">{artist.name}</p>
                          {!!selection && (
                            <input 
                              onClick={e => e.stopPropagation()}
                              type="text" 
                              className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-[10px] text-amber-400"
                              placeholder="Paga artista"
                              value={selection.fee}
                              onChange={e => setSelectedArtists(selectedArtists.map(sa => sa.artistId === artist.id ? {...sa, fee: e.target.value} : sa))}
                            />
                          )}
                        </div>
                      );
                    }) : (
                      <p className="text-[10px] text-slate-500 italic py-2">Nessun artista registrato. Aggiungili nella sezione Artisti.</p>
                    )}
                  </div>
                </section>
                
                {/* Spazio extra finale per garantire che l'ultimo elemento non tocchi il footer */}
                <div className="h-4"></div>
              </form>

              {/* FOOTER: fisso in fondo alla modale, con padding per Safe Area iPhone */}
              <div className="p-5 bg-slate-900 border-t border-amber-900/20 flex space-x-3 shrink-0 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                <button 
                  type="button"
                  onClick={handleClose} 
                  className="flex-1 py-4 bg-slate-800 text-xs font-bold rounded-2xl active:scale-95 transition-all text-slate-300"
                >
                  Annulla
                </button>
                <button 
                  type="submit" 
                  form="create-event-form"
                  className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all"
                >
                  <Save size={16} /> <span>Crea Evento</span>
                </button>
              </div>
            </div>

            {/* Riepilogo laterale solo su desktop */}
            <div className="hidden lg:flex w-64 bg-slate-950 p-6 flex-col border-l border-amber-900/10">
              <h3 className="text-lg font-bold theatrical-font text-amber-400 mb-6">Riepilogo</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 rounded-2xl border border-blue-500/20">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Lordo</p>
                  <p className="text-xl font-bold text-white">€{numRevenue.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-slate-900 rounded-2xl border border-rose-500/20">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Costi</p>
                  <p className="text-xl font-bold text-rose-400">€{totalExpenses.toLocaleString()}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Profitto</p>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>€{netProfit.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* SUCCESS STEP */
          <div className="flex-1 p-8 md:p-10 flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn overflow-y-auto pb-[calc(2rem+env(safe-area-inset-bottom))]">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Check size={40} strokeWidth={3} />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold theatrical-font text-white mb-2">Evento Creato!</h2>
              <p className="text-slate-400 max-w-sm mx-auto">L'evento è stato salvato correttamente nel database e gli artisti sono stati notificati.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
              <button 
                onClick={() => createdEvent && syncAllEventsToMobile([createdEvent])}
                className="flex items-center justify-center space-x-3 bg-white text-slate-950 p-4 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95 shadow-xl"
              >
                <Apple size={20} />
                <div className="text-left">
                  <p className="leading-tight">iPhone / Android</p>
                  <p className="text-[9px] uppercase opacity-60">Sincronizza Ora</p>
                </div>
              </button>

              <button 
                onClick={() => createdEvent && window.open(generateGoogleCalendarLink(createdEvent), '_blank')}
                className="flex items-center justify-center space-x-3 bg-slate-800 text-amber-400 p-4 rounded-2xl font-bold text-sm border border-amber-900/30 hover:bg-slate-700 transition-all active:scale-95"
              >
                <CalendarPlus size={20} />
                <div className="text-left">
                  <p className="leading-tight">Google Calendar</p>
                  <p className="text-[9px] uppercase opacity-60">Apri Web</p>
                </div>
              </button>
            </div>

            <button 
              onClick={handleClose}
              className="px-8 py-4 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
            >
              Fatto, Torna alla Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEventModal;
