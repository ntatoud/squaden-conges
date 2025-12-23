import { z } from 'zod';

import { zUser } from '@/features/user/schema';

export type LeaveStatus = z.infer<typeof zLeaveStatus>;
export const zLeaveStatus = z.enum([
  'pending',
  'pending-manager',
  'cancelled',
  'approved',
  'refused',
]);

export type LeaveType = z.infer<typeof zLeaveType>;
export const zLeaveType = z.enum([
  'sickness',
  'kids',
  'vacation',
  'school-review',
]);

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
      reviewers: z.array(zUser().shape.id),
    })
    .superRefine((value, context) => {
      if (value.fromDate > value.toDate) {
        context.addIssue({
          path: ['fromDate'],
          code: 'custom',
        });
        context.addIssue({
          path: ['toDate'],
          code: 'custom',
          message: 'La date de fin des congés ne peut pas être avant le début',
        });
      }
    });

export type LeaveFilters = z.infer<ReturnType<typeof zLeaveFilters>>;
export const zLeaveFilters = () =>
  z.object({
    fromDate: z.date().optional(),
    toDate: z.date().optional(),
    type: z.array(zLeaveType).optional(),
    status: z.array(zLeaveStatus).optional(),
    user: z.array(z.string()).optional(),
    excludedIds: z.array(z.string()).optional(),
  });
