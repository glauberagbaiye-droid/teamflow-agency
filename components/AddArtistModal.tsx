
import React, { useState } from 'react';
import { Artist } from '../types';
import { X, UserPlus, Mail, Phone, Briefcase, Users, Save } from 'lucide-react';

interface AddArtistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddArtist: (artist: Artist) => void;
}

const AddArtistModal: React.FC<AddArtistModalProps> = ({ isOpen, onClose, onAddArtist }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    group: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newArtist: Artist = {
      id: 'a' + Math.random().toString(36).substr(2, 9),
      ...formData
    };
    onAddArtist(newArtist);
    onClose();
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-400 transition-colors text-sm";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-slate-900 w-full max-w-md overflow-hidden rounded-3xl border border-amber-900/40 shadow-2xl animate-scaleIn">
        <div className="px-6 py-4 border-b border-amber-900/20 flex justify-between items-center">
          <h2 className="text-xl font-bold theatrical-font text-white flex items-center">
            <UserPlus className="mr-2 text-amber-400" size={20} /> Invita Artista
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Nome Completo</label>
            <input required type="text" className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Es: Mario Rossi" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email</label>
              <input required type="email" className={inputClass} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="mario@email.it" />
            </div>
            <div>
              <label className={labelClass}>Telefono</label>
              <input type="tel" className={inputClass} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+39..." />
            </div>
          </div>
          <div>
            <label className={labelClass}>Ruolo / Disciplina</label>
            <input required type="text" className={inputClass} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="Es: Cantante, Acrobat, DJ..." />
          </div>
          <div>
            <label className={labelClass}>Gruppo / Agenzia</label>
            <input type="text" className={inputClass} value={formData.group} onChange={e => setFormData({...formData, group: e.target.value})} placeholder="Es: Freelance, Team A..." />
          </div>
          <button type="submit" className="w-full mt-4 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center">
            <Save size={18} className="mr-2" /> Registra Artista
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddArtistModal;
