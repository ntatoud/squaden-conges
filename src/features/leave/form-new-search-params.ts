import dayjs from 'dayjs';
import {
  createStandardSchemaV1,
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs';

import {
  LeaveStatus,
  LeaveType,
  zLeaveStatus,
  zLeaveType,
} from '@/features/leave/schema';
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

export const leaveFilterSearchParams = {
  fromDate: parseAsString,
  toDate: parseAsString,
  types: parseAsArrayOf<LeaveType>(
    parseAsStringEnum<LeaveType>(zLeaveType.options)
  ),
  statuses: parseAsArrayOf<LeaveStatus>(
    parseAsStringEnum<LeaveStatus>(zLeaveStatus.options)
  ),
  users: parseAsArrayOf<string>(parseAsString),
};
