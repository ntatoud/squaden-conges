import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ComponentProps, ReactElement, ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDisclosure } from 'react-use-disclosure';
import { toast } from 'sonner';
import z from 'zod';

import { orpc } from '@/lib/orpc/client';
import { queryClient } from '@/lib/tanstack-query/query-client';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDrawer,
  ResponsiveDrawerClose,
  ResponsiveDrawerContent,
  ResponsiveDrawerDescription,
  ResponsiveDrawerFooter,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
  ResponsiveDrawerTrigger,
} from '@/components/ui/responsive-drawer';

export const ReviewModal = (props: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactElement<{ onClick: () => void }>;
  confirmVariant?: ComponentProps<typeof Button>['variant'];
  leaveId: string;
  isApproved: boolean;
  isFinal?: boolean;
}) => {
  const [isPending, setIsPending] = useState(false);
  const { close, open, isOpen } = useDisclosure();

  const approveLeave = useMutation(
    orpc.leave.review.mutationOptions({
      onSuccess: async () => {
        if (props.isApproved && props.isFinal) {
          toast.success('Demande de acceptée');
        }

        if (props.isApproved && !props.isFinal) {
          toast.success('Vous avez donné votre accord pour cette demande');
        }

        if (!props.isApproved) {
          toast.success('Demande de congé refusée');
        }

        await queryClient.invalidateQueries({
          queryKey: orpc.leave.getAllReview.key(),
          type: 'all',
        });

        await queryClient.invalidateQueries({
          queryKey: orpc.leave.getById.key({
            input: {
              id: props.leaveId,
            },
          }),
          type: 'all',
        });
      },
      onError: () =>
        toast.error('Une erreur est survenue lors de la review du congé'),
    })
  );

  const form = useForm({
    resolver: zodResolver(z.object({ reason: z.string().nullish() })),
    defaultValues: { reason: '' },
  });

  const handleCancel = () => {
    setIsPending(false);
    close();
  };

  return (
    <ResponsiveDrawer
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          open();
          return;
        }
        handleCancel();
      }}
    >
      <ResponsiveDrawerTrigger asChild>
        {props.children}
      </ResponsiveDrawerTrigger>
      <ResponsiveDrawerContent hideCloseButton className="sm:max-w-xs">
        <Form
          {...form}
          onSubmit={(values) => {
            setIsPending(true);
            approveLeave.mutate({
              id: props.leaveId,
              isApproved: props.isApproved,
              reason: values.reason,
              isFinal: props.isFinal,
            });
            setIsPending(false);
            close();
          }}
          className="flex flex-col gap-6"
        >
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>{props.title}</ResponsiveDrawerTitle>
            <ResponsiveDrawerDescription>
              {props.description}
            </ResponsiveDrawerDescription>
          </ResponsiveDrawerHeader>
          <FormField className="flex flex-col gap-3">
            <FormFieldLabel>
              Raison {props.isApproved ? "de l'acceptation" : 'du refus'} :
            </FormFieldLabel>

            <FormFieldController
              type="textarea"
              control={form.control}
              name="reason"
            />
          </FormField>

          <ResponsiveDrawerFooter>
            <ResponsiveDrawerClose asChild>
              <Button size="lg" variant="secondary" className="max-sm:w-full">
                Annuler
              </Button>
            </ResponsiveDrawerClose>
            <Button
              size="lg"
              variant={props.confirmVariant ?? 'default'}
              className="max-sm:w-full"
              loading={isPending}
              type="submit"
              onClick={() => form.reset()}
            >
              Confirmer
            </Button>
          </ResponsiveDrawerFooter>
        </Form>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
