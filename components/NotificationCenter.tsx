
import React from 'react';
import { Notification } from '../types';
import { Bell, CheckCircle, Info, AlertTriangle, Clock } from 'lucide-react';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onMarkAsRead }) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold theatrical-font text-white">Notifiche</h2>
          <p className="text-slate-500 text-sm">Rimani aggiornato sugli ultimi cambiamenti</p>
        </div>
        <div className="bg-amber-600/10 border border-amber-600/30 px-3 py-1 rounded-full text-amber-400 text-xs font-bold">
          {notifications.filter(n => !n.read).length} Da leggere
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => !n.read && onMarkAsRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-4 ${
                n.read 
                  ? 'bg-slate-900/30 border-slate-800 opacity-60' 
                  : 'bg-slate-900 border-amber-900/30 hover:border-amber-400/50 shadow-lg'
              }`}
            >
              <div className={`p-2 rounded-lg ${!n.read ? 'bg-amber-600/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                {n.title.toLowerCase().includes('conferma') ? <CheckCircle size={18} /> : 
                 n.title.toLowerCase().includes('cambio') ? <AlertTriangle size={18} /> : 
                 <Info size={18} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className={`font-bold text-sm ${!n.read ? 'text-white' : 'text-slate-400'}`}>{n.title}</h4>
                  <div className="flex items-center text-[10px] text-slate-500">
                    <Clock size={10} className="mr-1" />
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{n.message}</p>
              </div>
              {!n.read && <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 shadow-glow-amber"></div>}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
            <Bell size={40} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500">Nessuna notifica recente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
