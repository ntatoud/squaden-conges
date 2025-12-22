import { z } from 'zod';

import { zUser } from '../user/schema';

const zLeaveStatus = z.enum([
  'pending',
  'pending-manager',
  'cancelled',
  'approved',
  'refused',
]);

export type LeaveStatus = z.infer<typeof zLeaveStatus>;

const zLeaveType = z.enum(['sickness', 'kids', 'vacation', 'school-review']);

export type LeaveType = z.infer<typeof zLeaveType>;

export type Leave = z.infer<ReturnType<typeof zLeave>>;

export const zLeave = () =>
  z.object({
    id: z.string(),
    userId: z.string(),
    user: zUser().nullish(),
    fromDate: z.date(),
    toDate: z.date(),
    reviewers: z.array(zUser()),
    projects: z.array(z.string()),
    projectDeadlines: z.string().nullish(),
    type: zLeaveType,
    status: zLeaveStatus,
    statusReason: z.string().nullish(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });
