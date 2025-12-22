import { z } from 'zod';

import { zUser } from '@/features/user/schema';

export type LeaveStatus = z.infer<typeof zLeaveStatus>;
const zLeaveStatus = z.enum([
  'pending',
  'pending-manager',
  'cancelled',
  'approved',
  'refused',
]);

export type LeaveType = z.infer<typeof zLeaveType>;
const zLeaveType = z.enum(['sickness', 'kids', 'vacation', 'school-review']);

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

export type FormFieldsLeave = z.infer<ReturnType<typeof zFormFieldsLeave>>;
export const zFormFieldsLeave = () =>
  zLeave()
    .pick({
      fromDate: true,
      toDate: true,
      projects: true,
      projectDeadlines: true,
      type: true,
    })
    .extend({
      reviewers: z.array(z.object({ id: zUser().shape.id })),
    });
