import { createFileRoute } from '@tanstack/react-router';

import { PageMyLeaves } from '@/features/leave/app/page-my-leaves';

export const Route = createFileRoute('/app/leaves/me/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageMyLeaves />;
}
