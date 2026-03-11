'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Shield,
  LogOut,
  Trophy,
  TrendingUp,
  Handshake,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { useAdmin } from '@/context/admin-context';
import { useIsClient } from '@/hooks/use-is-client';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { SponsorshipSettings, ScoringSettings } from '@/lib/types';
import { ScoringHelpDialog } from './scoring-help-dialog';
import { useState, useEffect } from 'react';
import { DartboardIcon } from './icons/dartboard-icon';
import { ViewModeToggle } from './view-mode-toggle';

type IconState = 'owl' | 'help' | 'alert';

export default function Header({
  sponsorshipSettings,
  scoringSettings,
  leagueName,
}: {
  sponsorshipSettings: SponsorshipSettings;
  scoringSettings: ScoringSettings | ScoringSettings[];
  leagueName: string | string[];
}) {
  const { isAdmin, logout } = useAdmin();
  const isClient = useIsClient();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [iconState, setIconState] = useState<IconState>('owl');

  const isAdminSection = pathname.startsWith('/admin');

  useEffect(() => {
    if (isHovered) return;

    const sequence: IconState[] = ['owl', 'help', 'owl', 'alert'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % sequence.length;
      setIconState(sequence[currentIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered]);

  useEffect(() => {
    if (isHovered) {
      setIconState('help');
    }
  }, [isHovered]);

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-primary/30 bg-background/95 backdrop-blur-2xl transition-all duration-500">
      <div className="container flex h-16 md:h-20 items-center px-4 md:px-8">
        <div className="flex items-center gap-2 sm:gap-6 group shrink-0">
          <ScoringHelpDialog
            settings={scoringSettings}
            leagueName={leagueName}
            sponsorshipSettings={sponsorshipSettings}
          >
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative h-11 w-11 cursor-pointer flex items-center justify-center transition-all interactive-scale"
              aria-label="Справка по очкам"
            >
              <div className={cn(
                "absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-40 duration-[3s]",
                isHovered ? "opacity-0" : "opacity-40"
              )} />
              
              <div className={cn(
                "absolute inset-0 bg-primary/10 rounded-full transition-transform duration-1000 blur-2xl",
                isHovered ? "scale-150 opacity-100" : "scale-100 opacity-0"
              )} />

              <DartboardIcon
                className={cn(
                  'h-8 w-8 text-primary transition-all duration-1000 absolute drop-shadow-[0_0_12px_hsl(var(--primary)/0.4)]',
                  iconState === 'owl' 
                    ? 'opacity-100 scale-100 rotate-[360deg] blur-0' 
                    : 'opacity-0 scale-50 rotate-0 blur-sm'
                )}
              />

              <HelpCircle
                className={cn(
                  'h-8 w-8 text-primary transition-all duration-1000 absolute drop-shadow-[0_0_20px_hsl(var(--primary)/0.9)]',
                  iconState === 'help' 
                    ? 'opacity-100 scale-110 rotate-[360deg] blur-0' 
                    : 'opacity-0 scale-50 rotate-0 blur-sm'
                )}
              />

              <AlertCircle
                className={cn(
                  'h-8 w-8 text-primary transition-all duration-1000 absolute drop-shadow-[0_0_20px_hsl(var(--primary)/0.9)]',
                  iconState === 'alert' 
                    ? 'opacity-100 scale-110 rotate-[360deg] blur-0' 
                    : 'opacity-0 scale-50 rotate-0 blur-sm'
                )}
              />
            </div>
          </ScoringHelpDialog>

          <Link href="/" aria-label="Home" className="hover:opacity-90 transition-all active:scale-95">
            <span className="text-xl sm:text-2xl md:text-4xl font-headline tracking-tighter uppercase text-glow whitespace-nowrap">
              DartBrig Pro
            </span>
          </Link>
        </div>

        <nav className="ml-auto flex items-center gap-1 sm:gap-3 md:gap-4">
          <div className="hidden lg:block">
            <ViewModeToggle className="bg-black/60" />
          </div>

          <Button variant="ghost" asChild className={cn(
            "h-12 px-4 rounded-2xl transition-all interactive-scale", 
            pathname === '/' ? 'text-primary bg-primary/10 border border-primary/20 shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.1)]' : 'text-muted-foreground hover:text-foreground'
          )}>
            <Link href="/">
              <TrendingUp className="h-5 w-5" />
              <span className="hidden xl:inline ml-2 font-bold uppercase tracking-widest text-[10px]">Рейтинги</span>
            </Link>
          </Button>
          
          <Button variant="ghost" asChild className={cn(
            "h-12 px-4 rounded-2xl transition-all interactive-scale", 
            pathname.startsWith('/tournaments') ? 'text-primary bg-primary/10 border border-primary/20 shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.1)]' : 'text-muted-foreground hover:text-foreground'
          )}>
            <Link href="/tournaments">
              <Trophy className="h-5 w-5" />
              <span className="hidden xl:inline ml-2 font-bold uppercase tracking-widest text-[10px]">Турниры</span>
            </Link>
          </Button>

          <Button variant="ghost" asChild className={cn(
            "h-12 px-4 rounded-2xl transition-all interactive-scale", 
            pathname.startsWith('/partners') ? 'text-primary bg-primary/10 border border-primary/20 shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.1)]' : 'text-muted-foreground hover:text-foreground'
          )}>
            <Link href="/partners">
              <Handshake className="h-5 w-5" />
              <span className="hidden xl:inline ml-2 font-bold uppercase tracking-widest text-[10px]">Партнеры</span>
            </Link>
          </Button>
          
          {isClient && isAdmin && (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10 group/admin">
              <Button 
                variant="ghost" 
                asChild 
                className={cn(
                    "h-12 w-12 rounded-2xl transition-all interactive-scale relative overflow-hidden",
                    isAdminSection ? 'bg-primary/20 text-primary shadow-[0_0_25px_rgba(var(--primary-rgb),0.4)] border border-primary/30' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                )}
              >
                <Link href="/admin">
                    <Shield className={cn("h-6 w-6", isAdminSection && "animate-pulse")} />
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                onClick={logout} 
                className="h-12 w-12 rounded-2xl interactive-scale text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10"
                title="Выход"
              >
                <LogOut className="h-6 w-6" />
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}