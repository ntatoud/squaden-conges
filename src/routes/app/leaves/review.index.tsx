import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import z from 'zod';

import { PageLeavesReview } from '@/features/leave/app/page-leave-review';

export const Route = createFileRoute('/app/leaves/review/')({
  component: RouteComponent,
  validateSearch: zodValidator(z.any()),
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageLeavesReview search={search} />;
}
