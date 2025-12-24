import { getUiState } from '@bearstudio/ui-state';
import { ORPCError } from '@orpc/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { CheckIcon, PencilLineIcon, ThumbsDown, ThumbsUp } from 'lucide-react';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { PageError } from '@/components/errors/page-error';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { Role } from '@/features/auth/permissions';
import { WithPermissions } from '@/features/auth/with-permission';
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
  const session = authClient.useSession();

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

  const canEditLeave = session.data?.user.id === leaveQuery.data?.user?.id;

  const isReviewer = leaveQuery?.data?.reviewers.find(
    (reviewer) => reviewer.id === session.data?.user.id
  );
  return (
    <PageLayout>
      <PageLayoutTopBar
        backButton={<BackButton />}
        actions={
          <>
            {isReviewer && (
              <>
                <ReviewModal
                  data-action
                  title="Donner son accord pour le congé"
                  leaveId={leaveQuery.data?.id ?? ''}
                  isApproved={true}
                >
                  <Button data-action variant="secondary" size="icon-sm">
                    <ThumbsUp />
                  </Button>
                </ReviewModal>
                <ReviewModal
                  data-action
                  title="Refuser le congé"
                  leaveId={leaveQuery.data?.id ?? ''}
                  isApproved={false}
                >
                  <Button
                    data-action
                    variant="destructive-secondary"
                    size="icon-sm"
                  >
                    <ThumbsDown />
                  </Button>
                </ReviewModal>
              </>
            )}
            <WithPermissions permissions={[{ apps: ['manager'] }]}>
              <ReviewModal
                data-action
                title="Accepter le congé"
                leaveId={leaveQuery.data?.id ?? ''}
                isApproved
                isFinal
              >
                <Button data-action variant="default" size="sm">
                  <CheckIcon /> Valider
                </Button>
              </ReviewModal>
              <Separator orientation="vertical" className="h-4" />
            </WithPermissions>
            {canEditLeave && (
              <Button asChild size="sm" variant="secondary">
                <Link
                  to="/app/leaves/$id/edit"
                  params={{ id: props.params.id }}
                >
                  <PencilLineIcon />
                  Modifier
                </Link>
              </Button>
            )}
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
