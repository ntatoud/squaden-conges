import dayjs from 'dayjs';

import { Badge } from '@/components/ui/badge';

import { TIME_SLOTS } from '@/features/leave/constants';

export const DISPLAY_DATE_FORMAT = 'DD MMM YYYY';
export const STANDARD_DATE_FORMAT = 'YYYY-MM-DD';

export function DateRangeDisplay({
  fromDate,
  toDate,
  timeSlot,
  shouldBreak,
}: {
  fromDate: Date;
  toDate: Date;
  timeSlot?: string | null;
  shouldBreak?: boolean;
}) {
  const from = dayjs(fromDate);
  const to = dayjs(toDate);

  const fromStr = from.format(DISPLAY_DATE_FORMAT);
  const toStr = to.format(DISPLAY_DATE_FORMAT);

  const diff = from.diff(to, 'days');

  const leaveTimeSlotLabel =
    TIME_SLOTS.find((s) => s.id === timeSlot)?.label ?? timeSlot;

  if (diff === 0)
    return (
      <>
        <span>Le {from.format(DISPLAY_DATE_FORMAT)} </span>
        <Badge variant="outline">{leaveTimeSlotLabel}</Badge>
      </>
    );

  if (shouldBreak)
    return (
      <>
        <span>Du {fromStr}</span> <span>au {toStr}</span>
      </>
    );
  return `Du ${fromStr} au ${toStr}`;
}
