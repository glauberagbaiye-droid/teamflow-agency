
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EventList from './components/EventList';
import EventDetailModal from './components/EventDetailModal';
import CreateEventModal from './components/CreateEventModal';
import NotificationCenter from './components/NotificationCenter';
import { UserRole, Event, EventStatus, Artist, Notification } from './types';
import { MOCK_EVENTS, MOCK_ARTISTS } from './constants';
import { safeCopyToClipboard } from './utils/helpers';
import { Sparkles, UserPlus, Mail, LogIn, Users, Smartphone, Share2, X, Copy, Check, Lock } from 'lucide-react';
import { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } from './config';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedUserId, setLoggedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Stati per la gestione Agenzia Nexuop
  const [agencyProfile, setAgencyProfile] = useState<any>(() => {
    const saved = localStorage.getItem('nx_agency_profile');
    return saved ? JSON.parse(saved) : { name: 'Nexuop Agency', email: 'admin@nexuop.it' };
  });
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Persistence Logic
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('nx_events');
    return saved ? JSON.parse(saved) : MOCK_EVENTS;
  });
  
  const [artists, setArtists] = useState<Artist[]>(() => {
    const saved = localStorage.getItem('nx_artists');
    return saved ? JSON.parse(saved) : MOCK_ARTISTS;
  });
  
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('nx_notifications');
    return saved ? JSON.parse(saved) : [
      { id: 'n1', userId: 'all', title: 'Benvenuto in Nexuop', message: 'Il tuo account Nexuop è attivo e pronto all\'uso.', timestamp: new Date().toISOString(), read: false }
    ];
  });

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  const handleLogout = () => {
    setRole(null);
    setLoggedUserId(null);
    localStorage.removeItem('logged_user_email');
    localStorage.removeItem('user_role'); 
  };

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('nx_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('nx_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('nx_artists', JSON.stringify(artists));
  }, [artists]);

  /**
   * REIDRATAZIONE SESSIONE
   * Logica di identificazione basata esclusivamente sull'email salvata
   */
  useEffect(() => {
    const savedUserEmail = localStorage.getItem('logged_user_email');
    
    if (savedUserEmail) {
      // Verifica PRIMA se è SUPER_ADMIN
      if (savedUserEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
        setRole('SUPER_ADMIN');
        setLoggedUserId('super_admin');
        setActiveTab('dashboard');
      } else if (agencyProfile && savedUserEmail.toLowerCase() === agencyProfile.email.toLowerCase()) {
        // Se è l'admin dell'agenzia
        setRole('ADMIN');
        setLoggedUserId('admin');
        setActiveTab('dashboard');
      } else {
        // Verifica se è un artista
        const artist = artists.find(a => a.email.toLowerCase() === savedUserEmail.toLowerCase());
        if (artist) {
          setRole('ARTIST');
          setLoggedUserId(artist.id);
          setActiveTab('my-calendar');
        } else {
          // Utente non trovato, esegui logout
          handleLogout();
        }
      }
    } else if (!agencyProfile) {
      setIsRegistering(true);
    }
    
    requestNotificationPermission();
  }, [agencyProfile, artists]);

  const handleLogin = (selectedRole: UserRole) => {
    if (!userEmail) {
      showToast("Inserisci un'email valida");
      return;
    }

    const emailLower = userEmail.toLowerCase();

    // SUPER ADMIN CHECK - Priorità ASSOLUTA
    if (userEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && password === SUPER_ADMIN_PASSWORD) {
        setRole('SUPER_ADMIN');
        setLoggedUserId('super_admin');
        localStorage.setItem('logged_user_email', userEmail);
        setActiveTab('dashboard');
        setPassword('');
        showToast("Benvenuto Super Admin");
        return;
    }

    // Agency Admin Logic
    if (selectedRole === 'ADMIN') {
      setRole('ADMIN');
      setLoggedUserId('admin');
      localStorage.setItem('logged_user_email', userEmail);
      setActiveTab('dashboard');
      showToast("Benvenuto Admin Nexuop");
      return;
    }

    // Artist Logic
    const artist = artists.find(a => a.email.toLowerCase() === emailLower);
    if (selectedRole === 'ARTIST' && artist) {
      setRole('ARTIST');
      setLoggedUserId(artist.id);
      localStorage.setItem('logged_user_email', userEmail);
      setActiveTab('my-calendar');
      showToast(`Bentornato ${artist.name}`);
    } else if (selectedRole === 'ARTIST') {
      showToast("Email artista non trovata nel database Nexuop");
    }
  };

  const copyToClipboard = async () => {
    const success = await safeCopyToClipboard(window.location.href);
    if (success) {
      setCopied(true);
      showToast("Link Nexuop copiato!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Nexuop Agency',
          text: 'Accedi alla nostra app gestionale Nexuop!',
          url: window.location.href,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  const handleSaveNewEvent = (newEvent: Event) => {
    setEvents([newEvent, ...events]);
    setIsCreateOpen(false);
    
    const newNotifs = newEvent.invitations.map(inv => ({
      id: Math.random().toString(36).substr(2, 9),
      userId: inv.artistId,
      title: 'Nuovo Evento Nexuop!',
      message: `Sei stato invitato a: ${newEvent.title} il ${newEvent.date}`,
      timestamp: new Date().toISOString(),
      read: false,
      eventId: newEvent.id
    }));
    
    setNotifications([...newNotifs, ...notifications]);
    showToast(`Evento "${newEvent.title}" creato in Nexuop!`);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleUpdateEventStatus = (status: EventStatus) => {
    if (!selectedEvent || (role !== 'ARTIST')) return;
    
    const updatedEvents = events.map(e => {
      if (e.id === selectedEvent.id) {
        return {
          ...e,
          invitations: e.invitations.map(inv => 
            inv.artistId === loggedUserId ? { ...inv, status } : inv
          )
        };
      }
      return e;
    });
    
    setEvents(updatedEvents);
    setIsDetailOpen(false);
    showToast(`Risposta inviata a Nexuop: ${status}`);
  };

  const handleMarkNotifRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Rendering dello stato di Login / Registrazione
  if (!role) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 overflow-hidden" role="main">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]" aria-hidden="true"></div>
        
        <div className="text-center mb-10 relative z-10 animate-fadeIn">
          <div className="inline-block p-4 bg-amber-950/20 rounded-full mb-6 border border-amber-500/30 shadow-2xl">
             <Sparkles size={48} className="text-amber-400" aria-hidden="true" />
          </div>
          <h1 className="text-6xl md:text-7xl theatrical-font font-bold text-amber-400 mb-4 tracking-tight drop-shadow-lg">Nexuop</h1>
          <p className="text-slate-400 max-w-sm mx-auto font-light leading-relaxed text-center">
            {isRegistering ? "Configura la tua agenzia premium." : "Gestione Premium per Agenzie di Spettacolo."}
          </p>
        </div>

        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-amber-900/30 shadow-2xl relative z-10">
          <div className="space-y-4 mb-8">
            <div>
              <label htmlFor="login-email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400/70 mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden="true" />
                <input 
                  id="login-email"
                  type="email" 
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="nome@nexuop.it" 
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-amber-400 transition-all shadow-inner"
                />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400/70 mb-2 block">Password (Solo Admin)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden="true" />
                <input 
                  id="login-password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-amber-400 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => handleLogin('ADMIN')} 
              className="group flex flex-col items-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-amber-500/50 transition-all active:scale-95"
            >
              <div className="text-amber-400 mb-2 bg-amber-900/20 p-3 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-all">
                <LogIn size={24} />
              </div>
              <span className="text-sm font-bold theatrical-font uppercase tracking-wider">Admin</span>
            </button>
            <button 
              onClick={() => handleLogin('ARTIST')} 
              className="group flex flex-col items-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-all active:scale-95"
            >
              <div className="text-indigo-400 mb-2 bg-indigo-900/20 p-3 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Users size={24} />
              </div>
              <span className="text-sm font-bold theatrical-font uppercase tracking-wider">Artista</span>
            </button>
          </div>
          
          <div className="p-4 bg-indigo-950/30 rounded-2xl border border-indigo-500/20 mb-6">
            <p className="text-[10px] text-indigo-300 uppercase font-bold tracking-widest mb-2">Link Pubblico Nexuop</p>
            <div className="flex items-center space-x-2 bg-slate-950/50 p-2 rounded-xl border border-indigo-900/30">
              <input readOnly value={window.location.href} className="bg-transparent border-none text-[10px] text-slate-400 flex-1 outline-none truncate" />
              <button onClick={copyToClipboard} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setShowInstallHelp(true)} className="py-3 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700 rounded-2xl text-[10px] font-bold text-slate-400 flex items-center justify-center space-x-2 transition-all uppercase tracking-tighter">
              <Smartphone size={14} />
              <span>Installa App</span>
            </button>
            <button onClick={handleShareApp} className="py-3 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-500/30 rounded-2xl text-[10px] font-bold text-amber-400 flex items-center justify-center space-x-2 transition-all uppercase tracking-tighter">
              <Share2 size={14} />
              <span>Condividi</span>
            </button>
          </div>
        </div>

        {toastMessage && (
          <div className="fixed top-4 right-4 bg-amber-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[100] animate-fadeIn theatrical-font font-bold flex items-center space-x-2" role="alert">
            <Check size={20} />
            <span>{toastMessage}</span>
          </div>
        )}

        {showInstallHelp && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowInstallHelp(false)}></div>
            <div className="relative bg-slate-900 border border-amber-900/40 rounded-3xl p-8 max-w-sm w-full animate-scaleIn shadow-2xl">
              <button onClick={() => setShowInstallHelp(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                <X size={20} />
              </button>
              <h3 className="text-2xl font-bold theatrical-font text-white mb-4">Guida Installazione Nexuop</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-amber-400 font-bold text-sm mb-2 flex items-center"><Smartphone size={16} className="mr-2" /> iPhone</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Tasto <b>Condividi</b> → <b>"Aggiungi alla Home"</b></p>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-indigo-400 font-bold text-sm mb-2 flex items-center"><Smartphone size={16} className="mr-2" /> Android</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Tasto <b>3 puntini</b> → <b>"Installa app"</b></p>
                </div>
              </div>
              <button onClick={() => setShowInstallHelp(false)} className="w-full mt-8 py-4 bg-amber-600 text-white font-bold rounded-xl">Ho Capito</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Layout role={role} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-fadeIn">
        {(role === 'ADMIN' || role === 'SUPER_ADMIN') && activeTab === 'dashboard' && (
          <Dashboard events={events} artists={artists} />
        )}
        
        {(activeTab === 'events' || activeTab === 'my-calendar') && (
          <EventList 
            events={(role === 'ADMIN' || role === 'SUPER_ADMIN') ? events : events.filter(e => e.invitations.some(i => i.artistId === loggedUserId && (activeTab === 'my-calendar' ? i.status === EventStatus.CONFIRMED : true)))}
            onSelectEvent={handleSelectEvent}
            onAddEvent={() => setIsCreateOpen(true)}
            isAdmin={role === 'ADMIN' || role === 'SUPER_ADMIN'}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationCenter 
            notifications={notifications.filter(n => n.userId === ((role === 'ADMIN' || role === 'SUPER_ADMIN') ? 'admin' : loggedUserId) || n.userId === 'all')} 
            onMarkAsRead={handleMarkNotifRead}
          />
        )}

        {activeTab === 'artists' && (
           <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold theatrical-font text-white">Roster Artisti Nexuop</h2>
                  <p className="text-slate-500 text-sm">Gestione membri del team creativo Nexuop</p>
                </div>
                {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                  <button onClick={() => setIsArtistModalOpen(true)} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center space-x-2">
                    <UserPlus size={16} />
                    <span>Invita Artista</span>
                  </button>
                )}
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {artists.map(artist => (
                 <div key={artist.id} className="bg-slate-900/60 p-6 rounded-3xl border border-amber-900/20">
                   <div className="flex items-center space-x-4">
                     <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white shadow-inner">{artist.name[0]}</div>
                     <div>
                       <h3 className="font-bold text-white">{artist.name}</h3>
                       <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">{artist.role}</p>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {activeTab === 'my-payments' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold theatrical-font text-white">Riepilogo Compensi</h2>
            <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-amber-900/20 overflow-hidden">
               <div className="p-12 text-center text-slate-500 italic">I pagamenti vengono elaborati mensilmente da Nexuop Gestionale.</div>
            </div>
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="fixed top-4 right-4 bg-amber-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[100] animate-fadeIn theatrical-font font-bold flex items-center space-x-2" role="alert">
          <Check size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          role={role}
          currentUserId={loggedUserId || undefined}
          onUpdateStatus={handleUpdateEventStatus}
        />
      )}

      {isCreateOpen && (
        <CreateEventModal 
          isOpen={isCreateOpen}
          artists={artists}
          onClose={() => setIsCreateOpen(false)}
          onSave={handleSaveNewEvent}
        />
      )}

      {isArtistModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90" onClick={() => setIsArtistModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-amber-900/40 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scaleIn">
             <h3 className="text-2xl font-bold theatrical-font text-white mb-6">Invita Artista in Nexuop</h3>
             <label htmlFor="invite-email-modal" className="sr-only">Email dell'artista</label>
             <input id="invite-email-modal" type="email" placeholder="email@artista.it" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white mb-4 focus:border-amber-400 outline-none" />
             <button onClick={() => { setIsArtistModalOpen(false); showToast("Invito Nexuop inviato con successo!"); }} className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition-all">Invia Invito</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
