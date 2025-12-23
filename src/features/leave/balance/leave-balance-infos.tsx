import dayjs from 'dayjs';

import { cn } from '@/lib/tailwind/utils';

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';

import { computeBalanceOnDate } from '@/features/leave/balance/rules';
import { DISPLAY_DATE_FORMAT } from '@/utils/dates';

export function LeaveBalanceInfos({
  balance,
  fromDate,
  toDate,
}: {
  balance: number;
  toDate: Date;
  fromDate: Date;
}) {
  const balanceOnDate = computeBalanceOnDate(balance, fromDate);
  const isBalanceOnDateRound = Number.isInteger(
    Number.parseFloat(balanceOnDate.toFixed(2))
  );
  const leaveDaysCount = Math.abs(dayjs(fromDate).diff(toDate, 'days')) + 1;

  const daysDelta = balanceOnDate - leaveDaysCount;
  const isMissingDays = daysDelta < 0;

  return (
    <div className="flex w-full flex-row gap-4">
      <Card className="flex-1">
        <CardContent>
          <CardTitle>{balance} jours</CardTitle>
          <CardDescription>Solde actuel</CardDescription>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardContent>
          <CardTitle>
            {isBalanceOnDateRound
              ? Math.round(balanceOnDate)
              : balanceOnDate.toFixed(2)}{' '}
            jours
          </CardTitle>
          <CardDescription>
            Au <b>{dayjs(fromDate).format(DISPLAY_DATE_FORMAT)}</b>
          </CardDescription>
        </CardContent>
      </Card>
      <Card
        className={cn(
          'flex-1',
          isMissingDays &&
            'border-negative-800 bg-negative-50 text-negative-800 dark:border-none dark:bg-negative-500/25 dark:text-negative-100'
        )}
      >
        <CardContent>
          <CardTitle className="flex w-full items-center justify-between gap-2">
            {Math.abs(dayjs(fromDate).diff(toDate, 'days')) + 1} jours{' '}
            {isMissingDays && (
              <p className="text-xs">
                {Math.abs(daysDelta).toFixed(2)} jour(s) manquant
              </p>
            )}
          </CardTitle>
          <CardDescription
            className={cn(
              isMissingDays && 'text-negative-800 dark:text-negative-200'
            )}
          >
            Congés décomptés
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardContent>
          <CardTitle className="flex w-full items-center justify-between gap-2">
            {daysDelta} jours
          </CardTitle>
          <CardDescription>
            Au <b>{dayjs(toDate).format(DISPLAY_DATE_FORMAT)}</b>
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
