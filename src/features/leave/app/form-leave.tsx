import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useQueryStates } from 'nuqs';
import { useFormContext, Watch } from 'react-hook-form';

import { orpc } from '@/lib/orpc/client';

import {
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '@/components/form';

import { authClient } from '@/features/auth/client';
import { LEAVE_TYPES, TIME_SLOTS } from '@/features/leave/constants';
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

  const { data: currentUser } = authClient.useSession();
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
              usersQuery.data.items
                .filter((item) => item.id !== currentUser?.user.id)
                .map((user) => ({
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
          <Watch
            control={form.control}
            names={['fromDate', 'toDate', 'timeSlot']}
            render={([fromDateForm, toDateForm, timeSlot]) => {
              const isSingleDay =
                !!fromDateForm &&
                !!toDateForm &&
                dayjs(fromDateForm).isSame(toDateForm, 'day');

              if (isSingleDay && (!timeSlot || timeSlot === undefined)) {
                form.setValue('timeSlot', 'full-day', {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }

              if (!isSingleDay && timeSlot && timeSlot !== 'full-day') {
                form.setValue('timeSlot', 'full-day', {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }

              return (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-8">
                    <FormFieldController
                      calendarProps={ALLOWED_LEAVE_DATES_OPTIONS}
                      type="date"
                      onChange={(v) => {
                        if (!v) {
                          setQueryStates({ fromDate: null });
                          return;
                        }

                        if (dayjs(v).isAfter(toDateForm)) {
                          setQueryStates({
                            toDate: dayjs(v).format(STANDARD_DATE_FORMAT),
                          });
                          form.setValue('toDate', v);
                        }

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
                      type="date"
                      onChange={(v) => {
                        if (!v) {
                          setQueryStates({ toDate: null });
                          return;
                        }

                        if (dayjs(v).isBefore(fromDateForm)) {
                          setQueryStates({
                            fromDate: dayjs(v).format(STANDARD_DATE_FORMAT),
                          });
                          form.setValue('fromDate', v);
                        }

                        setQueryStates({
                          toDate: dayjs(v).format(STANDARD_DATE_FORMAT),
                        });
                      }}
                      control={form.control}
                      name="toDate"
                    />
                  </div>

                  {isSingleDay && (
                    <FormField className="mt-2">
                      <FormFieldLabel>Plage horaire</FormFieldLabel>
                      <FormFieldController
                        type="radio-group"
                        control={form.control}
                        name="timeSlot"
                        options={TIME_SLOTS.map(({ id, label }) => ({
                          id,
                          label,
                          value: id,
                        }))}
                        defaultValue="full-day"
                        className="flex flex-row gap-3"
                        size="sm"
                      />
                    </FormField>
                  )}
                </div>
              );
            }}
          />
        </div>
      </FormField>
    </div>
  );
}
