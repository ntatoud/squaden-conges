import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { CheckCircle2Icon, Copy } from 'lucide-react';
import { useQueryStates } from 'nuqs';
import { useForm } from 'react-hook-form';

import { orpc } from '@/lib/orpc/client';
import { useClipboard } from '@/hooks/use-clipboard';

import { BackButton } from '@/components/back-button';
import { Form } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { FormLeave } from '@/features/leave/app/form-leave';
import { formNewSearchParams } from '@/features/leave/form-new-search-params';
import { DataListLeavesForDateRange } from '@/features/leave/leaves-data-list-date-range';
import { zFormFieldsLeave } from '@/features/leave/schema';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageLeaveNew = () => {
  const [{ fromDate, toDate, type }] = useQueryStates(formNewSearchParams);

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
            <div className="flex flex-col gap-8">
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
                  <FormLeave />
                </CardContent>
              </Card>
              <DataListLeavesForDateRange
                fromDate={dayjs(fromDate).toDate()}
                toDate={dayjs(toDate).toDate()}
              />
            </div>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
