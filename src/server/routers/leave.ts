import { ORPCError } from '@orpc/client';
import dayjs from 'dayjs';
import { z } from 'zod';

import {
  zFormFieldsLeave,
  zLeave,
  zLeaveFilters,
  zLeaveStatus,
} from '@/features/leave/schema';
import { db } from '@/server/db';
import { Prisma } from '@/server/db/generated/client';
import { protectedProcedure } from '@/server/orpc';

const tags = ['leaves'];

export default {
  getAll: protectedProcedure({
    permission: {
      leave: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/leaves',
      tags,
    })
    .input(
      z
        .object({
          cursor: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(100).prefault(20),
          filters: zLeaveFilters().optional(),
        })
        .prefault({})
    )
    .output(
      z.object({
        items: z.array(zLeave()),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      context.logger.info('Getting leaves from database');

      const from = input.filters?.fromDate;
      const to = input.filters?.toDate;

      let where: Prisma.LeaveWhereInput = {};

      if (from && to) {
        const windowStart = dayjs(from).subtract(1, 'week').toDate();
        const windowEnd = dayjs(to).add(1, 'week').toDate();

        where = {
          AND: [
            { fromDate: { lte: windowEnd } },
            { toDate: { gte: windowStart } },
          ],
        };
      }

      const [total, items] = await Promise.all([
        context.db.leave.count({
          where,
        }),
        context.db.leave.findMany({
          // Get an extra item at the end which we'll use as next cursor
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: {
            fromDate: 'asc',
          },
          where,
          include: { reviewers: true, user: true },
        }),
      ]);

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: z.array(zLeave()).parse(items),
        nextCursor,
        total,
      };
    }),

  getAllReview: protectedProcedure({
    permission: {
      leave: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/leaves',
      tags,
    })
    .input(
      z
        .object({
          cursor: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(100).prefault(20),
          filters: z.any().optional(),
        })
        .prefault({})
    )
    .output(
      z.object({
        items: z.array(zLeave()),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      context.logger.info('Getting leaves from database');

      const where = {
        AND: [
          {
            reviewers: {
              some: {
                id: context.user.id,
              },
            },
          },
          // {
          //   status: {
          //     equals: zLeaveStatus.enum.pending,
          //   },
          // },
        ],
      } satisfies Prisma.LeaveWhereInput;

      const [total, items] = await Promise.all([
        context.db.leave.count({
          where,
        }),
        context.db.leave.findMany({
          // Get an extra item at the end which we'll use as next cursor
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: {
            fromDate: 'asc',
          },
          where,
          include: { reviewers: true, user: true },
        }),
      ]);

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: z.array(zLeave()).parse(items),
        nextCursor,
        total,
      };
    }),

  getById: protectedProcedure({
    permission: {
      leave: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/leaves/{id}',
      tags,
    })
    .input(zLeave().pick({ id: true }))
    .output(zLeave())
    .handler(async ({ input, context }) => {
      context.logger.info('Getting leave');
      const leave = await context.db.leave.findUnique({
        where: { id: input.id },
        include: { user: true, reviewers: true },
      });

      if (!leave) {
        context.logger.warn('Unable to find leave with the provided input');
        throw new ORPCError('NOT_FOUND');
      }

      return zLeave().parse(leave);
    }),

  updateById: protectedProcedure({
    permission: {
      leave: ['update'],
    },
  })
    .route({
      method: 'POST',
      path: '/leaves/{id}',
      tags,
    })
    .input(zFormFieldsLeave().and(z.object({ id: z.string() })))
    .output(zLeave())
    .handler(async ({ context, input }) => {
      context.logger.info('Update leave');
      try {
        const leave = await context.db.leave.update({
          where: { id: input.id },
          data: {
            fromDate: input.fromDate,
            toDate: input.toDate,
            projects: input.projects,
            status: zLeaveStatus.enum.pending,
            projectDeadlines: input.projectDeadlines,
            reviewers: {
              set: input.reviewers.map((reviewer) => ({ id: reviewer })),
            },
          },
          include: {
            reviewers: true,
            user: true,
          },
        });

        return zLeave().parse(leave);
      } catch (error: unknown) {
        console.error(error);
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ORPCError('CONFLICT', {
            data: {
              target: error.meta?.target,
            },
          });
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  review: protectedProcedure({
    permission: {
      leave: ['update'],
    },
  })
    .route({
      method: 'POST',
      path: '/leaves/review/{id}',
      tags,
    })
    .input(
      z.object({
        id: z.string(),
        isApproved: z.boolean(),
        reason: z.string().nullish(),
      })
    )
    .output(zLeave())
    .handler(async ({ context, input }) => {
      context.logger.info('Update leave');
      try {
        const leave = await context.db.leave.update({
          where: { id: input.id },
          data: {
            status: input.isApproved
              ? zLeaveStatus.enum['pending-manager']
              : zLeaveStatus.enum.refused,
            statusReason: input.reason,
          },
          include: { reviewers: true },
        });

        return zLeave().parse(leave);
      } catch (error: unknown) {
        console.log(error);
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ORPCError('CONFLICT', {
            data: {
              target: error.meta?.target,
            },
          });
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  reviewAsManager: {},

  create: protectedProcedure({
    permission: {
      leave: ['create'],
    },
  })
    .route({
      method: 'POST',
      path: '/leaves',
      tags,
    })
    .input(zFormFieldsLeave())
    .output(zLeave())
    .handler(async ({ input, context }) => {
      try {
        const leave = await db.leave.create({
          data: {
            fromDate: input.fromDate,
            toDate: input.toDate,
            type: input.type,
            projects: input.projects,
            userId: context.user.id,
            reviewers: {
              connect:
                input.reviewers.map((reviewer) => ({ id: reviewer })) ?? [],
            },
          },
          include: {
            reviewers: true,
          },
        });

        return zLeave().parse(leave);
      } catch (error: unknown) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ORPCError('CONFLICT', {
            data: {
              target: error.meta?.target,
            },
          });
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),
};
