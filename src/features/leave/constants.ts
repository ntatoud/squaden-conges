import { LeaveType } from '@/features/leave/schema';

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
