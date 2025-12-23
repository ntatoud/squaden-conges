import { getUiState } from '@bearstudio/ui-state';
import { ORPCError } from '@orpc/client';
import { useQuery } from '@tanstack/react-query';
import { CheckIcon, XIcon } from 'lucide-react';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { PageError } from '@/components/errors/page-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import { CardLeaveDetail } from '@/features/leave/card-leave-detail';
import { DataListLeavesForDateRange } from '@/features/leave/leaves-data-list-date-range';
import { ReviewModal } from '@/features/leave/review-modal';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageLeave = (props: { params: { id: string } }) => {
  const leaveQuery = useQuery(
    orpc.leave.getById.queryOptions({ input: { id: props.params.id } })
  );

  const ui = getUiState((set) => {
    if (leaveQuery.status === 'pending') return set('pending');
    if (
      leaveQuery.status === 'error' &&
      leaveQuery.error instanceof ORPCError &&
      leaveQuery.error.code === 'NOT_FOUND'
    )
      return set('not-found');
    if (leaveQuery.status === 'error') return set('error');
    return set('default', { leave: leaveQuery.data });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        leftActions={<BackButton />}
        rightActions={
          <>
            <ReviewModal
              data-action
              title="Accepter le congé"
              leaveId={leaveQuery.data?.id ?? ''}
              isApproved={true}
            >
              <Button data-action variant="secondary" size="sm">
                <CheckIcon /> Accepter
              </Button>
            </ReviewModal>
            <ReviewModal
              data-action
              title="Refuser le congé"
              leaveId={leaveQuery.data?.id ?? ''}
              isApproved={false}
            >
              <Button data-action variant="destructive-secondary" size="sm">
                <XIcon /> Refuser
              </Button>
            </ReviewModal>
          </>
        }
      >
        <PageLayoutTopBarTitle>Demande de congé</PageLayoutTopBarTitle>
      </PageLayoutTopBar>

      <PageLayoutContent>
        {ui
          .match('pending', () => <Spinner full />)
          .match('not-found', () => <PageError type="404" />)
          .match('error', () => <PageError type="unknown-server-error" />)
          .match('default', ({ leave }) => {
            return (
              <div className="flex flex-col gap-8">
                <CardLeaveDetail leave={leave} />

                <DataListLeavesForDateRange
                  fromDate={leave.fromDate}
                  toDate={leave.toDate}
                  excludedIds={[props.params.id]}
                />
              </div>
            );
          })
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
