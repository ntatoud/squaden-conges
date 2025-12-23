import dayjs from 'dayjs';
import { createStandardSchemaV1, parseAsString, parseAsStringEnum } from 'nuqs';

import { LeaveType, zLeaveType } from '@/features/leave/schema';

export const formNewSearchParams = {
  fromDate: parseAsString.withDefault(dayjs().format('YYYY-MM-DD')),
  toDate: parseAsString.withDefault(dayjs().format('YYYY-MM-DD')),
  type: parseAsStringEnum<LeaveType>(zLeaveType.options).withDefault(
    'sickness'
  ),
};

export const validateSearch = createStandardSchemaV1(formNewSearchParams, {
  partialOutput: true,
});
