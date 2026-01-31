
import { Event, EventStatus } from '../types';

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const getStatusColor = (status: EventStatus) => {
  switch (status) {
    case EventStatus.CONFIRMED:
      return 'bg-emerald-500 text-white';
    case EventStatus.PENDING:
      return 'bg-amber-500 text-black';
    case EventStatus.REJECTED:
      return 'bg-rose-600 text-white';
    case EventStatus.CANCELLED:
      return 'bg-slate-600 text-white';
    default:
      return 'bg-slate-400 text-white';
  }
};

export const getStatusLabel = (status: EventStatus) => {
  switch (status) {
    case EventStatus.CONFIRMED: return 'Confermato';
    case EventStatus.PENDING: return 'In Attesa';
    case EventStatus.REJECTED: return 'Rifiutato';
    case EventStatus.CANCELLED: return 'Annullato';
    default: return status;
  }
};

export const generateMapsLink = (location: string) => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
};

export const generateGoogleCalendarLink = (event: Event) => {
  const formatTime = (date: string, time: string) => {
    return date.replace(/-/g, '') + 'T' + time.replace(/:/g, '') + '00';
  };
  const start = formatTime(event.date, event.startTime);
  const end = formatTime(event.date, event.startTime);
  const details = `${event.description}\n\nVenue: ${event.venueName}\nLocation: ${event.location}`;
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(event.location)}&sf=true&output=xml`;
};

/**
 * Genera un file ICS con eventi multipli per iPhone/Mac/Android
 */
export const syncAllEventsToMobile = (events: Event[]) => {
  if (events.length === 0) return;

  const formatDateICS = (date: string, time: string) => {
    return date.replace(/-/g, '') + 'T' + time.replace(/:/g, '') + '00';
  };

  const icsHeader = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nexuop//Agency Management//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  const icsEvents = events.map(event => {
    const start = formatDateICS(event.date, event.startTime);
    return [
      'BEGIN:VEVENT',
      `UID:${event.id}@nexuop.agency`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${start}`,
      `DTEND:${start}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')} - Venue: ${event.venueName}`,
      `LOCATION:${event.location}`,
      'END:VEVENT'
    ].join('\n');
  });

  const icsFooter = ['END:VCALENDAR'];
  const fullICS = [...icsHeader, ...icsEvents, ...icsFooter].join('\n');

  const blob = new Blob([fullICS], { type: 'text/calendar;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `Nexuop_Full_Sync.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateWhatsAppLink = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const generateEmailLink = (email: string, subject: string, body: string) => {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export const downloadCalendarFile = (event: Event) => {
  syncAllEventsToMobile([event]);
};

export const safeCopyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback per browser non sicuri o vecchi
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (e) {
    return false;
  }
};

export const exportEventsToCSV = (events: Event[]) => {
  const headers = ['Titolo', 'Data', 'Location', 'Cliente', 'Costo Totale', 'Stato'];
  const rows = events.map(e => [
    e.title,
    e.date,
    e.venueName,
    e.client || '',
    e.invitations.reduce((acc, i) => acc + i.fee, 0),
    e.invitations.every(i => i.status === EventStatus.CONFIRMED) ? 'Confermato' : 'Pendente'
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `Nexuop_Report.csv`);
  link.click();
};
