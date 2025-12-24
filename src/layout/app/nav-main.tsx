'use client';

import { Link } from '@tanstack/react-router';
import { type LucideIcon, Palmtree } from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { FileRoutesByTo } from '@/routeTree.gen';

export type NavMainItem = {
  title: string;
  url: keyof FileRoutesByTo;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: keyof FileRoutesByTo;
    icon?: LucideIcon;
  }[];
};

export function NavMain({ items }: { items: NavMainItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <Palmtree className="mr-2" /> Congés
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <Link
              to={item.url}
              activeOptions={{
                exact: true,
              }}
            >
              {({ isActive }) => (
                <SidebarMenuButton isActive={isActive}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              )}
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
