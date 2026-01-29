
import React, { useState, useMemo } from 'react';
import { Event, EventStatus, UserRole } from '../types';
import { formatDate, getStatusColor, getStatusLabel, syncAllEventsToMobile } from '../utils/helpers';
import { MapPin, Clock, Users as UsersIcon, ChevronRight, Plus, Search, Calendar as CalendarIcon, ChevronLeft, CalendarDays, LayoutGrid, List, Smartphone, Apple, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import CalendarGrid from './CalendarGrid';

interface EventListProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onAddEvent?: () => void;
  onDeleteEvent?: (id: string) => void;
  role: UserRole;
  isConfirmedView?: boolean;
}

const EventList: React.FC<EventListProps> = ({ events, onSelectEvent, onAddEvent, onDeleteEvent, role, isConfirmedView = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST');
  const isAdmin = role === 'ADMIN';

  const nextMonth = () => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)));
  const prevMonth = () => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)));
  const goToToday = () => setViewDate(new Date());

  const monthYearLabel = viewDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

  // Add explicit type Record<string, Event[]> to ensure Object.entries infers correct types
  const groupedEvents: Record<string, Event[]> = useMemo(() => {
    let baseEvents = events;
    
    if (!searchTerm && viewMode === 'GRID') {
      baseEvents = events.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
      });
    } else if (searchTerm) {
      baseEvents = events.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.venueName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const groups: { [key: string]: Event[] } = {};
    
    baseEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(event => {
      const date = new Date(event.date);
      const monthKey = date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(event);
    });

    return groups;
  }, [events, searchTerm, viewDate, viewMode]);

  const handleSyncToMobile = () => {
    // Sincronizza solo gli eventi futuri o tutti se siamo nella vista confermati
    const eventsToSync = isConfirmedView 
      ? events 
      : events.filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)));
    
    if (eventsToSync.length === 0) {
      alert("Nessun evento da sincronizzare.");
      return;
    }
    syncAllEventsToMobile(eventsToSync);
  };

  return (
    <div className="space-y-6">
      {/* Card Sincronizzazione - Più evidente per l'artista */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-6 rounded-[2.5rem] border border-indigo-400/30 shadow-2xl shadow-indigo-900/20 flex flex-col sm:flex-row items-center justify-between gap-6 animate-fadeIn">
        <div className="flex items-center space-x-5 text-center sm:text-left">
          <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md text-white border border-white/20">
            <CalendarIcon size={32} />
          </div>
          <div>
            <h4 className="text-lg font-black text-white uppercase tracking-tighter leading-tight">Calendario su Smartphone</h4>
            <p className="text-xs text-indigo-100/70 font-medium">Sincronizza tutti gli show con iPhone e Android</p>
          </div>
        </div>
        <button 
          onClick={handleSyncToMobile}
          className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-white text-indigo-900 px-8 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-tight hover:bg-slate-100 transition-all active:scale-95 shadow-xl"
        >
          <Apple size={20} className="shrink-0" />
          <Smartphone size={20} className="shrink-0" />
          <span>Sincronizza Ora</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900/60 p-3 rounded-3xl border border-amber-900/10 backdrop-blur-md flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 bg-slate-950/50 rounded-xl p-1 border border-slate-800">
              <button onClick={() => setViewMode('GRID')} className={`p-2 rounded-lg transition-all ${viewMode === 'GRID' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><LayoutGrid size={18} /></button>
              <button onClick={() => setViewMode('LIST')} className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><List size={18} /></button>
            </div>
            {isAdmin && !isConfirmedView && (
                <button onClick={onAddEvent} className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-2xl shadow-lg transition-all flex items-center space-x-2 text-xs font-black uppercase">
                  <Plus size={18} /> <span>Nuovo Show</span>
                </button>
            )}
        </div>

        <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Cerca tra gli eventi..." 
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-amber-400 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Liste Eventi */}
      {viewMode === 'GRID' && !searchTerm ? (
        <CalendarGrid events={events} viewDate={viewDate} onPrevMonth={prevMonth} onNextMonth={nextMonth} onSelectEvent={onSelectEvent} />
      ) : (
        <div className="space-y-12 animate-fadeIn pb-32">
          {Object.keys(groupedEvents).length > 0 ? Object.entries(groupedEvents).map(([month, monthEvents]) => (
            <div key={month} className="relative">
              <div className="sticky top-16 z-20 py-4 bg-slate-950/90 backdrop-blur-xl -mx-4 px-4 flex items-center justify-between mb-4 border-b border-amber-900/10">
                <h3 className="text-xl font-bold theatrical-font text-amber-400 capitalize">{month}</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900 px-3 py-1 rounded-full">{monthEvents.length} Show</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthEvents.map(event => {
                   const isConfirmed = event.invitations.length > 0 && event.invitations.every(i => i.status === EventStatus.CONFIRMED);
                   return (
                    <div 
                      key={event.id}
                      onClick={() => onSelectEvent(event)}
                      className={`group relative bg-slate-900/40 border rounded-[2.5rem] overflow-hidden transition-all active:scale-[0.97] cursor-pointer shadow-xl ${
                        isConfirmed 
                        ? 'border-emerald-500/30 shadow-emerald-950/20' 
                        : 'border-slate-800'
                      }`}
                    >
                      <div className="p-7">
                        <div className="flex justify-between items-start mb-5">
                          <div className="flex flex-col">
                              <span className="text-4xl font-black text-white leading-none tracking-tighter">{new Date(event.date).getDate()}</span>
                              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-500 mt-1">
                                {new Date(event.date).toLocaleDateString('it-IT', { weekday: 'short' })}
                              </span>
                          </div>
                          {isConfirmed ? (
                            <div className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full border border-emerald-500/20 flex items-center space-x-1.5 shadow-lg shadow-emerald-950/40">
                                <CheckCircle2 size={14} strokeWidth={3} />
                                <span className="text-[10px] font-black uppercase tracking-tight">Confermato</span>
                            </div>
                          ) : (
                            <div className="bg-amber-500/10 text-amber-500 px-4 py-1.5 rounded-full border border-amber-500/20 flex items-center space-x-1.5">
                                <AlertCircle size={14} />
                                <span className="text-[10px] font-black uppercase tracking-tight">Pendente</span>
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-bold theatrical-font mb-5 text-white group-hover:text-amber-400 transition-colors leading-tight">{event.title}</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center text-slate-400 text-xs font-medium">
                            <div className="p-1.5 bg-slate-800 rounded-lg mr-3"><MapPin size={14} className="text-amber-500/70" /></div>
                            <span className="truncate">{event.venueName}</span>
                          </div>
                          <div className="flex items-center text-slate-400 text-xs font-medium">
                            <div className="p-1.5 bg-slate-800 rounded-lg mr-3"><Clock size={14} className="text-amber-500/70" /></div>
                            <span>{event.startTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )) : (
            <div className="text-center py-32 bg-slate-900/10 rounded-[4rem] border-2 border-dashed border-slate-800/50">
              <CalendarDays size={64} className="mx-auto text-slate-800 mb-6" />
              <p className="text-slate-600 font-bold theatrical-font text-xl">Nessun evento programmato</p>
              <p className="text-slate-700 text-xs mt-2 uppercase tracking-widest font-black">L'agenda è vuota al momento</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventList;
