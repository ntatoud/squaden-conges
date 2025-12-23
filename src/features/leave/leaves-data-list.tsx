import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { cn } from '@/lib/tailwind/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DataListCell,
  DataListRow,
  DataListText,
  DataListTextHeader,
} from '@/components/ui/datalist';

import { BadgeLeaveStatus } from '@/features/leave/badge-leave-status';
import { UserAvatar } from '@/features/user/avatar';
import { FileRoutesByTo } from '@/routeTree.gen';
import { DateRangeDisplay } from '@/utils/dates';

import { Leave } from './schema';

type LeavesDataListProps = {
  items: Leave[];
  leavesQuery: UseInfiniteQueryResult<
    InfiniteData<{
      items: Leave[];
      total: number;
      nextCursor?: string | undefined;
    }>
  >;
  total: number;
  detailLink: keyof FileRoutesByTo;
};

export const LeavesDataList = ({
  items,
  leavesQuery,
  total,
  detailLink,
}: LeavesDataListProps) => {
  return (
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
        <DataListCell className="items-end">
          <DataListTextHeader>Statut</DataListTextHeader>
        </DataListCell>
      </DataListRow>
      {items.map((item) => (
        <Link to={detailLink} params={{ id: item.id }} key={item.id}>
          <DataListRow withHover>
            <DataListCell className="flex flex-row items-center justify-start gap-2">
              <UserAvatar user={item.user} />
              <DataListText>{item.user?.name ?? ''}</DataListText>
            </DataListCell>
            <DataListCell className="items-center text-sm font-medium">
              <DateRangeDisplay
                fromDate={item.fromDate}
                toDate={item.toDate}
                shouldBreak
              />
            </DataListCell>
            <DataListCell>
              <Badge variant="secondary" className="uppercase">
                {item.type}
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
              <BadgeLeaveStatus status={item.status} />
            </DataListCell>
          </DataListRow>
        </Link>
      ))}
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
  );
};
