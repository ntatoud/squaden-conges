import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { PlusIcon } from 'lucide-react';
import { useQueryStates } from 'nuqs';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import {
  DataList,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
} from '@/components/ui/datalist';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';

import { leaveFilterSearchParams } from '@/features/leave//form-new-search-params';
import { LeaveFilterSection } from '@/features/leave/leave-filter-section';
import { LeavesDataList } from '@/features/leave/leaves-data-list';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageLeaves = () => {
  const [{ fromDate, toDate, types, statuses }, setQueryStates] =
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
      <PageLayoutTopBar
        rightActions={
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
      />

      <PageLayoutContent className="pb-20">
        <div>
          <Button asChild variant="secondary" className="mb-4">
            <Link to="/app/leaves/review">Review congés</Link>
          </Button>
          <Button asChild variant="secondary" className="mb-4">
            <Link to="/app/leaves/me">Mes congés</Link>
          </Button>
        </div>
        <LeaveFilterSection />

        <div className="mt-2 mb-6 flex gap-2">
          <Button variant="secondary" onClick={() => setQueryStates(null)}>
            Réinitialiser les filtres
          </Button>
        </div>

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
