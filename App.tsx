
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
import { requestNotificationPermission } from './utils/notifications';
import { Sparkles, UserPlus, Mail, Users, CheckCircle2, Lock, Eye, EyeOff, ShieldCheck, Building2, Rocket } from 'lucide-react';

const App: React.FC = () => {
  // Stato autenticazione e profilo agenzia
  const [role, setRole] = useState<UserRole | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [agencyProfile, setAgencyProfile] = useState<{name: string, email: string, pass: string} | null>(() => {
    const saved = localStorage.getItem('tf_agency_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // Campi form
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regAgencyName, setRegAgencyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Tab attiva e messaggi
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Dati applicazione
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
    if (agencyProfile) {
      localStorage.setItem('tf_agency_profile', JSON.stringify(agencyProfile));
    }
  }, [events, artists, notifications, agencyProfile]);

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role') as UserRole;
    if (savedRole) {
      setRole(savedRole);
      setActiveTab(savedRole === 'ADMIN' ? 'dashboard' : 'confirmed-events');
    }
    // Primo avvio: se non c'è profilo, apri registrazione
    if (!agencyProfile) {
      setIsRegistering(true);
    }
    requestNotificationPermission();
  }, [agencyProfile]);

  const handleRegisterAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regAgencyName || !userEmail || !password) {
      showToast("Tutti i campi sono obbligatori");
      return;
    }
    const profile = { name: regAgencyName, email: userEmail, pass: password };
    setAgencyProfile(profile);
    localStorage.setItem('tf_agency_profile', JSON.stringify(profile));
    setIsRegistering(false);
    showToast("Profilo Agenzia Creato!");
  };

  const handleLogin = (selectedRole: UserRole) => {
    if (!userEmail || !password) {
      showToast("Inserisci email e password");
      return;
    }

    if (selectedRole === 'ADMIN') {
      if (agencyProfile && userEmail === agencyProfile.email && password === agencyProfile.pass) {
        // Login Admin OK
      } else {
        showToast("Credenziali Amministratore non valide");
        return;
      }
    } else {
      // Login Artista (Pass: ArtistAccess per questa versione)
      if (password !== "ArtistAccess") {
        showToast("Codice Artista errato");
        return;
      }
    }

    setRole(selectedRole);
    localStorage.setItem('user_role', selectedRole);
    localStorage.setItem('user_email', userEmail);
    setActiveTab(selectedRole === 'ADMIN' ? 'dashboard' : 'confirmed-events');
    setPassword('');
    showToast(`Bentornato in ${agencyProfile?.name || 'TeamFlow'}`);
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

  const handleSaveNewEvent = (newEvent: Event) => {
    setEvents(prev => [...prev, newEvent]);
    showToast('Show creato con successo!');
  };

  const handleResetData = () => {
    if (window.confirm('Cancellare TUTTI i dati? Questo resetterà anche il profilo agenzia.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // --- VISTA REGISTRAZIONE ---
  if (isRegistering && !role) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-block p-4 bg-amber-950/20 rounded-full mb-6 border border-amber-500/30">
             <Rocket size={48} className="text-amber-400" />
          </div>
          <h1 className="text-4xl md:text-5xl theatrical-font font-bold text-amber-400 mb-2 tracking-tight">Crea il tuo Profilo</h1>
          <p className="text-slate-400 max-w-sm mx-auto font-light">Configura la tua agenzia per iniziare.</p>
        </div>

        <form onSubmit={handleRegisterAgency} className="w-full max-w-md bg-slate-900/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-amber-900/30 shadow-2xl space-y-5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70 mb-2 block">Nome Agenzia</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required type="text" value={regAgencyName} onChange={(e) => setRegAgencyName(e.target.value)} placeholder="Es: Elite Shows Milan" className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-amber-400 transition-all" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70 mb-2 block">Email Admin</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="admin@email.com" className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-amber-400 transition-all" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70 mb-2 block">Password Master</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password di accesso" className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-12 text-white outline-none focus:border-amber-400 transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black uppercase py-5 rounded-2xl shadow-xl transition-all active:scale-95 text-xs tracking-widest">
            Attiva Agenzia
          </button>
        </form>
      </div>
    );
  }

  // --- VISTA LOGIN ---
  if (!role) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-block p-4 bg-amber-950/20 rounded-full mb-6 border border-amber-500/30">
             <Sparkles size={48} className="text-amber-400" />
          </div>
          <h1 className="text-5xl md:text-6xl theatrical-font font-bold text-amber-400 mb-4 tracking-tight">
            {agencyProfile?.name || 'TeamFlow'}
          </h1>
          <p className="text-slate-400 max-w-sm mx-auto font-light">Accedi alla tua area riservata.</p>
        </div>

        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-amber-900/30 shadow-2xl space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-4 pl-12 text-white outline-none focus:border-amber-400 transition-all" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password o PIN" className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-4 pl-12 text-white outline-none focus:border-amber-400 transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleLogin('ADMIN')} className="flex flex-col items-center p-4 bg-amber-600 hover:bg-amber-500 rounded-2xl text-white transition-all active:scale-95 shadow-lg">
              <ShieldCheck className="mb-2" />
              <span className="text-xs font-bold uppercase tracking-widest">Admin</span>
            </button>
            <button onClick={() => handleLogin('ARTIST')} className="flex flex-col items-center p-4 bg-slate-800 rounded-2xl text-slate-300 transition-all active:scale-95">
              <Users className="mb-2" />
              <span className="text-xs font-bold uppercase tracking-widest">Artista</span>
            </button>
          </div>
          <button onClick={() => setIsRegistering(true)} className="w-full text-[10px] text-slate-500 hover:text-amber-400 uppercase font-bold tracking-widest">
            Re-imposta Profilo Agenzia
          </button>
        </div>
      </div>
    );
  }

  // --- APP PRINCIPALE ---
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
            <h2 className="text-2xl font-bold theatrical-font text-white">Palinsesto {agencyProfile?.name}</h2>
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
            <h2 className="text-2xl font-bold theatrical-font text-white">Show Confermati</h2>
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
            <h2 className="text-2xl font-bold theatrical-font text-white">La Mia Agenda</h2>
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
              <h2 className="text-2xl font-bold theatrical-font text-white">Roster Artisti</h2>
              <button onClick={() => setIsArtistModalOpen(true)} className="bg-amber-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase flex items-center space-x-2">
                <UserPlus size={16} /> <span>Aggiungi</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {artists.map(artist => (
                  <div key={artist.id} onClick={() => { setSelectedArtist(artist); setIsArtistDetailOpen(true); }} className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-800 hover:border-amber-400 transition-all cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg">{artist.name[0]}</div>
                      <div>
                        <h3 className="font-bold text-white">{artist.name}</h3>
                        <p className="text-slate-500 text-[9px] uppercase font-black">{artist.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
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
