// seeds/leaves.ts
import type {
  LeaveStatus,
  LeaveTimeSlot,
  LeaveType,
} from '@/features/leave/schema';
import { db } from '@/server/db';

import { emphasis } from './_utils';

// Same ids as your UI constants
const LEAVE_TYPES: LeaveType[] = [
  'kids',
  'school-review',
  'sickness',
  'vacation',
];

const LEAVE_STATUS: LeaveStatus[] = [
  'approved',
  'cancelled',
  'pending',
  'pending-manager',
  'refused',
];

const TIME_SLOTS: LeaveTimeSlot[] = ['full-day', 'morning', 'afternoon'];

const MOCKED_PROJECTS = [
  'bearstudio-interne',
  'forkit-interne',
  'bs-squaden',
  'matmut-conseils-dev',
  'neofarm-dev',
  'bs-business',
] as const;

function pickOne<T>(arr: readonly T[]) {
  // eslint-disable-next-line sonarjs/pseudo-random
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function pickManyUnique<T>(arr: readonly T[], count: number) {
  const copy = [...arr];
  const res: T[] = [];
  while (copy.length && res.length < count) {
    // eslint-disable-next-line sonarjs/pseudo-random
    const idx = Math.floor(Math.random() * copy.length);
    res.push(copy.splice(idx, 1)[0] as T);
  }
  return res;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

/**
 * Idempotency key: deterministic "seedKey"
 * => avoids duplicates across reruns
 */
function seedKey(input: {
  userId: string;
  fromDate: Date;
  toDate: Date;
  type: LeaveType;
  timeSlot: LeaveTimeSlot;
}) {
  return [
    input.userId,
    input.type,
    input.timeSlot,
    input.fromDate.toISOString(),
    input.toDate.toISOString(),
  ].join('__');
}

export async function createLeaves() {
  console.log('⏳ Seeding leaves');

  const users = await db.user.findMany({
    select: { id: true, email: true, role: true },
  });

  const byEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));

  const mustUser = (email: string) => {
    const u = byEmail.get(email.toLowerCase());
    if (!u) throw new Error(`User not found: ${email}`);
    return u;
  };

  // Reviewers strategy:
  // - prefer admin as reviewer
  // - also include 0-1 random reviewer (not the owner) when possible
  const admin = byEmail.get('admin@admin.com');
  const userAccount = byEmail.get('user@user.com');

  // Owner pool: all users from DB (seeded before) except maybe keep admin too
  const ownerPool = users;

  // Existing leaves to keep idempotent
  const existing = await db.leave.findMany({
    select: {
      userId: true,
      fromDate: true,
      toDate: true,
      type: true,
      timeSlot: true,
    },
  });

  const existingKeys = new Set(
    existing.map((l) =>
      seedKey({
        userId: l.userId,
        fromDate: l.fromDate,
        toDate: l.toDate,
        type: l.type as LeaveType,
        timeSlot: (l.timeSlot ?? 'full-day') as LeaveTimeSlot,
      })
    )
  );

  let created = 0;

  // Generate deterministic-ish set: create 2-4 leaves for a handful of users
  // (You can increase volume by changing these numbers.)
  const ownersToSeed = ownerPool.slice(0, Math.min(ownerPool.length, 8));

  const base = new Date('2025-01-01T00:00:00.000Z');

  for (let i = 0; i < ownersToSeed.length; i++) {
    const owner = ownersToSeed[i];

    const leavesCount = 3; // per user
    for (let j = 0; j < leavesCount; j++) {
      const type = pickOne(LEAVE_TYPES);
      const timeSlot = pickOne(TIME_SLOTS);

      // Spread dates over the year
      const start = addDays(base, i * 9 + j * 17 + 3);
      const durationDays =
        timeSlot === 'full-day' ? pickOne([1, 2, 3, 5] as const) : 1;

      const fromDate = start;
      const toDate = addDays(start, durationDays - 1);

      // Status logic (more realistic)
      let status: LeaveStatus = pickOne(LEAVE_STATUS);
      if (type === 'vacation')
        status = pickOne(['approved', 'pending-manager', 'pending'] as const);
      if (type === 'sickness')
        status = pickOne(['approved', 'pending', 'refused'] as const);

      const statusReason =
        status === 'refused'
          ? 'Période incompatible avec la charge projet'
          : // eslint-disable-next-line sonarjs/no-nested-conditional
            status === 'cancelled'
            ? 'Demande annulée par le salarié'
            : null;

      const projects = pickManyUnique(
        MOCKED_PROJECTS,
        pickOne([1, 1, 2] as const) // mostly 1 project, sometimes 2
      );

      const projectDeadlines =
        // eslint-disable-next-line sonarjs/pseudo-random
        Math.random() < 0.35
          ? `Deadline: ${addDays(fromDate, 10).toISOString().slice(0, 10)}`
          : null;

      // Reviewers: admin + optional extra reviewer (not owner)
      const reviewersToConnect: { id: string }[] = [];
      if (admin && admin.id !== owner?.id)
        reviewersToConnect.push({ id: admin.id });

      // optional second reviewer
      const possibleReviewers = users.filter(
        (u) => u.id !== owner?.id && (!admin || u.id !== admin.id)
      );
      // eslint-disable-next-line sonarjs/pseudo-random
      if (possibleReviewers.length > 0 && Math.random() < 0.4) {
        reviewersToConnect.push({ id: pickOne(possibleReviewers).id });
      }

      const key = seedKey({
        userId: owner ? owner.id : '',
        fromDate,
        toDate,
        type,
        timeSlot,
      });
      if (existingKeys.has(key)) continue;

      await db.leave.create({
        data: {
          userId: owner ? owner.id : '',
          fromDate,
          toDate,
          timeSlot, // uses LeaveTimeSlot ids: "full-day" | "morning" | "afternoon"
          reviewers: {
            connect: reviewersToConnect,
          },
          projects: [...projects], // stored as string[]
          projectDeadlines,
          type, // uses LeaveType ids
          status, // uses LeaveStatus ids
          statusReason,
        },
      });

      existingKeys.add(key);
      created += 1;
    }
  }

  // Ensure at least one leave exists for the 2 “special accounts”
  // (in case ownersToSeed didn’t include them due to slice)
  const ensureFor = async (email: string, fallbackType: LeaveType) => {
    const u = mustUser(email);
    const fromDate = new Date('2025-02-10T00:00:00.000Z');
    const toDate = new Date('2025-02-12T00:00:00.000Z');
    const timeSlot: LeaveTimeSlot = 'full-day';

    const key = seedKey({
      userId: u.id,
      fromDate,
      toDate,
      type: fallbackType,
      timeSlot,
    });
    if (existingKeys.has(key)) return;

    await db.leave.create({
      data: {
        userId: u.id,
        fromDate,
        toDate,
        timeSlot,
        reviewers:
          admin && admin.id !== u.id
            ? { connect: [{ id: admin.id }] }
            : undefined,
        projects: ['bearstudio-interne'],
        projectDeadlines: 'Deadline: 2025-02-20',
        type: fallbackType,
        status: 'approved',
        statusReason: null,
      },
    });

    existingKeys.add(key);
    created += 1;
  };

  if (userAccount) await ensureFor('user@user.com', 'vacation');
  if (admin) await ensureFor('admin@admin.com', 'school-review');

  console.log(
    `✅ ${existing.length} existing leaves 👉 ${created} leaves created`
  );
  console.log(`👉 Reviewer default: ${emphasis('admin@admin.com')}`);
}
