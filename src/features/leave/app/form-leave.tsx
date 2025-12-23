import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useQueryStates } from 'nuqs';
import { useFormContext } from 'react-hook-form';

import { orpc } from '@/lib/orpc/client';

import {
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '@/components/form';

import { LEAVE_TYPES } from '@/features/leave/constants';
import { formNewSearchParams } from '@/features/leave/form-new-search-params';
import { FormFieldsLeave, LeaveType } from '@/features/leave/schema';
import { MOCKED_PROJECTS } from '@/features/projects/mocks';
import { STANDARD_DATE_FORMAT } from '@/utils/dates';

const ALLOWED_LEAVE_DATES_OPTIONS = {
  captionLayout: 'dropdown',
  startMonth: dayjs().subtract(1, 'month').toDate(),
  endMonth: dayjs().add(2, 'years').toDate(),
} as const;

export function FormLeave() {
  const [_, setQueryStates] = useQueryStates(formNewSearchParams);
  const usersQuery = useQuery(orpc.user.getAll.queryOptions({}));

  const form = useFormContext<FormFieldsLeave>();
  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>Type de congé</FormFieldLabel>
        <FormFieldController
          type="select"
          control={form.control}
          options={LEAVE_TYPES}
          onChange={(type) => {
            setQueryStates({
              type: (type?.id as LeaveType) ?? 'sickness',
            });
          }}
          name="type"
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Projets</FormFieldLabel>
        <FormFieldHelper>
          Pendant mes congés, je travaillerai sur
        </FormFieldHelper>
        <FormFieldController
          type="multi-select"
          options={MOCKED_PROJECTS}
          allowCustomValue
          control={form.control}
          name="projects"
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Deadlines projets</FormFieldLabel>
        <FormFieldController
          type="textarea"
          control={form.control}
          name="projectDeadlines"
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Personnes à prévenir</FormFieldLabel>{' '}
        {usersQuery.data?.items && (
          <FormFieldController
            type="multi-select"
            options={
              usersQuery.data.items.map((user) => ({
                id: user.id,
                label: user.name ?? user.email,
              })) ?? []
            }
            control={form.control}
            name="reviewers"
          />
        )}
      </FormField>

      <FormField>
        <FormFieldLabel>Dates</FormFieldLabel>
        <div className="flex flex-row gap-8">
          <FormFieldController
            calendarProps={ALLOWED_LEAVE_DATES_OPTIONS}
            type="date"
            onChange={(v) => {
              setQueryStates({
                fromDate: dayjs(v).format(STANDARD_DATE_FORMAT),
              });
            }}
            control={form.control}
            name="fromDate"
            displayError={false}
          />
          <FormFieldController
            calendarProps={ALLOWED_LEAVE_DATES_OPTIONS}
            onChange={(v) => {
              setQueryStates({
                fromDate: dayjs(v).format(STANDARD_DATE_FORMAT),
              });
            }}
            type="date"
            control={form.control}
            name="toDate"
          />
        </div>
      </FormField>
    </div>
  );
}
