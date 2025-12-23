import { createFileRoute } from '@tanstack/react-router';

import { PageLeaveEdit } from '@/features/leave/app/page-leave-edit';

export const Route = createFileRoute('/app/leaves/$id/edit/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageLeaveEdit params={params} />;
}
