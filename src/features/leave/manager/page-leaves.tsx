import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import { match, P } from 'ts-pattern';

import { orpc } from '@/lib/orpc/client';
import { cn } from '@/lib/tailwind/utils';

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
  DataListText,
} from '@/components/ui/datalist';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';
import { SearchButton } from '@/components/ui/search-button';
import { SearchInput } from '@/components/ui/search-input';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageLeaves = (props: { search: TODO }) => {
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
    orpc.leave.getAllAsManager.infiniteOptions({
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
        actions={
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
        <PageLayoutTopBarTitle>Congés</PageLayoutTopBarTitle>
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
                    <DataListText>Utilisateur</DataListText>
                  </DataListCell>
                  <DataListCell>
                    <DataListText>Dates</DataListText>
                  </DataListCell>
                  <DataListCell className="items-center">
                    <DataListText>Type</DataListText>
                  </DataListCell>
                  <DataListCell>
                    <DataListText>Reviewers</DataListText>
                  </DataListCell>
                  <DataListCell className="items-center">
                    <DataListText>Statut</DataListText>
                  </DataListCell>
                </DataListRow>
                {items.map((item) => (
                  <Link
                    // TODO : change it to link to leave id
                    to="/manager/users/$id"
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
                      <DataListCell>
                        <DataListText className="font-medium">
                          Du {dayjs(item.fromDate).format('DD MMM YYYY')}
                          <span className="absolute inset-0" />
                        </DataListText>
                        <DataListText className="font-medium">
                          au {dayjs(item.toDate).format('DD MMM YYYY')}
                          <span className="absolute inset-0" />
                        </DataListText>
                      </DataListCell>
                      <DataListCell>
                        <Badge variant="secondary" className="uppercase">
                          {item.type}
                        </Badge>
                      </DataListCell>
                      <DataListCell className="flex flex-row justify-start">
                        {item.reviewers.map((reviewer, index) => (
                          <Avatar
                            key={reviewer.id}
                            className={cn(index !== 0 && '-ml-3')}
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
            ))
            .exhaustive()}
        </DataList>
      </PageLayoutContent>
    </PageLayout>
  );
};
