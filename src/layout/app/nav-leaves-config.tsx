import {
  MessageSquareWarning,
  Search,
  SquareDashedMousePointer,
} from 'lucide-react';

import { NavMainItem } from '@/layout/app/nav-main';

export const navLeaveConfig = [
  {
    title: 'Mes congés',
    url: '/app/leaves/me',
    icon: SquareDashedMousePointer,
  },
  {
    title: 'Consultation',
    url: '/app/leaves',
    icon: Search,
  },
  {
    title: 'A review',
    url: '/app/leaves/review',
    icon: MessageSquareWarning,
  },
] satisfies NavMainItem[];
