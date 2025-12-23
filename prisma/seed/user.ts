import { db } from '@/server/db';

import { emphasis } from './_utils';
import data from './user-data.json';

export async function createUsers() {
  console.log(`⏳ Seeding users`);

  const existingUsers = await db.user.findMany({
    select: { email: true },
  });
  const existingEmails = new Set(
    existingUsers.map((u) => u.email.toLowerCase())
  );

  let createdCounter = 0;

  // 1) Seed from JSON (idempotent by email)
  await Promise.all(
    data.users.map(async ({ name, email, imageUrl }) => {
      const normalizedEmail = email.toLowerCase();

      if (existingEmails.has(normalizedEmail)) {
        return;
      }

      await db.user.create({
        data: {
          name,
          email: normalizedEmail,
          emailVerified: true,
          image: imageUrl,
          role: 'user',
          leaveBalance: 25,
          onboardedAt: new Date(),
        },
      });

      existingEmails.add(normalizedEmail);
      createdCounter += 1;
    })
  );

  // 3) Ensure special accounts exist (idempotent)
  if (!existingEmails.has('user@user.com')) {
    await db.user.create({
      data: {
        name: 'User',
        email: 'user@user.com',
        emailVerified: true,
        onboardedAt: new Date(),
        role: 'user',
      },
    });
    createdCounter += 1;
    existingEmails.add('user@user.com');
  }

  if (!existingEmails.has('admin@admin.com')) {
    await db.user.create({
      data: {
        name: 'Admin',
        email: 'admin@admin.com',
        emailVerified: true,
        role: 'admin',
        onboardedAt: new Date(),
      },
    });
    createdCounter += 1;
    existingEmails.add('admin@admin.com');
  }

  console.log(
    `✅ ${existingUsers.length} existing users 👉 ${createdCounter} users created`
  );
  console.log(`👉 Admin connect with: ${emphasis('admin@admin.com')}`);
  console.log(`👉 User connect with: ${emphasis('user@user.com')}`);
}
