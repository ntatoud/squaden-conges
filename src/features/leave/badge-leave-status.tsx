import { match, P } from 'ts-pattern';

import { cn } from '@/lib/tailwind/utils';

import { Badge } from '@/components/ui/badge';

import { LeaveStatus } from '@/features/leave/schema';

export function BadgeLeaveStatus({
  status,
  className,
  statusLabel,
}: {
  status: LeaveStatus;
  statusLabel: string;
  className?: string;
}) {
  return (
    <Badge
      className={cn('ml-auto uppercase', className)}
      variant={match(status)
        .returnType<React.ComponentProps<typeof Badge>['variant']>()
        .with(P.union('pending', 'pending-manager'), () => 'warning')
        .with('approved', () => 'positive')
        .with('refused', () => 'negative')
        .with('cancelled', () => 'secondary')
        .exhaustive()}
    >
      {statusLabel}
    </Badge>
  );
}
