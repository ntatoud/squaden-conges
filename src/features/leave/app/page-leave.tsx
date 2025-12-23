import { getUiState } from '@bearstudio/ui-state';
import { ORPCError } from '@orpc/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { PencilLineIcon } from 'lucide-react';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { PageError } from '@/components/errors/page-error';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

import { BadgeLeaveStatus } from '@/features/leave/badge-leave-status';
import { LEAVE_TYPES } from '@/features/leave/constants';
import { DataListLeavesForDateRange } from '@/features/leave/leaves-data-list-date-range';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';
import { DISPLAY_DATE_FORMAT } from '@/utils/dates';

const dayCountInclusive = (from: Date, to: Date) => {
  const start = dayjs(from).startOf('day');
  const end = dayjs(to).startOf('day');
  return Math.max(1, end.diff(start, 'day') + 1);
};

export const PageLeave = (props: { params: { id: string } }) => {
  const leaveQuery = useQuery(
    orpc.leave.getById.queryOptions({ input: { id: props.params.id } })
  );

  const ui = getUiState((set) => {
    if (leaveQuery.status === 'pending') return set('pending');
    if (
      leaveQuery.status === 'error' &&
      leaveQuery.error instanceof ORPCError &&
      leaveQuery.error.code === 'NOT_FOUND'
    )
      return set('not-found');
    if (leaveQuery.status === 'error') return set('error');
    return set('default', { leave: leaveQuery.data });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        leftActions={<BackButton />}
        rightActions={
          <Button asChild size="sm" variant="secondary">
            <Link to="/app/leaves/$id/edit" params={{ id: props.params.id }}>
              <PencilLineIcon />
              Modifier
            </Link>
          </Button>
        }
      >
        <PageLayoutTopBarTitle>Demande de congé</PageLayoutTopBarTitle>
      </PageLayoutTopBar>

      <PageLayoutContent>
        {ui
          .match('pending', () => <Spinner full />)
          .match('not-found', () => <PageError type="404" />)
          .match('error', () => <PageError type="unknown-server-error" />)
          .match('default', ({ leave }) => {
            const userName = leave.user?.name ?? 'Utilisateur inconnu';

            const dateRangeLabel = `${dayjs(leave.fromDate).format(
              DISPLAY_DATE_FORMAT
            )} — ${dayjs(leave.toDate).format(DISPLAY_DATE_FORMAT)}`;

            const dayCount = dayCountInclusive(leave.fromDate, leave.toDate);

            const leaveTypeLabel =
              LEAVE_TYPES.find((t) => t.id === leave.type)?.label ?? leave.type;

            return (
              <div className="flex flex-col gap-8">
                <Card>
                  <CardContent className="space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback variant="boring" name={userName} />
                        </Avatar>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="truncate text-base font-semibold">
                              {userName}
                            </div>
                            <BadgeLeaveStatus status={leave.status} />
                          </div>

                          <div className="mt-1 text-sm text-muted-foreground">
                            {dateRangeLabel} · {dayCount} jour(s)
                          </div>
                        </div>
                      </div>

                      <Badge variant="secondary">{leaveTypeLabel}</Badge>
                    </div>

                    <Separator />

                    {/* Projects */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">Projets</div>
                      {leave.projects?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {leave.projects.map((p) => (
                            <Badge
                              key={p}
                              variant="outline"
                              className="font-normal"
                            >
                              {p}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Aucun projet.
                        </div>
                      )}
                    </div>

                    {/* Reviewers */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">Reviewers</div>
                      {leave.reviewers?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {leave.reviewers.map((r) => (
                            <Badge
                              key={r.id}
                              variant="outline"
                              className="font-normal"
                            >
                              {r.name ?? 'Reviewer'}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Aucun reviewer.
                        </div>
                      )}
                    </div>

                    {/* Optional: keep ONLY one “extra” block if it exists */}
                    {leave.statusReason ? (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <div className="text-sm font-semibold">Motif</div>
                          <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                            {leave.statusReason}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </CardContent>
                </Card>

                <DataListLeavesForDateRange
                  fromDate={leave.fromDate}
                  toDate={leave.toDate}
                  excludedIds={[props.params.id]}
                />
              </div>
            );
          })
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
