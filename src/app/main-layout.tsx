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
  scoringSettings: ScoringSettings;
  leagueName: string;
}) {
  const pathname = usePathname();
  const isGatePage = pathname === '/gate';

  if (isGatePage) {
    return <>{children}</>;
  }

  return (
    <>
      {backgroundUrl && (
        <div
          className="fixed inset-0 z-[-2] bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        />
      )}
      <div className="fixed inset-0 z-[-1] bg-background/90" />

      <div className={cn('flex min-h-screen flex-col')}>
        <Header
          sponsorshipSettings={sponsorshipSettings}
          scoringSettings={scoringSettings}
          leagueName={leagueName}
        />
        <div className="flex-1">{children}</div>
        <footer className="container flex-shrink-0 py-8">
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>По вопросам сотрудничества и размещения информации:</p>
            <Button variant="link" asChild className="text-base text-primary">
              <a
                href={sponsorshipSettings.groupVkLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current mr-2 inline-block" xmlns="http://www.w3.org/2000/svg"><path d="M15.073 2H8.937C3.333 2 2 3.333 2 8.937v6.136C2 20.667 3.333 22 8.927 22h6.136c5.604 0 6.937-1.333 6.937-6.937V8.937C22 3.333 20.667 2 15.073 2zm3.51 13.172c0 3.125-2.406 3.125-2.406 3.125h-1.146s-.344-.042-.531-.25c-.188-.208-.49-.646-.49-.646s-.312-.417-.562-.385c-.25.03-.312.323-.312.323s-.02.448-.313.625c-.29.177-.812.135-.812.135h-.5s-1.5-.104-2.812-1.562c-1.313-1.458-2.469-4.333-2.469-4.333s-.166-.417.02-.625c.188-.208.646-.208.646-.208h1.25s.188.02.313.125c.125.104.198.292.198.292s.208.531.48 1.01c.541.958.77 1.22.968 1.22.198 0 .28-.125.28-.73 0-1.187-.187-1.687-.541-1.937-.282-.198-.49-.25-.375-.458.115-.208.458-.208.792-.208h1.937s.25.03.375.156c.125.125.115.365.115.365s-.02 1.26.25 1.49c.188.156.438-.156.979-1.22.271-.531.469-1.125.469-1.125s.062-.146.166-.219c.104-.073.25-.052.25-.052h1.312s.396-.052.458.125c.062.177-.083.583-.083.583s-.521 1.219-1.104 2.135c-.438.688-.563.865-.146 1.25.417.385 1.115 1.073 1.51 1.562.292.365.51.667.51.667s.156.23.01.385c-.145.156-.427.146-.427.146z"/></svg>
                Написать в VK-группу
              </a>
            </Button>
          </div>
        </footer>
      </div>
    </>
  );
}
