import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { orpc } from '@/lib/orpc/client';

import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListText,
} from '@/components/ui/datalist';

import { BadgeLeaveStatus } from '@/features/leave/badge-leave-status';
import { UserAvatar } from '@/features/user/avatar';
import { DateRangeDisplay } from '@/utils/dates';

import { LEAVE_STATUS } from './constants';

export function DataListLeavesForDateRange({
  fromDate,
  toDate,
  excludedIds,
}: {
  fromDate: Date;
  toDate: Date;
  excludedIds?: Array<string>;
}) {
  const closeLeavesQuery = useQuery(
    orpc.leave.getAll.queryOptions({
      input: {
        filters: {
          fromDate,
          toDate,
          excludedIds,
        },
      },
    })
  );

  const ui = getUiState((set) => {
    if (closeLeavesQuery.status === 'pending') return set('pending');
    if (closeLeavesQuery.status === 'error') return set('error');
    const items = closeLeavesQuery.data?.items;

    if (!items.length) return set('empty');
    return set('default', {
      items,
    });
  });

  return (
    <div className="flex flex-col gap-4">
      <div>Autres personnes en congé sur cette période</div>
      <DataList>
        {ui
          .match('pending', () => <DataListLoadingState />)
          .match('error', () => (
            <DataListErrorState retry={() => closeLeavesQuery.refetch()} />
          ))
          .match('empty', () => (
            <DataListEmptyState>
              Personne d'autre n'est en congé sur cette période
            </DataListEmptyState>
          ))
          .match('default', ({ items }) => (
            <>
              {items.map((item) => {
                const leaveStatusLabel =
                  LEAVE_STATUS.find((s) => s.id === item.status)?.label ??
                  item.status;

                return (
                  <Link
                    to="/app/leaves/$id"
                    params={{ id: item.id }}
                    key={item.id}
                  >
                    <DataListRow withHover>
                      <DataListCell className="flex flex-row items-center justify-start gap-2">
                        <UserAvatar user={item.user} />
                        <DataListText>{item.user?.name ?? ''}</DataListText>
                      </DataListCell>
                      <DataListCell className="w-full flex-1 items-center">
                        <DataListText className="font-medium">
                          <DateRangeDisplay
                            fromDate={item.fromDate}
                            toDate={item.toDate}
                            timeSlot={item.timeSlot}
                          />
                        </DataListText>
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
            </>
          ))
          .exhaustive()}
      </DataList>
    </div>
  );
}
