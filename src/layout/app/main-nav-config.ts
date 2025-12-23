import { ValidateLinkOptions } from '@tanstack/react-router';
import { TreePalm } from 'lucide-react';
import { FC } from 'react';

import {
  IconUserCircleDuotone,
  IconUserCircleFill,
} from '@/components/icons/generated';

export const MAIN_NAV_LINKS = [
  {
    label: 'Congés',
    icon: TreePalm,
    iconActive: TreePalm,
    linkOptions: {
      to: '/app/leaves',
    },
  } as const,
  {
    labelTranslationKey: 'layout:nav.account',
    icon: IconUserCircleDuotone,
    iconActive: IconUserCircleFill,
    linkOptions: {
      to: '/app/account',
    },
  } as const,
] satisfies Array<{
  labelTranslationKey?: string;
  label?: string;
  icon: FC<{ className?: string }>;
  iconActive?: FC<{ className?: string }>;
  linkOptions: ValidateLinkOptions;
  exact?: boolean;
}>;
