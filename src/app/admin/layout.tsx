'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import {
  LayoutDashboard,
  Shield,
  Calculator,
  Users,
  Home,
  Trophy,
  Wand2,
  Camera,
  Library,
  Handshake,
  Image as ImageIcon,
  BarChart,
  CloudDownload,
  Code2,
  ChevronLeft,
} from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { 
    href: '/admin/source-code', 
    label: 'Код программы (ЭТАЛОН)', 
    icon: Code2,
    priority: true 
  },
  { href: '/admin', label: 'Обзор (Дашборд)', icon: LayoutDashboard },
  { href: '/admin/analytics', label: 'Аналитика', icon: BarChart },
  { href: '/admin/import', label: 'Импорт турниров', icon: CloudDownload },
  { href: '/admin/tournaments', label: 'Архив турниров', icon: Trophy },
  { href: '/admin/leagues', label: 'Управление лигами', icon: Library },
  { href: '/admin/scoring', label: 'Настройки очков', icon: Calculator },
  { href: '/admin/players', label: 'Игроки', icon: Users },
  { href: '/admin/style-studio', label: 'Студия стилей', icon: Wand2 },
  { href: '/admin/photo-studio', label: 'Фотостудия', icon: Camera },
  { href: '/admin/partners', label: 'Партнеры', icon: Handshake },
  { href: '/admin/background', label: 'Фон страницы', icon: ImageIcon },
];

function AdminSidebarContent() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <>
      <SidebarHeader className="border-b bg-muted/20">
        <div className="flex items-center justify-between p-3">
          <Link href="/admin" onClick={() => setOpenMobile(false)} className="transition-transform hover:scale-105 active:scale-95 duration-150">
            <Logo />
          </Link>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-muted/5">
        <SidebarMenu className="p-3 gap-1.5">
          {adminNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === item.href} 
                className={cn(
                  "font-medium rounded-xl transition-all duration-150 h-11 active:scale-95",
                  item.priority ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20" : ""
                )} 
                tooltip={item.label}
              >
                <Link href={item.href} onClick={() => setOpenMobile(false)}>
                  <item.icon className={cn(
                      "h-5 w-5",
                      item.priority ? "text-primary" : ""
                  )} />
                  <span className={cn(
                      item.priority ? "font-bold tracking-tight" : ""
                  )}>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <div className="mt-auto p-4 border-t bg-muted/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="font-bold rounded-xl bg-secondary/50 hover:bg-secondary h-11 active:scale-95 duration-150" tooltip="Вернуться в приложение">
              <Link href="/" onClick={() => setOpenMobile(false)}>
                <Home className="text-muted-foreground h-5 w-5" />
                <span>Выход в LIVE</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMainAdmin = pathname === '/admin';

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r-2 border-primary/10">
        <AdminSidebarContent />
      </Sidebar>
      <SidebarInset className="bg-background/50">
        <main className="flex-1 p-4 md:p-10">
           <div className="flex items-center justify-between mb-8 border-b border-primary/10 pb-6">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden"/>
                <Link 
                    href="/admin" 
                    className={cn(
                        "flex items-center gap-3 group transition-all py-2 pr-4 active:scale-95 duration-150",
                        isMainAdmin ? "pointer-events-none" : "hover:translate-x-[-4px]"
                    )}
                >
                    <div className={cn(
                        "p-3 rounded-xl shadow-inner transition-colors duration-150",
                        isMainAdmin ? "bg-primary/10 text-primary" : "bg-primary text-primary-foreground group-hover:bg-primary/90"
                    )}>
                        {isMainAdmin ? <Shield className="h-8 w-8" /> : <ChevronLeft className="h-8 w-8" />}
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-headline tracking-tighter uppercase leading-none">
                            {isMainAdmin ? "Панель управления" : "Вернуться в меню"}
                        </h1>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1 opacity-70">
                            DartBrig Pro Management
                        </p>
                    </div>
                </Link>
            </div>
            
            {!isMainAdmin && (
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 transition-all duration-150">
                    <Shield className="h-3 w-3 text-primary/50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Режим администратора</span>
                </div>
            )}
          </div>
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
