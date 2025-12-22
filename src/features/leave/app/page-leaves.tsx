import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { match, P } from 'ts-pattern';

import { orpc } from '@/lib/orpc/client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListRowResults,
  DataListText,
} from '@/components/ui/datalist';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export function PageLeaves(props: { search: { filters: TODO } }) {
  const router = useRouter();
  const leavesQuery = useInfiniteQuery(
    orpc.leave.getAll.infiniteOptions({
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
    if (!items.length) {
      return set('empty-search');
    }
    if (!items.length) return set('empty');
    return set('default', {
      items,
      total: leavesQuery.data.pages[0]?.total ?? 0,
    });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>Congés</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <DataList>
          {ui
            .match('pending', () => <DataListLoadingState />)
            .match('error', () => (
              <DataListErrorState retry={() => leavesQuery.refetch()} />
            ))
            .match('empty', () => <DataListEmptyState />)
            .match('empty-search', () => <DataListEmptyState />)
            .match('default', ({ items, total }) => (
              <>
                {
                  <DataListRowResults
                    withClearButton
                    onClear={() => {
                      router.navigate({
                        to: '.',
                        search: { searchTerm: '' },
                        replace: true,
                      });
                    }}
                  >
                    {total} résultats avec les filters séléctionnés
                  </DataListRowResults>
                }
                {items.map((item) => (
                  <DataListRow key={item.id} withHover>
                    <DataListCell className="flex-none">
                      <Avatar>
                        <AvatarFallback
                          variant="boring"
                          name={item.user?.name ?? 's'}
                        />
                      </Avatar>
                    </DataListCell>
                    <DataListCell>
                      <DataListText className="font-medium">
                        <Link to="/manager/users/$id" params={{ id: item.id }}>
                          {item.user?.name}
                          <span className="absolute inset-0" />
                        </Link>
                      </DataListText>
                      <DataListText className="text-xs text-muted-foreground">
                        {item.fromDate.toString()} - {item.toDate.toString()}
                      </DataListText>
                    </DataListCell>
                    <DataListCell className="flex-[0.5] max-sm:hidden">
                      <Badge
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
                  </DataListRow>
                ))}
                <DataListRow>
                  <DataListCell className="flex-none">
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
                      {items.length} sur {total} éléments
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
}
