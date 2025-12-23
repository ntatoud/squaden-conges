import dayjs from 'dayjs';
import { createStandardSchemaV1, parseAsString, parseAsStringEnum } from 'nuqs';

import { LeaveType, zLeaveType } from '@/features/leave/schema';
import { STANDARD_DATE_FORMAT } from '@/utils/dates';

export const formNewSearchParams = {
  fromDate: parseAsString.withDefault(dayjs().format(STANDARD_DATE_FORMAT)),
  toDate: parseAsString.withDefault(dayjs().format(STANDARD_DATE_FORMAT)),
  type: parseAsStringEnum<LeaveType>(zLeaveType.options).withDefault(
    'sickness'
  ),
};

export const validateSearch = createStandardSchemaV1(formNewSearchParams, {
  partialOutput: true,
});
