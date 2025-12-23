import { getUiState } from '@bearstudio/ui-state';
import { ORPCError } from '@orpc/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { AlertCircleIcon, PencilLineIcon } from 'lucide-react';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { PageError } from '@/components/errors/page-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

import { WithPermissions } from '@/features/auth/with-permission';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';
import { DISPLAY_DATE_FORMAT } from '@/utils/dates';

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
            <WithPermissions
              permissions={[
                {
                  book: ['delete'],
                },
              ]}
            >
              {/*<ConfirmResponsiveDrawer
                onConfirm={() => deleteBook()}
                title={t('book:manager.detail.confirmDeleteTitle', {
                  title: leaveQuery.data?.title ?? '--',
                })}
                description={t('book:manager.detail.confirmDeleteDescription')}
                confirmText={t('book:manager.detail.deleteButton.label')}
                confirmVariant="destructive"
              >
                <ResponsiveIconButton
                  variant="ghost"
                  label={t('book:manager.detail.deleteButton.label')}
                  size="sm"
                >
                  <Trash2Icon />
                </ResponsiveIconButton>
              </ConfirmResponsiveDrawer>*/}
            </WithPermissions>
            <Button asChild size="sm" variant="secondary">
              <Link to="/app/leaves/$id/edit" params={{ id: props.params.id }}>
                <PencilLineIcon />
                Modifier
              </Link>
            </Button>
          </>
        }
      >
        <PageLayoutTopBarTitle>
          {ui
            .match('pending', () => <Skeleton className="h-4 w-48" />)
            .match(['not-found', 'error'], () => (
              <AlertCircleIcon className="size-4 text-muted-foreground" />
            ))
            .match('default', ({ leave }) => (
              <>
                {leave.user?.name} -{' '}
                {dayjs(leave.fromDate).format(DISPLAY_DATE_FORMAT)} -{' '}
                {dayjs(leave.toDate).format(DISPLAY_DATE_FORMAT)}
              </>
            ))
            .exhaustive()}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <Spinner full />)
          .match('not-found', () => <PageError type="404" />)
          .match('error', () => <PageError type="unknown-server-error" />)
          .match('default', ({ leave }) => (
            <div className="flex flex-col gap-4 xs:flex-row">
              <div className="flex-2">
                <Card className="py-1">
                  <CardContent>
                    <dl className="flex flex-col divide-y text-sm">
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          Nom
                        </dt>
                        <dd className="flex-1">{leave.user?.name}</dd>
                      </div>
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          Dates
                        </dt>
                        <dd className="flex-1">
                          {dayjs(leave.fromDate).format(DISPLAY_DATE_FORMAT)} -{' '}
                          {dayjs(leave.toDate).format(DISPLAY_DATE_FORMAT)}
                        </dd>
                      </div>
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          Type
                        </dt>
                        <dd className="flex-1">{leave.type}</dd>
                      </div>
                      {/*TODO: RAjouter projects, reviewer, projectDeadlines*/}
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
