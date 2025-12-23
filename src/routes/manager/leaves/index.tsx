import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { PageLeaves } from '@/features/leave/manager/page-leaves';

export const Route = createFileRoute('/manager/leaves/')({
  component: RouteComponent,
  validateSearch: zodValidator(z.any()),
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageLeaves search={search} />;
}
