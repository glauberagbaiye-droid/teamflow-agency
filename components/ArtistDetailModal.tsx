
import React, { useState, useEffect } from 'react';
import { Artist, Event } from '../types';
import { X, Calendar, Euro, Briefcase, Award, TrendingUp, History, Key, Wand2, Loader2, MessageSquare, Mail, Copy, Check, UserMinus, Edit2, Save } from 'lucide-react';
import { formatDate, generateWhatsAppLink, generateEmailLink, safeCopyToClipboard } from '../utils/helpers';
import { GoogleGenAI } from "@google/genai";

interface ArtistDetailModalProps {
  artist: any; 
  events: Event[];
  isOpen: boolean;
  onClose: () => void;
  onDeleteArtist?: (id: string) => void;
  onUpdateArtist?: (updatedArtist: any) => void;
}

const ArtistDetailModal: React.FC<ArtistDetailModalProps> = ({ artist, events, isOpen, onClose, onDeleteArtist, onUpdateArtist }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Stati per la modifica
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    password: ''
  });

  useEffect(() => {
    if (isOpen && artist) {
      setEditFormData({
        name: artist.name,
        email: artist.email,
        phone: artist.phone || '',
        role: artist.role,
        password: artist.password || ''
      });
      setIsEditing(false);
      setGeneratedMessage(null);
    }
  }, [isOpen, artist]);

  if (!isOpen) return null;

  const artistEvents = events.filter(e => 
    e.invitations.some(inv => inv.artistId === artist.id)
  ).map(e => ({
    event: e,
    invitation: e.invitations.find(inv => inv.artistId === artist.id)!
  })).sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());

  const totalPaid = artistEvents.reduce((sum, item) => sum + item.invitation.fee, 0);

  const generateCredentialsInvite = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Sei l'amministratore dell'agenzia Nexuop. 
      Scrivi un messaggio di benvenuto formale e professionale per l'artista ${artist.name}.
      Spiegagli che ora ha accesso alla piattaforma gestionale dell'agenzia.
      Includi questi dati di accesso chiaramente:
      - Link App: ${window.location.origin}
      - Tua Email: ${artist.email}
      - Tua Password: ${artist.password}
      
      Invitalo ad accedere per vedere i suoi prossimi show e gestire i pagamenti.
      Scrivi solo il corpo del messaggio.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setGeneratedMessage(response.text || '');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Sei sicuro di voler rimuovere ${artist.name} dall'agenzia? Non potrà più accedere all'app.`)) {
      onDeleteArtist?.(artist.id);
      onClose();
    }
  };

  const handleSaveEdit = () => {
    onUpdateArtist?.({
      ...artist,
      ...editFormData
    });
    setIsEditing(false);
  };

  const inputClass = "w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-amber-400 text-sm";
  const labelClass = "text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1 block";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-slate-900 w-full max-w-2xl max-h-[90dvh] overflow-hidden rounded-[2.5rem] border border-amber-900/30 shadow-2xl flex flex-col animate-scaleIn">
        
        <div className="p-8 bg-gradient-to-b from-amber-600/10 to-transparent border-b border-amber-900/10 shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-xl border-2 border-amber-400/30">
                {artist.name[0]}
              </div>
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      className={inputClass} 
                      value={editFormData.name} 
                      onChange={e => setEditFormData({...editFormData, name: e.target.value})} 
                      placeholder="Nome Artistico"
                    />
                    <input 
                      type="text" 
                      className={`${inputClass} !py-1 !text-[10px]`} 
                      value={editFormData.role} 
                      onChange={e => setEditFormData({...editFormData, role: e.target.value})} 
                      placeholder="Ruolo"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold theatrical-font text-white">{artist.name}</h2>
                    <div className="flex items-center text-amber-400 font-bold uppercase tracking-widest text-[10px] mt-1">
                      <Award size={12} className="mr-1" /> {artist.role}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)}
                className={`p-2 rounded-full transition-colors ${isEditing ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                title={isEditing ? "Salva" : "Modifica"}
              >
                {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
              </button>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-emerald-500/20">
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Totale Maturato</p>
              <p className="text-2xl font-bold text-emerald-400">€{totalPaid.toLocaleString()}</p>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-blue-500/20">
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Eventi Fatti</p>
              <p className="text-2xl font-bold text-blue-400">{artistEvents.length}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-4 flex items-center">
              <Key size={14} className="mr-2" /> Credenziali & Contatti
            </h3>
            <div className="bg-slate-950/40 p-5 rounded-[2rem] border border-slate-800 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Email (Username)</label>
                    <input 
                      type="email" 
                      className={inputClass} 
                      value={editFormData.email} 
                      onChange={e => setEditFormData({...editFormData, email: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Telefono</label>
                    <input 
                      type="tel" 
                      className={inputClass} 
                      value={editFormData.phone} 
                      onChange={e => setEditFormData({...editFormData, phone: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Password</label>
                    <input 
                      type="text" 
                      className={`${inputClass} font-mono tracking-widest text-amber-400`} 
                      value={editFormData.password} 
                      onChange={e => setEditFormData({...editFormData, password: e.target.value})} 
                    />
                  </div>
                  <button 
                    onClick={handleSaveEdit}
                    className="w-full bg-emerald-600 text-white p-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Applica Modifiche
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-white font-bold">{artist.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Telefono:</span>
                    <span className="text-white font-bold">{artist.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Password:</span>
                    <span className="text-amber-400 font-mono font-bold tracking-widest">{artist.password}</span>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      onClick={generateCredentialsInvite}
                      disabled={isGenerating}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl font-bold text-xs uppercase flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg"
                    >
                      {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                      <span>Genera Messaggio Benvenuto AI</span>
                    </button>
                  </div>

                  {generatedMessage && (
                    <div className="mt-4 bg-slate-900 border border-indigo-500/20 p-4 rounded-2xl animate-fadeIn">
                       <p className="text-[11px] text-slate-400 italic leading-relaxed mb-4">"{generatedMessage.substring(0, 120)}..."</p>
                       <div className="flex gap-2">
                         <button onClick={() => window.open(generateWhatsAppLink(artist.phone || '', generatedMessage), '_blank')} className="flex-1 bg-emerald-600 p-3 rounded-xl flex items-center justify-center"><MessageSquare size={16} /></button>
                         <button onClick={() => window.open(generateEmailLink(artist.email, 'Accesso Nexuop Agency', generatedMessage), '_blank')} className="flex-1 bg-blue-600 p-3 rounded-xl flex items-center justify-center"><Mail size={16} /></button>
                         <button onClick={async () => { if(await safeCopyToClipboard(generatedMessage)) { setCopied(true); setTimeout(()=>setCopied(false),2000); } }} className="flex-1 bg-slate-800 p-3 rounded-xl flex items-center justify-center border border-slate-700">
                            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                         </button>
                       </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center">
              <History size={16} className="mr-2" /> Storico Show
            </h3>
            <div className="space-y-3">
              {artistEvents.length > 0 ? artistEvents.map(({ event, invitation }, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                  <div>
                    <h4 className="text-sm font-bold text-white">{event.title}</h4>
                    <p className="text-[10px] text-slate-500">{formatDate(event.date)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-amber-400">€{invitation.fee.toLocaleString()}</div>
                    <p className="text-[9px] uppercase font-bold text-slate-600">{event.venueName}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center py-6 text-slate-600 italic text-xs">Nessuno show registrato.</p>
              )}
            </div>
          </section>

          <section className="pt-4">
            <button 
              onClick={handleDelete}
              className="w-full py-4 border border-rose-500/30 bg-rose-500/5 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center space-x-2"
            >
              <UserMinus size={16} />
              <span>Rimuovi Artista dall'Agenzia</span>
            </button>
          </section>
        </div>
        
        <div className="p-6 bg-slate-900 border-t border-amber-900/10 shrink-0 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <button onClick={onClose} className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs font-bold transition-colors uppercase tracking-widest">
            {isEditing ? 'Annulla Modifiche' : 'Chiudi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtistDetailModal;
