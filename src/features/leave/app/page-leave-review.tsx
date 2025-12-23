import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { CheckIcon, PlusIcon, XIcon } from 'lucide-react';
import { match, P } from 'ts-pattern';

import { orpc } from '@/lib/orpc/client';
import { cn } from '@/lib/tailwind/utils';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';
import { SearchButton } from '@/components/ui/search-button';
import { SearchInput } from '@/components/ui/search-input';

import { ReviewModal } from '@/features/leave/review-modal';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';
import { DateRangeDisplay } from '@/utils/dates';

export const PageLeavesReview = (props: { search: TODO }) => {
  const router = useRouter();

  const searchInputProps = {
    value: props.search.searchTerm ?? '',
    onChange: (value: string) =>
      router.navigate({
        to: '.',
        search: { searchTerm: value },
        replace: true,
      }),
  };

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
        <SearchButton
          {...searchInputProps}
          className="-mx-2 md:hidden"
          size="icon-sm"
        />
        <SearchInput
          {...searchInputProps}
          size="sm"
          className="max-w-2xs max-md:hidden"
        />
      </PageLayoutTopBar>
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
                {items.map((item) => (
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
                      <Avatar>
                        <AvatarFallback
                          variant="boring"
                          name={item.user?.name ?? ''}
                        />
                      </Avatar>
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
                    <DataListCell className="flex flex-row">
                      {item.reviewers.map((reviewer, index) => (
                        <Avatar
                          key={reviewer.id}
                          className={cn('w-6', index !== 0 && '-ml-2')}
                        >
                          <AvatarFallback
                            variant="boring"
                            name={reviewer.name ?? ''}
                          />
                        </Avatar>
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
                        {item.status}
                      </Badge>
                    </DataListCell>
                    <DataListCell className="z-10 flex max-w-20 flex-row items-center gap-1">
                      <ReviewModal
                        data-action
                        title="Accepter le congé"
                        leaveId={item.id}
                        isApproved={true}
                      >
                        <Button data-action variant="secondary" size="icon-sm">
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
            ))
            .exhaustive()}
        </DataList>
      </PageLayoutContent>
    </PageLayout>
  );
};
