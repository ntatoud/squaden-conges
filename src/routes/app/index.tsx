import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/app/')({
  component: RouteComponent,
  beforeLoad: () => {
    throw redirect({ to: '/app/leaves' });
  },
});

function RouteComponent() {
  return null;
}
