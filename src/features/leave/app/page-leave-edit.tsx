import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useQueryStates } from 'nuqs';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { Form } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { authClient } from '@/features/auth/client';
import { FormLeave } from '@/features/leave/app/form-leave';
import { LeaveBalanceInfos } from '@/features/leave/balance/leave-balance-infos';
import { formNewSearchParams } from '@/features/leave/form-new-search-params';
import { DataListLeavesForDateRange } from '@/features/leave/leaves-data-list-date-range';
import { zFormFieldsLeave } from '@/features/leave/schema';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageLeaveEdit = (props: { params: { id: string } }) => {
  const [{ fromDate, toDate }] = useQueryStates(formNewSearchParams);

  const session = authClient.useSession();
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
      onError: () => {
        toast.error('Une erreur est survenue lors de la mise à jour du congé.');
      },
    })
  );

  const fromDateAsDate = dayjs(fromDate).toDate();
  const toDateAsDate = dayjs(toDate).toDate();
  return (
    <>
      <Form
        {...form}
        onSubmit={(values) => {
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
            <PageLayoutTopBarTitle>Modification du congé</PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <PageLayoutContent>
            <div className="flex flex-col gap-8">
              <Card>
                <CardContent>
                  <FormLeave />
                </CardContent>
              </Card>
              {!!session.data?.user && (
                <LeaveBalanceInfos
                  fromDate={fromDateAsDate}
                  toDate={toDateAsDate}
                  balance={session.data?.user.leaveBalance ?? ''}
                />
              )}
              <DataListLeavesForDateRange
                fromDate={fromDateAsDate}
                toDate={toDateAsDate}
                excludedIds={[props.params.id]}
              />
            </div>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
