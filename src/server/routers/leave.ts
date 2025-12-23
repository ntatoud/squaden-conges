import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import { zFormFieldsLeave, zLeave } from '@/features/leave/schema';
import { db } from '@/server/db';
import { Prisma } from '@/server/db/generated/client';
import { protectedProcedure } from '@/server/orpc';

const tags = ['leaves'];

export default {
  // Filtres pour gérer global / user / reviwers...
  getAll: {},

  getAllAsManager: protectedProcedure({
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

      const where = {} satisfies Prisma.LeaveWhereInput;

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

  getById: {},

  update: {},

  review: {},

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
              connect: input.reviewers.map((reviewer) => ({ id: reviewer })),
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
