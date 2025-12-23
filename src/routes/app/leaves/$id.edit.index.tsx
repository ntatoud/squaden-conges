import { createFileRoute } from '@tanstack/react-router';

import { PageLeaveEdit } from '@/features/leave/app/page-leave-edit';
import { validateSearch } from '@/features/leave/form-new-search-params';

export const Route = createFileRoute('/app/leaves/$id/edit/')({
  component: RouteComponent,
  validateSearch,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageLeaveEdit params={params} />;
}
