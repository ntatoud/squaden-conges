import { createFileRoute } from '@tanstack/react-router';

import { PageLeaves } from '@/features/leave/app/page-leaves';

export const Route = createFileRoute('/app/leaves/')({
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageLeaves search={search} />;
}
