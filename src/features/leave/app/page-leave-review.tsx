import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { CheckIcon, XIcon } from 'lucide-react';
import { match, P } from 'ts-pattern';

import { orpc } from '@/lib/orpc/client';
import { cn } from '@/lib/tailwind/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DataList,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListTextHeader,
} from '@/components/ui/datalist';
import {
  DataListCell,
  DataListRow,
  DataListText,
} from '@/components/ui/datalist';

import { ReviewModal } from '@/features/leave/review-modal';
import { UserAvatar } from '@/features/user/avatar';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';
import { DateRangeDisplay } from '@/utils/dates';

import { LEAVE_STATUS, LEAVE_TYPES } from '../constants';

export const PageLeavesReview = (props: { search: TODO }) => {
  const leavesQuery = useInfiniteQuery(
    orpc.leave.getAllReview.infiniteOptions({
      input: (cursor: string | undefined) => ({
        searchTerm: props.search.searchTerm,
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
    const searchTerm = props.search.searchTerm;
    const items = leavesQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!items.length && searchTerm) {
      return set('empty-search', { searchTerm });
    }
    if (!items.length) return set('empty');
    return set('default', {
      items,
      searchTerm,
      total: leavesQuery.data.pages[0]?.total ?? 0,
    });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        backButton={
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link to="/app/leaves">Tous les congés</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/app/leaves/me">Mes congés</Link>
            </Button>
          </div>
        }
      />
      <PageLayoutContent className="pb-20">
        <DataList>
          {ui
            .match('pending', () => <DataListLoadingState />)
            .match('error', () => (
              <DataListErrorState retry={() => leavesQuery.refetch()} />
            ))
            .match('empty', () => <DataListEmptyState />)
            .match('empty-search', ({ searchTerm }) => (
              <DataListEmptyState searchTerm={searchTerm} />
            ))
            .match('default', ({ items, total }) => (
              <>
                <DataListRow>
                  <DataListCell>
                    <DataListTextHeader>Utilisateur</DataListTextHeader>
                  </DataListCell>
                  <DataListCell className="items-center">
                    <DataListTextHeader>Dates</DataListTextHeader>
                  </DataListCell>
                  <DataListCell className="items-center">
                    <DataListTextHeader>Type</DataListTextHeader>
                  </DataListCell>
                  <DataListCell className="items-center">
                    <DataListTextHeader>Reviewers</DataListTextHeader>
                  </DataListCell>
                  <DataListCell className="items-center">
                    <DataListTextHeader>Statut</DataListTextHeader>
                  </DataListCell>
                  <DataListCell className="max-w-20"></DataListCell>
                </DataListRow>
                {items.map((item) => {
                  const leaveStatusLabel =
                    LEAVE_STATUS.find((s) => s.id === item.status)?.label ??
                    item.status;

                  const leaveTypeLabel =
                    LEAVE_TYPES.find((t) => t.id === item.type)?.label ??
                    item.type;

                  return (
                    <DataListRow
                      withHover
                      className="group relative"
                      key={item.id}
                    >
                      <span className="absolute inset-0 left-0 isolate z-1 flex">
                        <Link
                          to="/app/leaves/$id"
                          params={{ id: item.id }}
                          className="flex-1"
                        />
                      </span>
                      <DataListCell className="flex flex-row items-center justify-start gap-2">
                        <UserAvatar user={item.user} />
                        <DataListText>{item.user?.name ?? ''}</DataListText>
                      </DataListCell>
                      <DataListCell className="items-center text-sm font-medium">
                        <DateRangeDisplay
                          fromDate={item.fromDate}
                          toDate={item.toDate}
                          timeSlot={item.timeSlot}
                          shouldBreak
                        />
                      </DataListCell>
                      <DataListCell>
                        <Badge variant="secondary" className="uppercase">
                          {leaveTypeLabel}
                        </Badge>
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
                        <Badge
                          className="uppercase"
                          variant={match(item.status)
                            .returnType<
                              React.ComponentProps<typeof Badge>['variant']
                            >()
                            .with(
                              P.union('pending', 'pending-manager'),
                              () => 'warning'
                            )
                            .with('approved', () => 'positive')
                            .with('refused', () => 'negative')
                            .with('cancelled', () => 'secondary')
                            .exhaustive()}
                        >
                          {leaveStatusLabel}
                        </Badge>
                      </DataListCell>
                      <DataListCell className="z-10 flex max-w-20 flex-row items-center gap-1">
                        <ReviewModal
                          data-action
                          title="Accepter le congé"
                          leaveId={item.id}
                          isApproved={true}
                        >
                          <Button
                            data-action
                            variant="secondary"
                            size="icon-sm"
                          >
                            <CheckIcon />
                          </Button>
                        </ReviewModal>
                        <ReviewModal
                          data-action
                          title="Refuser le congé"
                          leaveId={item.id}
                          isApproved={false}
                        >
                          <Button
                            data-action
                            variant="destructive-secondary"
                            size="icon-sm"
                          >
                            <XIcon />
                          </Button>
                        </ReviewModal>
                      </DataListCell>
                    </DataListRow>
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
