import { createFileRoute } from '@tanstack/react-router';

import { PageLeave } from '@/features/leave/app/page-leave';

export const Route = createFileRoute('/manager/leaves/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  // TODO: Faire la page de détail manager
  return <PageLeave params={params} />;
}
