
import React, { useState, useMemo } from 'react';
import { Event, EventStatus, UserRole } from '../types';
import { syncAllEventsToMobile } from '../utils/helpers';
import { MapPin, Clock, Plus, Search, Calendar as CalendarIcon, LayoutGrid, List, Smartphone, Apple, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react';
import CalendarGrid from './CalendarGrid';

interface EventListProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onAddEvent?: () => void;
  onDeleteEvent?: (id: string) => void;
  role: UserRole;
  isConfirmedView?: boolean;
}

const EventList: React.FC<EventListProps> = ({ events, onSelectEvent, onAddEvent, role, isConfirmedView = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST');
  const isAdmin = role === 'ADMIN';

  const nextMonth = () => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)));
  const prevMonth = () => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)));

  // Raggruppamento sicuro
  const groupedEvents: Record<string, Event[]> = useMemo(() => {
    let baseEvents = events;
    
    if (searchTerm) {
      baseEvents = events.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.venueName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (viewMode === 'GRID') {
      baseEvents = events.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
      });
    }

    const groups: Record<string, Event[]> = {};
    baseEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(event => {
      const monthKey = new Date(event.date).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(event);
    });

    return groups;
  }, [events, searchTerm, viewDate, viewMode]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-6 rounded-[2rem] border border-indigo-400/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center space-x-4">
          <CalendarIcon size={24} className="text-white" />
          <p className="text-sm font-bold text-white uppercase tracking-tight">Sincronizza Show su Smartphone</p>
        </div>
        <button onClick={() => syncAllEventsToMobile(events)} className="bg-white text-indigo-900 px-6 py-3 rounded-xl text-xs font-black uppercase flex items-center space-x-2 shadow-xl active:scale-95 transition-all">
          <Smartphone size={16} /> <span>Sincronizza Ora</span>
        </button>
      </div>

      <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button onClick={() => setViewMode('GRID')} className={`p-2 rounded-lg transition-all ${viewMode === 'GRID' ? 'bg-amber-600 text-white' : 'text-slate-500'}`}><LayoutGrid size={18} /></button>
            <button onClick={() => setViewMode('LIST')} className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-amber-600 text-white' : 'text-slate-500'}`}><List size={18} /></button>
          </div>
          {isAdmin && !isConfirmedView && (
            <button onClick={onAddEvent} className="bg-amber-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center space-x-2">
              <Plus size={16} /> <span>Nuovo Show</span>
            </button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input type="text" placeholder="Cerca..." className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-xs outline-none focus:border-amber-400" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {viewMode === 'GRID' && !searchTerm ? (
        <CalendarGrid events={events} viewDate={viewDate} onPrevMonth={prevMonth} onNextMonth={nextMonth} onSelectEvent={onSelectEvent} />
      ) : (
        <div className="space-y-10 pb-20">
          {Object.entries(groupedEvents).map(([month, monthEvents]) => (
            <div key={month}>
              <h3 className="text-lg font-bold text-amber-400 theatrical-font border-b border-slate-800 pb-2 mb-4 capitalize">{month}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthEvents.map(event => (
                  <div key={event.id} onClick={() => onSelectEvent(event)} className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 hover:border-amber-400/30 transition-all cursor-pointer">
                    <div className="flex justify-between mb-4">
                      <div>
                        <span className="text-3xl font-black text-white">{new Date(event.date).getDate()}</span>
                        <p className="text-[10px] font-black uppercase text-amber-500">{new Date(event.date).toLocaleDateString('it-IT', { weekday: 'short' })}</p>
                      </div>
                      {event.invitations.every(i => i.status === EventStatus.CONFIRMED) ? <CheckCircle2 className="text-emerald-500" size={20} /> : <AlertCircle className="text-amber-500" size={20} />}
                    </div>
                    <h4 className="font-bold text-white text-lg leading-tight mb-4">{event.title}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-slate-500 text-[10px] font-bold"><MapPin size={12} className="mr-2" /> {event.venueName}</div>
                      <div className="flex items-center text-slate-500 text-[10px] font-bold"><Clock size={12} className="mr-2" /> {event.startTime}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(groupedEvents).length === 0 && (
            <div className="text-center py-20 bg-slate-900/10 rounded-3xl border-2 border-dashed border-slate-800">
               <CalendarDays className="mx-auto text-slate-700 mb-4" />
               <p className="text-slate-600 font-bold theatrical-font uppercase tracking-widest text-xs">Nessun evento trovato</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventList;
