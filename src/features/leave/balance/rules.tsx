import dayjs from 'dayjs';

const ANNUAL_LEAVE_COUNT = 25;
const NB_MONTHS = 12;
export const LEAVE_DAYS_EARNED_PER_MONTH = ANNUAL_LEAVE_COUNT / NB_MONTHS;

export function computeBalanceOnDate(currentBalance: number, date: Date) {
  const currentDate = dayjs();
  const targetDate = dayjs(date);

  return (
    currentBalance +
    targetDate.diff(currentDate, 'month') * LEAVE_DAYS_EARNED_PER_MONTH
  );
}
