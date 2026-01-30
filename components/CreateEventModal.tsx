import React, { useState } from 'react';
import { Event, Artist, EventStatus, TravelLogistics } from '../types';
import { X, Calendar, MapPin, Clock, Truck, Users, Save } from 'lucide-react';

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
    hotel: '',
    eventRevenue: ''
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
      invitations: [
        {
          artistId: 'admin',
          fee: 0,
          status: EventStatus.CONFIRMED,
          paymentStatus: 'CONFIRMED'
        },
        ...selectedArtists.map(sa => ({
          artistId: sa.artistId,
          fee: sa.fee,
          status: EventStatus.PENDING,
          paymentStatus: 'PENDING'
        }))
      ],
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      <div 
        role="dialog"
        aria-modal="true"
        className="relative bg-slate-900 w-full max-w-2xl h-[90vh] md:max-h-[85vh] overflow-hidden rounded-3xl border border-amber-900/40 shadow-2xl flex flex-col"
      >
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md px-6 py-4 border-b border-amber-900/20 flex justify-between items-center z-10 shrink-0">
          <h2 className="text-2xl font-bold theatrical-font text-white">Nuovo Evento</h2>
          <button 
            onClick={onClose}
            aria-label="Chiudi"
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-6 space-y-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">Titolo Evento *</label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={inputClass}
                  placeholder="Es: Spettacolo Teatrale"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">Client *</label>
                <input 
                  type="text"
                  required
                  value={formData.client}
                  onChange={(e) => setFormData({...formData, client: e.target.value})}
                  className={inputClass}
                  placeholder="Es: Teatro Alla Scala"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2 flex items-center">
                  <Calendar size={16} className="mr-2" aria-hidden="true" /> Data *
                </label>
                <input 
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2 flex items-center">
                  <Clock size={16} className="mr-2" aria-hidden="true" /> Ora Inizio *
                </label>
                <input 
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">Durata *</label>
                <input 
                  type="text"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className={inputClass}
                  placeholder="Es: 2h 30m"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2 flex items-center">
                  <MapPin size={16} className="mr-2" aria-hidden="true" /> Venue *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.venueName}
                  onChange={(e) => setFormData({...formData, venueName: e.target.value})}
                  className={inputClass}
                  placeholder="Es: Teatro Principale"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-400 mb-2">Location/Indirizzo *</label>
              <input 
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className={inputClass}
                placeholder="Es: Via Roma 123, Milano"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-400 mb-2">Descrizione</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className={`${inputClass} resize-none h-20`}
                placeholder="Dettagli aggiuntivi..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2 flex items-center">
                  <Truck size={16} className="mr-2" aria-hidden="true" /> Equipment
                </label>
                <input 
                  type="text"
                  value={formData.equipment}
                  onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                  className={inputClass}
                  placeholder="Es: Luci, Suono, Scenografia"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">Costumi</label>
                <input 
                  type="text"
                  value={formData.costumes}
                  onChange={(e) => setFormData({...formData, costumes: e.target.value})}
                  className={inputClass}
                  placeholder="Es: Abiti Epoca"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">Ora Prova</label>
                <input 
                  type="time"
                  value={formData.rehearsalTime}
                  onChange={(e) => setFormData({...formData, rehearsalTime: e.target.value})}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">Ora Partenza</label>
                <input 
                  type="time"
                  value={formData.departureTime}
                  onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">Tipo Trasporto</label>
                <select 
                  value={formData.transportType}
                  onChange={(e) => setFormData({...formData, transportType: e.target.value as any})}
                  className={inputClass}
                >
                  <option value="VAN">Van</option>
                  <option value="BUS">Bus</option>
                  <option value="CAR">Auto</option>
                  <option value="TRAIN">Treno</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">Hotel</label>
                <input 
                  type="text"
                  value={formData.hotel}
                  onChange={(e) => setFormData({...formData, hotel: e.target.value})}
                  className={inputClass}
                  placeholder="Nome Hotel"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-400 mb-2">💰 Quanto Guadagnerò (Ricavi Evento)</label>
              <input 
                type="number"
                min="0"
                step="0.01"
                value={formData.eventRevenue}
                onChange={(e) => setFormData({...formData, eventRevenue: e.target.value})}
                className={inputClass}
                placeholder="Es: 5000"
              />
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Users size={20} className="mr-2" aria-hidden="true" /> Seleziona Artisti
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {artists.map(artist => (
                  <div key={artist.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <div className="flex items-center space-x-3 flex-1">
                      <input 
                        type="checkbox"
                        id={`artist-${artist.id}`}
                        checked={selectedArtists.some(sa => sa.artistId === artist.id)}
                        onChange={() => toggleArtist(artist.id)}
                        className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-400"
                      />
                      <label htmlFor={`artist-${artist.id}`} className="text-white font-semibold flex-1">
                        {artist.name}
                      </label>
                    </div>
                    {selectedArtists.some(sa => sa.artistId === artist.id) && (
                      <div className="flex items-center space-x-2">
                        <label className="text-slate-400 text-sm">Fee: €</label>
                        <input 
                          type="number"
                          min="0"
                          value={selectedArtists.find(sa => sa.artistId === artist.id)?.fee || 0}
                          onChange={(e) => updateArtistFee(artist.id, parseFloat(e.target.value))}
                          className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md p-4 border-t border-slate-700 shrink-0 z-20 pb-8 md:pb-4">
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
              >
                Annulla
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-900/20 transition-all active:scale-95"
              >
                <Save size={20} aria-hidden="true" />
                <span>Crea Evento</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
