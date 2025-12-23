import { createFileRoute } from '@tanstack/react-router';

import { PageLeave } from '@/features/leave/app/page-leave';

export const Route = createFileRoute('/app/leaves/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageLeave params={params} />;
}
