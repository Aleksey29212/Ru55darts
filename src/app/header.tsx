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
import { useState } from 'react';
import { DartboardIcon } from './icons/dartboard-icon';

export default function Header({
  sponsorshipSettings,
  scoringSettings,
  leagueName,
}: {
  sponsorshipSettings: SponsorshipSettings;
  scoringSettings: ScoringSettings;
  leagueName: string;
}) {
  const { isAdmin, logout } = useAdmin();
  const isClient = useIsClient();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-primary/50 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center px-4 md:px-8">
        <div className="flex items-center gap-3 group">
          <ScoringHelpDialog
            settings={scoringSettings}
            leagueName={leagueName}
            sponsorshipSettings={sponsorshipSettings}
          >
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative h-9 w-9 cursor-pointer flex items-center justify-center transition-all interactive-scale"
              aria-label="Справка по очкам"
            >
              {/* Эффект привлечения внимания */}
              <div className={cn(
                "absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-30",
                isHovered ? "opacity-0" : "opacity-30"
              )} />

              <div className={cn(
                "absolute inset-0 bg-primary/20 rounded-full transition-transform duration-700 blur-lg",
                isHovered ? "scale-125 opacity-100" : "scale-0 opacity-0"
              )} />
              
              <DartboardIcon
                className={cn(
                  'h-8 w-8 text-primary transition-all duration-500 absolute drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)]',
                  isHovered
                    ? 'opacity-0 scale-50 rotate-90 blur-sm'
                    : 'opacity-100 scale-100 rotate-0'
                )}
              />
              
              <HelpCircle
                className={cn(
                  'h-8 w-8 text-primary transition-all duration-500 absolute drop-shadow-[0_0_12px_hsl(var(--primary))]',
                  isHovered
                    ? 'opacity-100 scale-110 rotate-0'
                    : 'opacity-0 scale-50 -rotate-90'
                )}
              />

              <AlertCircle
                className={cn(
                  'h-4 w-4 text-primary transition-all duration-700 absolute -top-1 -right-1',
                  isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                )}
              />
            </div>
          </ScoringHelpDialog>

          <Link
            href="/"
            aria-label="Home"
            className="hover:opacity-80 transition-opacity active:scale-95"
          >
            <span className="text-2xl md:text-3xl font-headline tracking-tighter uppercase text-glow">
              DartBrig Pro
            </span>
          </Link>
        </div>

        <nav className="ml-auto flex items-center gap-1 md:gap-2">
          <Button
            variant="ghost"
            asChild
            size="sm"
            className={cn("rounded-xl interactive-scale", pathname === '/' && 'text-primary bg-primary/5')}
          >
            <Link href="/">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">
                Рейтинги
              </span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            size="sm"
            className={cn("rounded-xl interactive-scale", pathname.startsWith('/tournaments') && 'text-primary bg-primary/5')}
          >
            <Link href="/tournaments">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">
                Турниры
              </span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            size="sm"
            className={cn("rounded-xl interactive-scale", pathname.startsWith('/partners') && 'text-primary bg-primary/5')}
          >
            <Link href="/partners">
              <Handshake className="h-4 w-4" />
              <span className="hidden sm:inline">
                Партнеры
              </span>
            </Link>
          </Button>
          {isClient && isAdmin && (
            <div className="flex items-center gap-1 ml-1 border-l pl-1 border-white/10">
              <Button
                variant="ghost"
                asChild
                size="sm"
                className={cn("rounded-xl interactive-scale", pathname.startsWith('/admin') && 'text-primary bg-primary/5')}
              >
                <Link href="/admin">
                  <Shield className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={logout} className="rounded-xl interactive-scale text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
