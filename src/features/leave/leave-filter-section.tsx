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
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm">Types de congés</label>
        <MultiSelect
          options={LEAVE_TYPES}
          withClearButton
          onChange={(values) =>
            setQueryStates({
              types: values.map((value) => value.id as LeaveType),
            })
          }
        />
      </div>
      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <label className="text-sm">Date de début</label>
          <DatePicker
            value={fromDate ? dayjs(fromDate).toDate() : null}
            onChange={(value) =>
              setQueryStates({
                fromDate: dayjs(value).format(STANDARD_DATE_FORMAT),
              })
            }
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <label className="text-sm">Date de fin</label>
          <DatePicker
            value={toDate ? dayjs(toDate).toDate() : null}
            onChange={(value) =>
              setQueryStates({
                toDate: dayjs(value).format(STANDARD_DATE_FORMAT),
              })
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm">Statuts des congés</label>
        <MultiSelect
          options={LEAVE_STATUS}
          withClearButton
          onChange={(values) =>
            setQueryStates({
              statuses: values.map((value) => value.id as LeaveStatus),
            })
          }
        />
      </div>
    </div>
  );
};
