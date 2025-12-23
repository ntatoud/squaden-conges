import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { User } from '@/features/user/schema';

export function UserAvatar({
  user,
  className,
}: {
  user?: User | null;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      <AvatarImage src={user?.image ?? ''} />
      <AvatarFallback variant="boring" name={user?.name ?? ''} />
    </Avatar>
  );
}
