
import React, { useState } from 'react';
import { Event, EventStatus } from '../types';
import { formatDate, getStatusColor, getStatusLabel } from '../utils/helpers';
import { MapPin, Clock, Users as UsersIcon, ChevronRight, Plus, Search, Filter } from 'lucide-react';

interface EventListProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onAddEvent?: () => void;
  isAdmin: boolean;
}

const EventList: React.FC<EventListProps> = ({ events, onSelectEvent, onAddEvent, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.venueName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Cerca evento o location..." 
            className="w-full bg-slate-900 border border-amber-900/30 rounded-xl py-2 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-amber-400 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-slate-800 border border-slate-700 hover:border-amber-600/50 px-4 py-2 rounded-xl text-sm font-medium transition-all">
            <Filter size={16} />
            <span>Filtri</span>
          </button>
          {isAdmin && (
            <button 
              onClick={onAddEvent}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-amber-900/20 transition-all"
            >
              <Plus size={18} />
              <span>Nuovo Evento</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const mainStatus = event.invitations.some(i => i.status === EventStatus.PENDING) 
            ? EventStatus.PENDING 
            : EventStatus.CONFIRMED;

          return (
            <div 
              key={event.id}
              onClick={() => onSelectEvent(event)}
              className="group bg-slate-900/60 border border-amber-900/20 rounded-2xl overflow-hidden hover:border-amber-400/50 transition-all cursor-pointer shadow-xl hover:shadow-amber-900/10"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(mainStatus)}`}>
                    {getStatusLabel(mainStatus)}
                  </span>
                  <div className="text-amber-400/50 group-hover:text-amber-400 transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>

                <h3 className="text-xl font-bold theatrical-font mb-1 line-clamp-1">{event.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{formatDate(event.date)}</p>

                <div className="space-y-2">
                  <div className="flex items-center text-slate-400 text-xs">
                    <MapPin size={14} className="mr-2 text-amber-500" />
                    <span className="line-clamp-1">{event.venueName} • {event.location}</span>
                  </div>
                  <div className="flex items-center text-slate-400 text-xs">
                    <Clock size={14} className="mr-2 text-amber-500" />
                    <span>Inizio: {event.startTime} ({event.duration})</span>
                  </div>
                  <div className="flex items-center text-slate-400 text-xs">
                    <UsersIcon size={14} className="mr-2 text-amber-500" />
                    <span>{event.invitations.length} Artisti invitati</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="bg-amber-950/10 px-5 py-3 border-t border-amber-900/10 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Costo Totale</span>
                  <span className="text-sm font-bold text-amber-400">
                    €{event.invitations.reduce((acc, inv) => acc + inv.fee, 0)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
          <p className="text-slate-500">Nessun evento trovato. Prova a cambiare i filtri.</p>
        </div>
      )}
    </div>
  );
};

export default EventList;
