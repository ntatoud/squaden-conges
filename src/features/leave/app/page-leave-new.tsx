import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { Form, FormFieldHelper } from '@/components/form';
import { FormField } from '@/components/form/form-field';
import { FormFieldController } from '@/components/form/form-field-controller';
import { FormFieldLabel } from '@/components/form/form-field-label';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { LEAVE_TYPES } from '@/features/leave/constants';
import { zFormFieldsLeave } from '@/features/leave/schema';
import { MOCKED_PROJECTS } from '@/features/projects/mocks';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageLeaveNew = () => {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(zFormFieldsLeave()),
    defaultValues: {
      fromDate: new Date(),
      toDate: new Date(),
      projects: [],
      reviewers: [],
      type: 'sickness',
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

  console.log(form.getValues('reviewers'));
  return (
    <>
      <PreventNavigation shouldBlock={form.formState.isDirty} />
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
              <Button
                size="sm"
                type="submit"
                className="min-w-20"
                loading={leaveCreate.isPending}
              >
                Valider
              </Button>
            }
          >
            <PageLayoutTopBarTitle>Demande de congé</PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <PageLayoutContent>
            <Card>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <FormField>
                    <FormFieldLabel>Type de congé</FormFieldLabel>
                    <FormFieldController
                      type="select"
                      control={form.control}
                      options={LEAVE_TYPES}
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
                        calendarProps={{
                          captionLayout: 'dropdown',
                          startMonth: new Date(),
                          endMonth: new Date(2027, 11),
                        }}
                        type="date"
                        control={form.control}
                        name="fromDate"
                      />
                      <FormFieldController
                        calendarProps={{
                          captionLayout: 'dropdown',
                          startMonth: new Date(),
                          endMonth: new Date(2027, 11),
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
