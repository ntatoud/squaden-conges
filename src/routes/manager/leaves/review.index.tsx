import { createFileRoute } from '@tanstack/react-router';

import { PageLeavesReview } from '@/features/leave/manager/page-leave-review';

export const Route = createFileRoute('/manager/leaves/review/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageLeavesReview />;
}
