import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';

import { orpc } from '@/lib/orpc/client';

import {
  DataList,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
} from '@/components/ui/datalist';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';

import { LeavesDataList } from '@/features/leave/leaves-data-list';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

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
      >
        <PageLayoutTopBarTitle>Mes congés</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent className="pb-20">
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
