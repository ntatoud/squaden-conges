import { createFileRoute } from '@tanstack/react-router';

import { PageLeave } from '@/features/leave/manager/page-leave';

export const Route = createFileRoute('/manager/leaves/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageLeave params={params} />;
}
