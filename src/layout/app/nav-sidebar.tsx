import { Link } from '@tanstack/react-router';
import { PanelLeftIcon, XIcon } from 'lucide-react';
import { ReactNode } from 'react';

import { Logo } from '@/components/brand/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import { navLeaveConfig } from '@/layout/app/nav-leaves-config';
import { NavMain } from '@/layout/app/nav-main';
import { NavUser } from '@/layout/app/nav-user';

export const NavSidebar = (props: { children?: ReactNode }) => {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-auto">
                  <Link to="/app">
                    <span>
                      <Logo className="w-12 group-data-[collapsible=icon]:w-18" />
                    </span>
                    <span className="-ml-1.5 font-mono text-lg font-semibold text-primary">
                      Congés
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarTrigger
              className="group-data-[collapsible=icon]:hidden"
              icon={
                <>
                  <XIcon className="md:hidden" />
                  <PanelLeftIcon className="hidden md:block rtl:rotate-180" />
                </>
              }
            />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={navLeaveConfig} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{props.children}</SidebarInset>
    </SidebarProvider>
  );
};
