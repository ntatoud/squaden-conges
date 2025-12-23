import { LeaveStatus, LeaveTimeSlot, LeaveType } from '@/features/leave/schema';

export const LEAVE_TYPES = [
  {
    id: 'kids',
    label: 'Bezos',
  },
  {
    id: 'school-review',
    label: 'En retard pour mes exams',
  },
  {
    id: 'sickness',
    label: 'Trop mangé de raclette',
  },
  {
    id: 'vacation',
    label: 'Au bled',
  },
] as const satisfies Array<{ id: LeaveType; label: React.ReactNode }>;

export const LEAVE_STATUS = [
  {
    id: 'approved',
    label: 'Confirmé',
  },
  {
    id: 'cancelled',
    label: 'Annulé',
  },
  {
    id: 'pending',
    label: 'En attente',
  },
  {
    id: 'pending-manager',
    label: 'En attente du manager',
  },
  {
    id: 'refused',
    label: 'Refusé',
  },
] as const satisfies Array<{ id: LeaveStatus; label: React.ReactNode }>;

export const TIME_SLOTS = [
  { id: 'full-day', label: 'Jour entier' },
  { id: 'morning', label: 'Matin seulement' },
  { id: 'afternoon', label: 'Après-midi seulement' },
] as const satisfies Array<{ id: LeaveTimeSlot; label: React.ReactNode }>;
