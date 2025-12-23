import dayjs from 'dayjs';
import { useQueryStates } from 'nuqs';

import { DatePicker } from '@/components/ui/date-picker';
import { MultiSelect } from '@/components/ui/multi-select';

import { STANDARD_DATE_FORMAT } from '@/utils/dates';

import { LEAVE_STATUS, LEAVE_TYPES } from './constants';
import { leaveFilterSearchParams } from './form-new-search-params';
import { LeaveStatus, LeaveType } from './schema';

export const LeaveFilterSection = () => {
  const [{ fromDate, toDate }, setQueryStates] = useQueryStates(
    leaveFilterSearchParams
  );

  return (
    <div className="flex flex-col gap-3">
      <MultiSelect
        options={LEAVE_TYPES}
        placeholder="Types"
        withClearButton
        onChange={(values) =>
          setQueryStates({
            types: values.map((value) => value.id as LeaveType),
          })
        }
      />
      <div className="flex gap-4">
        <DatePicker
          value={fromDate ? dayjs(fromDate).toDate() : null}
          onChange={(value) =>
            setQueryStates({
              fromDate: dayjs(value).format(STANDARD_DATE_FORMAT),
            })
          }
        />

        <DatePicker
          value={toDate ? dayjs(toDate).toDate() : null}
          onChange={(value) =>
            setQueryStates({
              toDate: dayjs(value).format(STANDARD_DATE_FORMAT),
            })
          }
        />
      </div>

      <MultiSelect
        options={LEAVE_STATUS}
        placeholder="Status"
        withClearButton
        onChange={(values) =>
          setQueryStates({
            statuses: values.map((value) => value.id as LeaveStatus),
          })
        }
      />
    </div>
  );
};
