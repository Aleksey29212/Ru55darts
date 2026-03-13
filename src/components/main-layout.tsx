'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import { cn } from '@/lib/utils';
import React from 'react';
import { Button } from './ui/button';
import { Send } from 'lucide-react';
import type { SponsorshipSettings, ScoringSettings } from '@/lib/types';

export function MainLayout({
  children,
  backgroundUrl,
  sponsorshipSettings,
  scoringSettings,
  leagueName,
}: {
  children: React.ReactNode;
  backgroundUrl: string;
  sponsorshipSettings: SponsorshipSettings;
  scoringSettings: ScoringSettings[];
  leagueName: string[];
}) {
  const pathname = usePathname();
  const isGatePage = pathname === '/gate';
  const isAdminSection = pathname.startsWith('/admin');

  if (isGatePage) {
    return <>{children}</>;
  }

  return (
    <>
      {backgroundUrl && !isAdminSection && (
        <div
          className="fixed inset-0 z-[-2] bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        />
      )}
      <div className="fixed inset-0 z-[-1] bg-background/90" />

      <div className={cn('flex min-h-screen flex-col')}>
        {!isAdminSection && (
          <Header
            sponsorshipSettings={sponsorshipSettings}
            scoringSettings={scoringSettings}
            leagueName={leagueName}
          />
        )}
        <div className="flex-1 flex flex-col">{children}</div>
        {!isAdminSection && (
          <footer className="container flex-shrink-0 py-8">
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>По вопросам сотрудничества и размещения информации:</p>
              <Button variant="link" asChild className="text-base text-primary">
                <a
                  href={sponsorshipSettings.groupVkLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Написать в VK-группу
                </a>
              </Button>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}