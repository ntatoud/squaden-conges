import { createFileRoute } from '@tanstack/react-router';

import { PageLeaveNew } from '@/features/leave/app/page-leave-new';
import { validateSearch } from '@/features/leave/form-new-search-params';

export const Route = createFileRoute('/app/leaves/new/')({
  component: RouteComponent,
  validateSearch,
});

function RouteComponent() {
  return <PageLeaveNew />;
}
