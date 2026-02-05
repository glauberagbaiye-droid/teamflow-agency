
export type UserRole = 'ADMIN' | 'ARTIST' | 'SUPER_ADMIN';

export enum EventStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface Artist {
  id: string;
  name: string;
  email: string;
  role: string; // e.g., "Acrobat", "Singer", "DJ"
}

export interface TravelLogistics {
  departureTime: string;
  transportType: 'VAN' | 'PLANE' | 'TRAIN' | 'CAR';
  hotel?: string;
}

export interface EventInvitation {
  artistId: string;
  status: EventStatus;
  fee: number;
  paymentStatus: 'PENDING' | 'PAID';
}

export interface Event {
  id: string;
  title: string;
  client?: string;
  date: string;
  startTime: string;
  duration: string;
  location: string;
  venueName: string;
  description: string;
  equipment: string;
  costumes: string;
  rehearsalTime?: string;
  logistics: TravelLogistics;
  invitations: EventInvitation[];
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  eventId?: string;
}
