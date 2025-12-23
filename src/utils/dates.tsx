import dayjs from 'dayjs';

export const DISPLAY_DATE_FORMAT = 'DD MMM YYYY';
export const STANDARD_DATE_FORMAT = 'YYYY-MM-DD';

export function DateRangeDisplay({
  fromDate,
  toDate,
  shouldBreak,
}: {
  fromDate: Date;
  toDate: Date;
  shouldBreak?: boolean;
}) {
  const from = dayjs(fromDate);
  const to = dayjs(toDate);

  const fromStr = from.format(DISPLAY_DATE_FORMAT);
  const toStr = to.format(DISPLAY_DATE_FORMAT);

  const diff = from.diff(to, 'days');

  if (diff === 0) return `Le ${from.format(DISPLAY_DATE_FORMAT)}`;

  if (shouldBreak)
    return (
      <>
        <span>Du {fromStr}</span> <span>au {toStr}</span>
      </>
    );
  return `Du ${fromStr} au ${toStr}`;
}
