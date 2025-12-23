import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { orpc } from '@/lib/orpc/client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { DateRangeDisplay } from '@/utils/dates';

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
              {items.map((item) => (
                <Link
                  to="/app/leaves/$id"
                  params={{ id: item.id }}
                  key={item.id}
                >
                  <DataListRow withHover>
                    <DataListCell className="flex flex-row items-center justify-start gap-2">
                      <Avatar>
                        <AvatarFallback
                          variant="boring"
                          name={item.user?.name ?? ''}
                        />
                      </Avatar>
                      <DataListText>{item.user?.name ?? ''}</DataListText>
                    </DataListCell>
                    <DataListCell className="w-full flex-1 items-center">
                      <DataListText className="font-medium">
                        <DateRangeDisplay
                          fromDate={item.fromDate}
                          toDate={item.toDate}
                        />
                      </DataListText>
                    </DataListCell>
                    <DataListCell className="">
                      <BadgeLeaveStatus status={item.status} />
                    </DataListCell>
                  </DataListRow>
                </Link>
              ))}
            </>
          ))
          .exhaustive()}
      </DataList>
    </div>
  );
}
