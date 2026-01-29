
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EventList from './components/EventList';
import EventDetailModal from './components/EventDetailModal';
import CreateEventModal from './components/CreateEventModal';
import AddArtistModal from './components/AddArtistModal';
import ArtistDetailModal from './components/ArtistDetailModal';
import NotificationCenter from './components/NotificationCenter';
import PaymentsView from './components/PaymentsView';
import { UserRole, Event, EventStatus, Artist, Notification } from './types';
import { MOCK_EVENTS, MOCK_ARTISTS } from './constants';
import { requestNotificationPermission, sendInvitationNotification } from './utils/notifications';
import { Sparkles, UserPlus, Mail, LogIn, Users, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('tf_events_v3');
    return saved ? JSON.parse(saved) : MOCK_EVENTS;
  });
  
  const [artists, setArtists] = useState<Artist[]>(() => {
    const saved = localStorage.getItem('tf_artists_v3');
    return saved ? JSON.parse(saved) : MOCK_ARTISTS;
  });
  
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('tf_notifications_v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isArtistDetailOpen, setIsArtistDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tf_events_v3', JSON.stringify(events));
    localStorage.setItem('tf_artists_v3', JSON.stringify(artists));
    localStorage.setItem('tf_notifications_v3', JSON.stringify(notifications));
  }, [events, artists, notifications]);

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role') as UserRole;
    if (savedRole) {
      setRole(savedRole);
      setActiveTab(savedRole === 'ADMIN' ? 'dashboard' : 'confirmed-events');
    }
    requestNotificationPermission();
  }, []);

  const handleLogin = (selectedRole: UserRole) => {
    if (!userEmail) {
      showToast("Inserisci un'email valida");
      return;
    }
    setRole(selectedRole);
    localStorage.setItem('user_role', selectedRole);
    localStorage.setItem('user_email', userEmail);
    setActiveTab(selectedRole === 'ADMIN' ? 'dashboard' : 'confirmed-events');
  };

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem('user_role');
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateEventStatus = (status: EventStatus) => {
    if (!selectedEvent) return;
    setEvents(events.map(e => e.id === selectedEvent.id ? {
      ...e, invitations: e.invitations.map(inv => inv.artistId === '1' ? { ...inv, status } : inv)
    } : e));
    setIsDetailOpen(false);
    showToast(`Status aggiornato: ${status}`);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    showToast('Evento eliminato');
  };

  // Missing handleSaveNewEvent added to resolve compilation error
  const handleSaveNewEvent = (newEvent: Event) => {
    setEvents(prev => [...prev, newEvent]);
    showToast('Show creato con successo!');
  };

  const handleResetData = () => {
    if (window.confirm('Cancellare TUTTI i dati permanentemente?')) {
      setEvents([]);
      setArtists([]);
      setNotifications([]);
      localStorage.removeItem('tf_events_v3');
      localStorage.removeItem('tf_artists_v3');
      localStorage.removeItem('tf_notifications_v3');
      showToast('Archivio pulito');
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-block p-4 bg-amber-950/20 rounded-full mb-6 border border-amber-500/30">
             <Sparkles size={48} className="text-amber-400" />
          </div>
          <h1 className="text-6xl md:text-7xl theatrical-font font-bold text-amber-400 mb-4 tracking-tight">TeamFlow</h1>
          <p className="text-slate-400 max-w-sm mx-auto font-light">Gestione Premium per Agenzie di Spettacolo.</p>
        </div>

        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-amber-900/30 shadow-2xl">
          <div className="mb-8">
            <label className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70 mb-2 block">Accesso Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="nome@agenzia.it" className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-amber-400 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button onClick={() => handleLogin('ADMIN')} className="flex flex-col items-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-amber-500/50 transition-all active:scale-95">
              <LogIn className="text-amber-400 mb-2" />
              <span className="text-sm font-bold theatrical-font">Admin</span>
            </button>
            <button onClick={() => handleLogin('ARTIST')} className="flex flex-col items-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-all active:scale-95">
              <Users className="text-indigo-400 mb-2" />
              <span className="text-sm font-bold theatrical-font">Artista</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const confirmedEvents = events.filter(e => 
    e.invitations.length > 0 && e.invitations.every(inv => inv.status === EventStatus.CONFIRMED)
  );

  return (
    <Layout role={role} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-fadeIn">
        {activeTab === 'dashboard' && role === 'ADMIN' && (
          <Dashboard 
            events={events} 
            artists={artists} 
            onSelectEvent={(e) => { setSelectedEvent(e); setIsDetailOpen(true); }}
            onDeleteEvent={handleDeleteEvent}
            onResetData={handleResetData}
          />
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold theatrical-font text-white">Palinsesto Generale</h2>
            <EventList 
              events={events}
              onSelectEvent={(e) => { setSelectedEvent(e); setIsDetailOpen(true); }}
              onAddEvent={() => setIsCreateOpen(true)}
              onDeleteEvent={handleDeleteEvent}
              role={role}
            />
          </div>
        )}

        {activeTab === 'confirmed-events' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={24} strokeWidth={3} />
              </div>
              <div>
                <h2 className="text-2xl font-bold theatrical-font text-white">Eventi Confermati</h2>
                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Show in programmazione</p>
              </div>
            </div>
            <EventList 
              events={role === 'ADMIN' ? confirmedEvents : confirmedEvents.filter(e => e.invitations.some(i => i.artistId === '1'))}
              onSelectEvent={(e) => { setSelectedEvent(e); setIsDetailOpen(true); }}
              role={role}
              isConfirmedView={true}
            />
          </div>
        )}

        {activeTab === 'my-calendar' && role === 'ARTIST' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold theatrical-font text-white">Mia Agenda</h2>
            <EventList 
              events={events.filter(e => e.invitations.some(i => i.artistId === '1'))}
              onSelectEvent={(e) => { setSelectedEvent(e); setIsDetailOpen(true); }}
              role={role}
            />
          </div>
        )}

        {activeTab === 'payments' && role === 'ARTIST' && (
          <PaymentsView events={events} artistId="1" />
        )}

        {activeTab === 'artists' && role === 'ADMIN' && (
          <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold theatrical-font text-white">Artisti</h2>
              <button onClick={() => setIsArtistModalOpen(true)} className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase flex items-center space-x-2">
                <UserPlus size={16} /> <span>Aggiungi</span>
              </button>
            </div>
            {artists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {artists.map(artist => (
                  <div key={artist.id} onClick={() => { setSelectedArtist(artist); setIsArtistDetailOpen(true); }} className="bg-slate-900/40 p-7 rounded-[2.5rem] border border-slate-800 hover:border-amber-400/50 transition-all group cursor-pointer shadow-xl">
                    <div className="flex items-center space-x-5 mb-5">
                      <div className="w-14 h-14 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center font-black text-white text-xl shadow-lg border border-indigo-400/30">{artist.name[0]}</div>
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">{artist.name}</h3>
                        <p className="text-slate-500 text-[9px] uppercase font-black tracking-widest">{artist.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-slate-500 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                      <Mail size={14} className="mr-3 text-amber-500/50" /> 
                      <span className="truncate">{artist.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800">
                <Users size={48} className="mx-auto text-slate-800 mb-4" />
                <p className="text-slate-600 font-bold theatrical-font">Nessun artista nel roster</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <NotificationCenter notifications={notifications} onMarkAsRead={(id) => setNotifications(notifications.map(n => n.id === id ? {...n, read: true} : n))} />
        )}
      </div>

      {toastMessage && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-amber-600 text-white px-8 py-4 rounded-[1.5rem] shadow-2xl z-[100] animate-fadeIn font-black uppercase text-[10px] tracking-widest border border-amber-400/30">
          {toastMessage}
        </div>
      )}

      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} role={role} artists={artists} currentUserId="1" onUpdateStatus={handleUpdateEventStatus} onDeleteEvent={handleDeleteEvent} 
        />
      )}
      {selectedArtist && <ArtistDetailModal artist={selectedArtist} events={events} isOpen={isArtistDetailOpen} onClose={() => setIsArtistDetailOpen(false)} />}
      {isCreateOpen && <CreateEventModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSave={handleSaveNewEvent} artists={artists} />}
      <AddArtistModal isOpen={isArtistModalOpen} onClose={() => setIsArtistModalOpen(false)} onAddArtist={(a) => setArtists([...artists, a])} />
    </Layout>
  );
};

export default App;
