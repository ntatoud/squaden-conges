import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ChevronDown } from 'lucide-react';
import { useQueryStates } from 'nuqs';
import { Collapsible } from 'radix-ui';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import {
  DataList,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
} from '@/components/ui/datalist';

import { leaveFilterSearchParams } from '@/features/leave//form-new-search-params';
import { LeaveFilterSection } from '@/features/leave/leave-filter-section';
import { LeavesDataList } from '@/features/leave/leaves-data-list';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageLeaves = () => {
  const [{ fromDate, toDate, types, statuses, users }, setQueryStates] =
    useQueryStates(leaveFilterSearchParams);

  const leavesQuery = useInfiniteQuery(
    orpc.leave.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({
        cursor,
        filters: {
          type: types ?? undefined,
          status: statuses ?? undefined,
          fromDate: fromDate ? dayjs(fromDate).toDate() : undefined,
          toDate: toDate ? dayjs(toDate).toDate() : undefined,
          exactDates: true,
          user: users ?? undefined,
        },
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
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>Consultation des congés</PageLayoutTopBarTitle>
      </PageLayoutTopBar>

      <PageLayoutContent className="pb-20">
        <Collapsible.Root className="flex flex-col gap-2 pb-4">
          <Collapsible.Trigger asChild>
            <Button
              variant="link"
              className="group self flex items-center gap-2"
            >
              <span className="group-data-[state=open]:hidden">
                Afficher les filtres
              </span>
              <span className="group-data-[state=closed]:hidden">
                Masquer les filtres
              </span>

              <ChevronDown className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Button>
          </Collapsible.Trigger>

          <Collapsible.Content className="flex flex-col gap-2">
            <Button
              variant="secondary"
              onClick={() => setQueryStates(null)}
              className="-mt-10 self-end"
              size="sm"
            >
              Réinitialiser les filtres
            </Button>
            <LeaveFilterSection />
          </Collapsible.Content>
        </Collapsible.Root>

        <DataList>
          {ui
            .match('pending', () => <DataListLoadingState />)
            .match('error', () => (
              <DataListErrorState retry={() => leavesQuery.refetch()} />
            ))
            .match('empty', () => <DataListEmptyState />)
            .match('default', ({ items, total }) => (
              <LeavesDataList
                items={items}
                leavesQuery={leavesQuery}
                total={total}
                detailLink="/app/leaves/$id"
              />
            ))
            .exhaustive()}
        </DataList>
      </PageLayoutContent>
    </PageLayout>
  );
};
