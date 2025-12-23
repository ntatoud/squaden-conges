import { zodResolver } from '@hookform/resolvers/zod';
import { ORPCError } from '@orpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { Form } from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { FormLeave } from '@/features/leave/app/form-leave';
import { zFormFieldsLeave } from '@/features/leave/schema';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageLeaveEdit = (props: { params: { id: string } }) => {
  const { t } = useTranslation(['book']);
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const queryClient = useQueryClient();
  const leaveQuery = useQuery(
    orpc.leave.getById.queryOptions({ input: { id: props.params.id } })
  );

  const form = useForm({
    resolver: zodResolver(zFormFieldsLeave()),
    values: {
      fromDate: leaveQuery.data?.fromDate ?? new Date(),
      toDate: leaveQuery.data?.toDate ?? new Date(),
      projects: leaveQuery.data?.projects ?? [],
      projectDeadlines: leaveQuery.data?.projectDeadlines ?? '',
      reviewers:
        leaveQuery.data?.reviewers.map((reviewer) => reviewer.id) ?? [],
      type: leaveQuery.data?.type ?? 'sickness',
    },
  });

  const leaveUpdate = useMutation(
    orpc.leave.updateById.mutationOptions({
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
      onError: (error) => {
        if (
          error instanceof ORPCError &&
          error.code === 'CONFLICT' &&
          error.data?.target?.includes('title')
        ) {
          form.setError('type', {
            message: t('book:manager.form.titleAlreadyExist'),
          });
          return;
        }

        toast.error('Une erreur est survenue lors de la mise à jour du congé.');
      },
    })
  );

  return (
    <>
      <PreventNavigation shouldBlock={form.formState.isDirty} />
      <Form
        {...form}
        onSubmit={async (values) => {
          leaveUpdate.mutate({ id: props.params.id, ...values });
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
                loading={leaveUpdate.isPending}
              >
                Mettre à jour
              </Button>
            }
          >
            <PageLayoutTopBarTitle>
              {t('book:manager.update.title')}
            </PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <PageLayoutContent>
            <div className="flex flex-col gap-4 xs:flex-row">
              <div className="flex-2">
                <Card>
                  <CardContent>
                    <FormLeave />
                  </CardContent>
                </Card>
              </div>
            </div>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
