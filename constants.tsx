
import React from 'react';
import { Artist, Event, EventStatus } from './types';

export const COLORS = {
  PURPLE: 'bg-indigo-900',
  GOLD: 'text-amber-400',
  GOLD_BG: 'bg-amber-600',
  RED: 'bg-rose-700',
  NIGHT_BLUE: 'bg-slate-950',
};

export const MOCK_ARTISTS: Artist[] = [
  { id: '1', name: 'Marco Valerio', email: 'marco@example.com', role: 'Magician' },
  { id: '2', name: 'Elena Rossi', email: 'elena@example.com', role: 'Singer' },
  { id: '3', name: 'Luca Bianchi', email: 'luca@example.com', role: 'Acrobat' },
  { id: '4', name: 'Sofia Verdi', email: 'sofia@example.com', role: 'Dancer' },
  { id: '5', name: 'Giorgio Neri', email: 'giorgio@example.com', role: 'DJ' },
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Gala di Primavera',
    client: 'Teatro dell\'Opera',
    date: '2024-05-15',
    startTime: '20:00',
    duration: '3h',
    location: 'Piazza della Scala, Milano',
    venueName: 'Teatro alla Scala',
    description: 'Serata di beneficenza con performance acrobatiche e musica dal vivo.',
    equipment: 'Set luci LED, Mixer audio 12ch',
    costumes: 'Abito da sera nero con dettagli dorati',
    rehearsalTime: '15:00',
    logistics: {
      departureTime: '12:00',
      transportType: 'VAN',
      hotel: 'Hotel Splendido'
    },
    invitations: [
      { artistId: '1', status: EventStatus.CONFIRMED, fee: 500, paymentStatus: 'PAID' },
      { artistId: '2', status: EventStatus.PENDING, fee: 400, paymentStatus: 'PENDING' },
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'e2',
    title: 'Festival del Fuoco',
    client: 'Comune di Firenze',
    date: '2024-06-21',
    startTime: '21:30',
    duration: '1h',
    location: 'Piazzale Michelangelo, Firenze',
    venueName: 'Belvedere',
    description: 'Performance di teatro danza con effetti pirotecnici.',
    equipment: 'Galleggianti ignifughi, Impianto Bose',
    costumes: 'Tuta rossa e argento elasticizzata',
    rehearsalTime: '18:00',
    logistics: {
      departureTime: '14:00',
      transportType: 'CAR'
    },
    invitations: [
      { artistId: '3', status: EventStatus.CONFIRMED, fee: 800, paymentStatus: 'PENDING' },
      { artistId: '4', status: EventStatus.CONFIRMED, fee: 600, paymentStatus: 'PENDING' },
    ],
    createdAt: new Date().toISOString()
  }
];
