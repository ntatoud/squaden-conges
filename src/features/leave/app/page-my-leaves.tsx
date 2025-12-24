import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';

import { orpc } from '@/lib/orpc/client';
import { cn } from '@/lib/tailwind/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListText,
} from '@/components/ui/datalist';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';

import { BadgeLeaveStatus } from '@/features/leave/badge-leave-status';
import { UserAvatar } from '@/features/user/avatar';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';
import { DateRangeDisplay } from '@/utils/dates';

import { LEAVE_STATUS, LEAVE_TYPES } from '../constants';

export const PageMyLeaves = () => {
  const leavesQuery = useInfiniteQuery(
    orpc.leave.getAllForUser.infiniteOptions({
      input: (cursor: string | undefined) => ({
        cursor,
      }),
      initialPageParam: undefined,
      maxPages: 10,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const ui = getUiState((set) => {
    if (leavesQuery.status === 'pending') return set('pending');
    if (leavesQuery.status === 'error') return set('error');

    const items = leavesQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!items.length) return set('empty');
    return set('default', {
      items,
      total: leavesQuery.data.pages[0]?.total ?? 0,
    });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        actions={
          <ResponsiveIconButton
            asChild
            label={'Nouveau'}
            variant="secondary"
            size="sm"
          >
            <Link to="/app/leaves/new">
              <PlusIcon />
            </Link>
          </ResponsiveIconButton>
        }
        backButton={
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link to="/app/leaves">Tous les congés</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/app/leaves/review">Review congés</Link>
            </Button>
          </div>
        }
      ></PageLayoutTopBar>
      <PageLayoutContent className="pb-20">
        <DataList>
          {ui
            .match('pending', () => <DataListLoadingState />)
            .match('error', () => (
              <DataListErrorState retry={() => leavesQuery.refetch()} />
            ))
            .match('empty', () => <DataListEmptyState />)
            .match('default', ({ items, total }) => (
              <>
                <DataListRow>
                  <DataListCell className="max-w-20 items-center">
                    <DataListText>Type</DataListText>
                  </DataListCell>
                  <DataListCell className="items-center">
                    <DataListText>Dates</DataListText>
                  </DataListCell>
                  <DataListCell className="items-center">
                    <DataListText>Reviewers</DataListText>
                  </DataListCell>
                  <DataListCell className="items-end">
                    <DataListText>Statut</DataListText>
                  </DataListCell>
                </DataListRow>
                {items.map((item) => {
                  const leaveStatusLabel =
                    LEAVE_STATUS.find((s) => s.id === item.status)?.label ??
                    item.status;

                  const leaveTypeLabel =
                    LEAVE_TYPES.find((t) => t.id === item.type)?.label ??
                    item.type;
                  return (
                    <Link
                      to="/app/leaves/$id"
                      params={{ id: item.id }}
                      key={item.id}
                    >
                      <DataListRow withHover className="min-h-12">
                        <DataListCell className="max-w-20">
                          <Badge
                            variant="secondary"
                            className="mr-auto uppercase"
                          >
                            {leaveTypeLabel}
                          </Badge>
                        </DataListCell>
                        <DataListCell className="items-center">
                          <DataListText className="font-medium">
                            <DateRangeDisplay
                              fromDate={item.fromDate}
                              toDate={item.toDate}
                            />
                          </DataListText>
                          <DataListText className="font-medium"></DataListText>
                        </DataListCell>
                        <DataListCell className="flex flex-row items-center">
                          {item.reviewers.map((reviewer, index) => (
                            <UserAvatar
                              key={reviewer.id}
                              user={reviewer}
                              className={cn('size-6', index !== 0 && '-ml-2')}
                            />
                          ))}
                        </DataListCell>
                        <DataListCell>
                          <BadgeLeaveStatus
                            status={item.status}
                            statusLabel={leaveStatusLabel}
                          />
                        </DataListCell>
                      </DataListRow>
                    </Link>
                  );
                })}
                <DataListRow>
                  <DataListCell>
                    <Button
                      size="xs"
                      variant="secondary"
                      disabled={!leavesQuery.hasNextPage}
                      onClick={() => leavesQuery.fetchNextPage()}
                      loading={leavesQuery.isFetchingNextPage}
                    >
                      Voir plus
                    </Button>
                  </DataListCell>
                  <DataListCell>
                    <DataListText className="text-xs text-muted-foreground">
                      {items.length} / {total} éléments
                    </DataListText>
                  </DataListCell>
                </DataListRow>
              </>
            ))
            .exhaustive()}
        </DataList>
      </PageLayoutContent>
    </PageLayout>
  );
};
