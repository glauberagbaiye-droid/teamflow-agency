
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

export const safeCopyToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {}
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
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

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `Nexuop_Report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
