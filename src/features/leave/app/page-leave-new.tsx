import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { CheckCircle2Icon, Copy } from 'lucide-react';
import { useQueryStates } from 'nuqs';
import { useForm } from 'react-hook-form';

import { orpc } from '@/lib/orpc/client';
import { useClipboard } from '@/hooks/use-clipboard';

import { BackButton } from '@/components/back-button';
import { Form, FormFieldHelper } from '@/components/form';
import { FormField } from '@/components/form/form-field';
import { FormFieldController } from '@/components/form/form-field-controller';
import { FormFieldLabel } from '@/components/form/form-field-label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { LEAVE_TYPES } from '@/features/leave/constants';
import { formNewSearchParams } from '@/features/leave/form-new-search-params';
import { LeaveType, zFormFieldsLeave } from '@/features/leave/schema';
import { MOCKED_PROJECTS } from '@/features/projects/mocks';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

const ALLOWED_LEAVE_DATES_OPTIONS = {
  captionLayout: 'dropdown',
  startMonth: dayjs().subtract(1, 'month').toDate(),
  endMonth: dayjs().add(2, 'years').toDate(),
} as const;

export const PageLeaveNew = () => {
  const [{ fromDate, toDate, type }, setQueryStates] =
    useQueryStates(formNewSearchParams);

  const { copyToClipboard, isCopied } = useClipboard();

  const router = useRouter();
  const canGoBack = useCanGoBack();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(zFormFieldsLeave()),
    defaultValues: {
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      projects: [],
      reviewers: [],
      type: type,
      projectDeadlines: '',
    },
  });

  const usersQuery = useQuery(orpc.user.getAll.queryOptions({}));
  const leaveCreate = useMutation(
    orpc.leave.create.mutationOptions({
      onSuccess: async () => {
        // Invalidate Users list
        await queryClient.invalidateQueries({
          queryKey: orpc.leave.getAll.key(),
          type: 'all',
        });

        // Redirect
        if (canGoBack) {
          router.history.back({ ignoreBlocker: true });
        } else {
          router.navigate({ to: '..', replace: true, ignoreBlocker: true });
        }
      },
      onError: () => {},
    })
  );

  return (
    <>
      <Form
        {...form}
        onSubmit={async (values) => {
          leaveCreate.mutate(values);
        }}
      >
        <PageLayout>
          <PageLayoutTopBar
            leftActions={<BackButton />}
            rightActions={
              <>
                <Button
                  size="sm"
                  type="submit"
                  className="min-w-20"
                  loading={leaveCreate.isPending}
                >
                  Valider
                </Button>
              </>
            }
          >
            <PageLayoutTopBarTitle>Demande de congé</PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <PageLayoutContent>
            <Card>
              <CardHeader className="w-fit">
                {isCopied ? (
                  <span className="flex h-8 items-center gap-1 rounded-md bg-positive-100 px-3 font-medium text-positive-800 has-[>span>svg]:px-2.5 max-sm:mx-auto dark:bg-positive-600/30 dark:text-positive-100">
                    <CheckCircle2Icon className="size-5" /> Copié
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      copyToClipboard(window.location.href);
                    }}
                  >
                    <Copy /> Copier
                  </Button>
                )}
              </CardHeader>
              <CardContent>
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
                            fromDate: dayjs(v).format('YYYY-MM-DD'),
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
                            fromDate: dayjs(v).format('YYYY-MM-DD'),
                          });
                        }}
                        type="date"
                        control={form.control}
                        name="toDate"
                      />
                    </div>
                  </FormField>
                </div>
              </CardContent>
            </Card>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
