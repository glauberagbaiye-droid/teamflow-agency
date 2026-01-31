
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
  // Stato autenticazione
  const [role, setRole] = useState<UserRole | null>(null);
  const [loggedUserId, setLoggedUserId] = useState<string | null>(localStorage.getItem('logged_user_id'));
  const [isRegistering, setIsRegistering] = useState(false);
  const [agencyProfile, setAgencyProfile] = useState<{name: string, email: string, pass: string} | null>(() => {
    const saved = localStorage.getItem('tf_agency_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // Campi form
  const [userEmail, setUserEmail] = useState(agencyProfile ? '' : 'nexuoperativa@gmail.com');
  const [password, setPassword] = useState('');
  const [regAgencyName, setRegAgencyName] = useState('Nexuop');
  
  // Tab attiva e messaggi
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Dati applicazione
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('tf_events_v3');
    return saved ? JSON.parse(saved) : MOCK_EVENTS;
  });
  
  const [artists, setArtists] = useState<any[]>(() => {
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

  // SICUREZZA: Monitora se l'artista loggato esiste ancora nel database
  useEffect(() => {
    if (role === 'ARTIST' && loggedUserId) {
      const stillExists = artists.some(a => a.id === loggedUserId);
      if (!stillExists) {
        handleLogout();
        showToast("Il tuo profilo è stato rimosso dall'agenzia.");
      }
    }
  }, [artists, role, loggedUserId]);

  useEffect(() => {
    localStorage.setItem('tf_events_v3', JSON.stringify(events));
    localStorage.setItem('tf_artists_v3', JSON.stringify(artists));
    localStorage.setItem('tf_notifications_v3', JSON.stringify(notifications));
    if (agencyProfile) {
      localStorage.setItem('tf_agency_profile', JSON.stringify(agencyProfile));
    }
    if (loggedUserId) {
      localStorage.setItem('logged_user_id', loggedUserId);
    } else {
      localStorage.removeItem('logged_user_id');
    }
  }, [events, artists, notifications, agencyProfile, loggedUserId]);

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role') as UserRole;
    if (savedRole) {
      setRole(savedRole);
      setActiveTab(savedRole === 'ADMIN' ? 'dashboard' : 'my-calendar');
    }
    if (!agencyProfile) {
      setIsRegistering(true);
    }
    requestNotificationPermission();
  }, [agencyProfile]);

  const handleRegisterAgency = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = { name: regAgencyName, email: userEmail, pass: password };
    setAgencyProfile(profile);
    setIsRegistering(false);
    showToast("Profilo Nexuop Attivato!");
  };

  const handleLogin = (selectedRole: UserRole) => {
    if (!userEmail || !password) {
      showToast("Inserisci email e password");
      return;
    }

    if (selectedRole === 'ADMIN') {
      if (agencyProfile && userEmail.toLowerCase() === agencyProfile.email.toLowerCase() && password === agencyProfile.pass) {
        setRole('ADMIN');
        setLoggedUserId('admin');
        localStorage.setItem('user_role', 'ADMIN');
        setActiveTab('dashboard');
      } else {
        showToast("Credenziali Amministratore non valide");
        return;
      }
    } else {
      const artist = artists.find(a => a.email.toLowerCase() === userEmail.toLowerCase() && a.password === password);
      if (artist) {
        setRole('ARTIST');
        setLoggedUserId(artist.id);
        localStorage.setItem('user_role', 'ARTIST');
        setActiveTab('my-calendar');
      } else {
        showToast("Email o Password Artista errata");
        return;
      }
    }
    setPassword('');
    showToast(`Benvenuto in ${agencyProfile?.name || 'Nexuop'}`);
  };

  const handleLogout = () => {
    setRole(null);
    setLoggedUserId(null);
    localStorage.removeItem('user_role');
    localStorage.removeItem('logged_user_id');
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateEventStatus = (status: EventStatus) => {
    if (!selectedEvent || !loggedUserId) return;
    setEvents(events.map(e => e.id === selectedEvent.id ? {
      ...e, invitations: e.invitations.map(inv => inv.artistId === loggedUserId ? { ...inv, status } : inv)
    } : e));
    setIsDetailOpen(false);
    showToast(`Invito ${status === 'CONFIRMED' ? 'Accettato' : 'Rifiutato'}`);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    showToast('Evento eliminato');
  };

  const handleDeleteArtist = (artistId: string) => {
    setArtists(artists.filter(a => a.id !== artistId));
    setEvents(events.map(e => ({
      ...e,
      invitations: e.invitations.filter(inv => inv.artistId !== artistId)
    })));
    showToast('Artista rimosso permanentemente');
  };

  const handleUpdateArtist = (updatedArtist: any) => {
    setArtists(artists.map(a => a.id === updatedArtist.id ? updatedArtist : a));
    showToast(`Profilo di ${updatedArtist.name} aggiornato`);
  };

  const handleSaveNewEvent = (newEvent: Event) => {
    setEvents(prev => [...prev, newEvent]);
    showToast('Show creato con successo!');
  };

  const handleResetData = () => {
    if (window.confirm('Cancellare TUTTI i dati?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (isRegistering && !role) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-10 animate-fadeIn">
          <Rocket size={48} className="text-amber-400 mx-auto mb-4" />
          <h1 className="text-4xl theatrical-font font-bold text-amber-400 mb-2">Attiva Nexuop</h1>
        </div>
        <form onSubmit={handleRegisterAgency} className="w-full max-w-md bg-slate-900 p-8 rounded-[2.5rem] border border-amber-900/30 shadow-2xl space-y-5">
          <input required type="text" value={regAgencyName} onChange={(e) => setRegAgencyName(e.target.value)} placeholder="Nome Agenzia" className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-6 text-white outline-none focus:border-amber-400" />
          <input required type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="Email Admin" className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-6 text-white outline-none focus:border-amber-400" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password Admin" className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-6 text-white outline-none focus:border-amber-400" />
          <button type="submit" className="w-full bg-amber-600 text-white font-black py-5 rounded-2xl active:scale-95 transition-all uppercase text-xs">Crea Agenzia</button>
        </form>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-10 animate-fadeIn">
          <Sparkles size={48} className="text-amber-400 mx-auto mb-4" />
          <h1 className="text-5xl theatrical-font font-bold text-amber-400 mb-4">{agencyProfile?.name || 'Nexuop'}</h1>
        </div>
        <div className="w-full max-w-md bg-slate-900 p-8 rounded-[2.5rem] border border-amber-900/30 shadow-2xl space-y-6">
          <div className="space-y-4">
            <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-6 text-white outline-none focus:border-amber-400" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-6 text-white outline-none focus:border-amber-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleLogin('ADMIN')} className="flex flex-col items-center p-4 bg-amber-600 rounded-2xl text-white active:scale-95"><ShieldCheck size={20} className="mb-2" /><span className="text-[10px] font-bold uppercase">Admin</span></button>
            <button onClick={() => handleLogin('ARTIST')} className="flex flex-col items-center p-4 bg-slate-800 rounded-2xl text-slate-300 active:scale-95"><Users size={20} className="mb-2" /><span className="text-[10px] font-bold uppercase">Artista</span></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout role={role!} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-fadeIn">
        {activeTab === 'dashboard' && role === 'ADMIN' && (
          <Dashboard events={events} artists={artists} onSelectEvent={(e) => { setSelectedEvent(e); setIsDetailOpen(true); }} onDeleteEvent={handleDeleteEvent} onResetData={handleResetData} />
        )}
        {activeTab === 'events' && (
          <EventList events={events} onSelectEvent={(e) => { setSelectedEvent(e); setIsDetailOpen(true); }} onAddEvent={() => setIsCreateOpen(true)} role={role!} />
        )}
        {activeTab === 'confirmed-events' && (
          <EventList events={events.filter(e => e.invitations.length > 0 && e.invitations.every(inv => inv.status === EventStatus.CONFIRMED))} onSelectEvent={(e) => { setSelectedEvent(e); setIsDetailOpen(true); }} role={role!} isConfirmedView={true} />
        )}
        {activeTab === 'my-calendar' && role === 'ARTIST' && (
          <EventList events={events.filter(e => e.invitations.some(i => i.artistId === loggedUserId))} onSelectEvent={(e) => { setSelectedEvent(e); setIsDetailOpen(true); }} role={role} />
        )}
        {activeTab === 'payments' && role === 'ARTIST' && loggedUserId && (
          <PaymentsView events={events} artistId={loggedUserId} />
        )}
        {activeTab === 'artists' && role === 'ADMIN' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold theatrical-font text-white">Roster Artisti</h2>
              <button onClick={() => setIsArtistModalOpen(true)} className="bg-amber-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase flex items-center space-x-2"><UserPlus size={16} /> <span>Nuovo Artista</span></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {artists.map(artist => (
                  <div key={artist.id} onClick={() => { setSelectedArtist(artist); setIsArtistDetailOpen(true); }} className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 hover:border-amber-400 transition-all cursor-pointer">
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
      {toastMessage && <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-amber-600 text-white px-8 py-4 rounded-[1.5rem] shadow-2xl z-[100] animate-fadeIn font-black uppercase text-[10px]">{toastMessage}</div>}
      {selectedEvent && <EventDetailModal event={selectedEvent} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} role={role!} artists={artists} currentUserId={loggedUserId || ''} onUpdateStatus={handleUpdateEventStatus} onDeleteEvent={handleDeleteEvent} />}
      {selectedArtist && <ArtistDetailModal artist={selectedArtist} events={events} isOpen={isArtistDetailOpen} onClose={() => setIsArtistDetailOpen(false)} onDeleteArtist={handleDeleteArtist} onUpdateArtist={handleUpdateArtist} />}
      {isCreateOpen && <CreateEventModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSave={handleSaveNewEvent} artists={artists} />}
      <AddArtistModal isOpen={isArtistModalOpen} onClose={() => setIsArtistModalOpen(false)} onAddArtist={(a) => setArtists([...artists, a])} />
    </Layout>
  );
};

export default App;
