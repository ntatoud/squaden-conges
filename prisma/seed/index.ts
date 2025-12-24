import { db } from '@/server/db';

import { createLeaves } from './leaves';
import { createUsers } from './user';

async function main() {
  await createUsers();
  await createLeaves();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
