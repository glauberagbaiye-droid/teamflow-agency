
import React, { useState } from 'react';
import { Event, Artist, EventStatus, TravelLogistics } from '../types';
import { X, Calendar, MapPin, Truck, Users, Save } from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  artists: Artist[];
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSave, artists }) => {
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    date: '',
    startTime: '',
    duration: '',
    location: '',
    venueName: '',
    description: '',
    equipment: '',
    costumes: '',
    rehearsalTime: '',
    departureTime: '',
    transportType: 'VAN' as TravelLogistics['transportType'],
    hotel: ''
  });

  const [selectedArtists, setSelectedArtists] = useState<{artistId: string, fee: number}[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Event = {
      id: 'e' + Math.random().toString(36).substr(2, 9),
      title: formData.title,
      client: formData.client,
      date: formData.date,
      startTime: formData.startTime,
      duration: formData.duration,
      location: formData.location,
      venueName: formData.venueName,
      description: formData.description,
      equipment: formData.equipment,
      costumes: formData.costumes,
      rehearsalTime: formData.rehearsalTime,
      logistics: {
        departureTime: formData.departureTime,
        transportType: formData.transportType,
        hotel: formData.hotel || undefined
      },
      invitations: selectedArtists.map(sa => ({
        artistId: sa.artistId,
        fee: sa.fee,
        status: EventStatus.PENDING,
        paymentStatus: 'PENDING'
      })),
      createdAt: new Date().toISOString()
    };
    onSave(newEvent);
  };

  const toggleArtist = (id: string) => {
    if (selectedArtists.some(sa => sa.artistId === id)) {
      setSelectedArtists(selectedArtists.filter(sa => sa.artistId !== id));
    } else {
      setSelectedArtists([...selectedArtists, { artistId: id, fee: 0 }]);
    }
  };

  const updateArtistFee = (id: string, fee: number) => {
    setSelectedArtists(selectedArtists.map(sa => 
      sa.artistId === id ? { ...sa, fee } : sa
    ));
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-amber-400 transition-colors text-sm";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-slate-900 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-amber-900/40 shadow-2xl flex flex-col animate-fadeIn">
        <div className="px-6 py-4 border-b border-amber-900/20 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-600 rounded-lg">
              <Save size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold theatrical-font text-white">Nuovo Evento Nexuop</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="flex items-center text-amber-400 font-bold text-sm border-b border-amber-900/20 pb-2">
              <Calendar size={16} className="mr-2" /> Dettagli Principali
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Titolo Evento *</label>
                <input required type="text" className={inputClass} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Es: Galà d'Inverno" />
              </div>
              <div>
                <label className={labelClass}>Cliente</label>
                <input type="text" className={inputClass} value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} placeholder="Nome azienda o privato" />
              </div>
              <div>
                <label className={labelClass}>Data *</label>
                <input required type="date" className={inputClass} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Inizio Show *</label>
                  <input required type="time" className={inputClass} value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Durata</label>
                  <input type="text" className={inputClass} value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="Es: 2h" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center text-amber-400 font-bold text-sm border-b border-amber-900/20 pb-2">
              <MapPin size={16} className="mr-2" /> Location & Logistica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nome Venue *</label>
                <input required type="text" className={inputClass} value={formData.venueName} onChange={e => setFormData({...formData, venueName: e.target.value})} placeholder="Es: Villa Miani" />
              </div>
              <div>
                <label className={labelClass}>Indirizzo *</label>
                <input required type="text" className={inputClass} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Città, via..." />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Orario Partenza</label>
                  <input type="time" className={inputClass} value={formData.departureTime} onChange={e => setFormData({...formData, departureTime: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Mezzo</label>
                  <select className={inputClass} value={formData.transportType} onChange={e => setFormData({...formData, transportType: e.target.value as any})}>
                    <option value="VAN">Van Nexuop</option>
                    <option value="CAR">Auto Privata</option>
                    <option value="TRAIN">Treno</option>
                    <option value="PLANE">Aereo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pb-4">
            <h3 className="flex items-center text-amber-400 font-bold text-sm border-b border-amber-900/20 pb-2">
              <Users size={16} className="mr-2" /> Selezione Cast Nexuop
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {artists.map(artist => {
                const isSelected = selectedArtists.some(sa => sa.artistId === artist.id);
                return (
                  <div key={artist.id} className={`p-3 rounded-xl border transition-all ${isSelected ? 'bg-amber-600/10 border-amber-400' : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleArtist(artist.id)} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 bg-slate-900 border-slate-700" />
                        <span className="text-sm font-medium">{artist.name}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-[10px] text-amber-400 font-bold">€</span>
                        <input 
                          type="number" 
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs w-full"
                          placeholder="Cachet"
                          value={selectedArtists.find(sa => sa.artistId === artist.id)?.fee || ''}
                          onChange={e => updateArtistFee(artist.id, parseInt(e.target.value) || 0)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        <div className="px-6 py-4 bg-slate-900 border-t border-amber-900/20 flex space-x-3">
          <button onClick={onClose} type="button" className="flex-1 py-3 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 transition-colors">
            Annulla
          </button>
          <button onClick={handleSubmit} type="button" className="flex-1 py-3 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center">
            <Save size={18} className="mr-2" /> Crea in Nexuop
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;
