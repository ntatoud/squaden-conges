import { createFileRoute } from '@tanstack/react-router';

import { PageLeaveNew } from '@/features/leave/app/page-leave-new';

export const Route = createFileRoute('/app/leaves/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageLeaveNew />;
}
