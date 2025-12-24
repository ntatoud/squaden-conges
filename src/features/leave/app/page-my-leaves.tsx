import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { PlusIcon, Undo2 } from 'lucide-react';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';
import { cn } from '@/lib/tailwind/utils';
import { queryClient } from '@/lib/tanstack-query/query-client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';
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
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';
import { DateRangeDisplay } from '@/utils/dates';

import { LEAVE_STATUS, LEAVE_TYPES } from '../constants';
import { zLeaveStatus } from '../schema';

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

  const cancelLeave = useMutation(
    orpc.leave.cancel.mutationOptions({
      onSuccess: async () => {
        toast.success('Demande de congés annulée');
        await queryClient.invalidateQueries({
          queryKey: orpc.leave.getAllForUser.key(),
          type: 'all',
        });
      },
      onError: () =>
        toast.error("Une erreur est survenue lors de l'annulation du congé"),
    })
  );
  return (
    <PageLayout>
      <PageLayoutTopBar
        actions={
          <ResponsiveIconButton
            asChild
            label={'Faire une demande'}
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
              <>
                <DataListRow>
                  <DataListCell className="items-center">
                    <DataListText>Type</DataListText>
                  </DataListCell>
                  <DataListCell className="items-center">
                    <DataListText>Dates</DataListText>
                  </DataListCell>
                  <DataListCell className="items-center">
                    <DataListText>Reviewers</DataListText>
                  </DataListCell>
                  <DataListCell className="items-center">
                    <DataListText>Statut</DataListText>
                  </DataListCell>
                  <DataListCell className="max-w-10"></DataListCell>
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
                      className="relative min-h-12"
                      key={item.id}
                    >
                      <span className="absolute inset-0 left-0 isolate z-1 flex">
                        <Link
                          to="/app/leaves/$id"
                          params={{ id: item.id }}
                          className="flex-1"
                        />
                      </span>

                      <DataListCell>
                        <Badge
                          variant="secondary"
                          className="mr-auto uppercase"
                        >
                          {leaveTypeLabel}
                        </Badge>
                      </DataListCell>
                      <DataListCell className="items-center text-sm font-medium">
                        <DateRangeDisplay
                          fromDate={item.fromDate}
                          toDate={item.toDate}
                          timeSlot={item.timeSlot}
                          shouldBreak
                        />
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
                      <DataListCell className="items-center">
                        <BadgeLeaveStatus
                          status={item.status}
                          statusLabel={leaveStatusLabel}
                          className="ml-0"
                        />
                      </DataListCell>
                      <DataListCell className="z-10 max-w-10">
                        {dayjs(item.toDate).isAfter(dayjs()) ||
                          (item.status !== zLeaveStatus.enum.cancelled && (
                            <ConfirmResponsiveDrawer
                              onConfirm={() =>
                                cancelLeave.mutate({ id: item.id })
                              }
                              description="Êtes vous sur de vouloir annuler ce congé ?"
                              confirmText="Confirmer"
                              cancelText="Annuler"
                              confirmVariant="destructive-secondary"
                            >
                              <Button variant="secondary" size="icon-sm">
                                <Undo2 />
                              </Button>
                            </ConfirmResponsiveDrawer>
                          ))}
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
