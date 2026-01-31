
import React, { useState, useEffect } from 'react';
import { Artist } from '../types';
import { X, UserPlus, Mail, Phone, Briefcase, Users, Save, Lock, RefreshCw } from 'lucide-react';

interface AddArtistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddArtist: (artist: any) => void;
}

const AddArtistModal: React.FC<AddArtistModalProps> = ({ isOpen, onClose, onAddArtist }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    group: '',
    password: ''
  });

  // Genera password automatica all'apertura
  useEffect(() => {
    if (isOpen) {
      generatePass();
    }
  }, [isOpen]);

  const generatePass = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pass = "";
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: pass }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newArtist = {
      id: 'a' + Math.random().toString(36).substr(2, 9),
      ...formData
    };
    onAddArtist(newArtist);
    onClose();
    // Reset form
    setFormData({ name: '', email: '', role: '', phone: '', group: '', password: '' });
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-400 transition-colors text-sm";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-slate-900 w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-[2.5rem] border border-amber-900/40 shadow-2xl animate-scaleIn custom-scrollbar">
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md px-6 py-4 border-b border-amber-900/20 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold theatrical-font text-white flex items-center">
            <UserPlus className="mr-2 text-amber-400" size={20} /> Onboarding Artista
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 mb-4">
            <p className="text-[11px] text-amber-200 leading-tight">La password è stata generata automaticamente. Una volta creato il profilo, potrai inviare le credenziali all'artista.</p>
          </div>

          <div>
            <label className={labelClass}>Nome Artistico *</label>
            <input required type="text" className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nome e Cognome" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email / Username *</label>
              <input required type="email" className={inputClass} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@esempio.it" />
            </div>
            <div>
              <label className={labelClass}>Telefono *</label>
              <input required type="tel" className={inputClass} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+39..." />
            </div>
          </div>

          <div>
            <label className={labelClass}>Password Generata</label>
            <div className="relative">
              <input 
                readOnly
                type="text" 
                className={`${inputClass} bg-slate-950 border-amber-500/30 font-mono font-bold text-amber-400 tracking-widest`}
                value={formData.password} 
              />
              <button 
                type="button" 
                onClick={generatePass}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 p-1"
                title="Rigenera Password"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Disciplina / Specialità *</label>
            <input required type="text" className={inputClass} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="Es: Pole Dancer, DJ, Presentatore..." />
          </div>

          <button type="submit" className="w-full mt-4 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-95 uppercase text-xs tracking-widest">
            <Save size={18} className="mr-2" /> Registra in Agenzia
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddArtistModal;
