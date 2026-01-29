
import React from 'react';
import { Event } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarGridProps {
  events: Event[];
  viewDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectEvent: (event: Event) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ events, viewDate, onPrevMonth, onNextMonth, onSelectEvent }) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust for Monday start (0=Sun, 1=Mon... -> 0=Mon, 6=Sun)
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  // Days from prev month
  for (let i = 0; i < startDay; i++) {
    days.push({ day: null, currentMonth: false });
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, currentMonth: true });
  }

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  return (
    <div className="bg-slate-900/60 rounded-[2.5rem] border border-amber-900/20 overflow-hidden shadow-2xl animate-fadeIn">
      <div className="p-6 border-b border-amber-900/10 flex justify-between items-center bg-slate-900/40">
        <h3 className="text-xl font-bold theatrical-font text-white capitalize">
          {viewDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex space-x-2">
          <button onClick={onPrevMonth} className="p-2 hover:bg-slate-800 text-amber-400 rounded-xl transition-colors border border-slate-700"><ChevronLeft size={20} /></button>
          <button onClick={onNextMonth} className="p-2 hover:bg-slate-800 text-amber-400 rounded-xl transition-colors border border-slate-700"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-amber-900/10">
        {weekDays.map(wd => (
          <div key={wd} className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">{wd}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[minmax(100px,auto)] md:auto-rows-[140px]">
        {days.map((d, i) => {
          const dayEvents = d.day ? getEventsForDay(d.day) : [];
          const isToday = d.day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
          
          return (
            <div 
              key={i} 
              className={`p-2 border-r border-b border-amber-900/5 transition-colors ${!d.currentMonth ? 'bg-slate-950/20' : 'bg-transparent'} ${isToday ? 'bg-amber-600/5' : ''}`}
            >
              {d.day && (
                <>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-bold ${isToday ? 'bg-amber-500 text-black w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-400'}`}>
                      {d.day}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map(e => (
                      <button 
                        key={e.id}
                        onClick={() => onSelectEvent(e)}
                        className="w-full text-left p-1.5 rounded-lg bg-amber-600/10 border border-amber-500/20 hover:border-amber-400 transition-all group"
                      >
                        <p className="text-[10px] font-bold text-amber-400 truncate group-hover:text-amber-300">{e.title}</p>
                        <p className="text-[8px] text-slate-500 truncate">{e.startTime}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
