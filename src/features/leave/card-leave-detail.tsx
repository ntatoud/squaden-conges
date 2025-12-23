import dayjs from 'dayjs';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { BadgeLeaveStatus } from '@/features/leave/badge-leave-status';
import { LEAVE_TYPES } from '@/features/leave/constants';
import { Leave } from '@/features/leave/schema';
import { DISPLAY_DATE_FORMAT } from '@/utils/dates';

const dayCountInclusive = (from: Date, to: Date) => {
  const start = dayjs(from).startOf('day');
  const end = dayjs(to).startOf('day');
  return Math.max(1, end.diff(start, 'day') + 1);
};

export function CardLeaveDetail({ leave }: { leave: Leave }) {
  const userName = leave.user?.name ?? 'Utilisateur inconnu';

  const dateRangeLabel = `${dayjs(leave.fromDate).format(
    DISPLAY_DATE_FORMAT
  )} — ${dayjs(leave.toDate).format(DISPLAY_DATE_FORMAT)}`;

  const dayCount = dayCountInclusive(leave.fromDate, leave.toDate);

  const leaveTypeLabel =
    LEAVE_TYPES.find((t) => t.id === leave.type)?.label ?? leave.type;

  return (
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
                <Badge key={p} variant="outline" className="font-normal">
                  {p}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Aucun projet.</div>
          )}
        </div>

        {/* Reviewers */}
        <div className="space-y-2">
          <div className="text-sm font-semibold">Reviewers</div>
          {leave.reviewers?.length ? (
            <div className="flex flex-wrap gap-2">
              {leave.reviewers.map((r) => (
                <Badge key={r.id} variant="outline" className="font-normal">
                  {r.name ?? 'Reviewer'}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Aucun reviewer.</div>
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
  );
}
