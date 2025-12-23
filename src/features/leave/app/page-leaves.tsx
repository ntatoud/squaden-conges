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
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';

import { leaveFilterSearchParams } from '@/features/leave//form-new-search-params';
import type { LeaveStatus, LeaveType } from '@/features/leave//schema';
import { LEAVE_STATUS, LEAVE_TYPES } from '@/features/leave/constants';
import { LeavesDataList } from '@/features/leave/leaves-data-list';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';
import { DISPLAY_DATE_FORMAT } from '@/utils/dates';

export const PageLeaves = () => {
  const [{ fromDate, toDate, types, statuses }, setQueryStates] =
    useQueryStates(leaveFilterSearchParams);

  const leavesQuery = useInfiniteQuery(
    orpc.leave.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({
        cursor,
        filters: {
          type: types,
          status: statuses,
          fromDate: dayjs(fromDate).toDate(),
          toDate: dayjs(toDate).toDate(),
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
        <Button asChild variant="secondary" className="mb-4">
          <Link to="/app/leaves/review">Review congés</Link>
        </Button>

        <div className="flex flex-col gap-3">
          <MultiSelect
            options={LEAVE_TYPES}
            placeholder="Types"
            withClearButton
            onChange={(values) =>
              setQueryStates({
                types: values.map((value) => value.id as LeaveType),
              })
            }
          />
          <div className="flex gap-4">
            <Input
              type="date"
              value={dayjs(fromDate).format(DISPLAY_DATE_FORMAT)}
              onChange={(e) => setQueryStates({ fromDate: e.target.value })}
            />

            <Input
              type="date"
              value={dayjs(toDate).format(DISPLAY_DATE_FORMAT)}
              onChange={(e) => setQueryStates({ toDate: e.target.value })}
            />
          </div>

          <MultiSelect
            options={LEAVE_STATUS}
            placeholder="Status"
            withClearButton
            onChange={(values) =>
              setQueryStates({
                statuses: values.map((value) => value.id as LeaveStatus),
              })
            }
          />
        </div>

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
