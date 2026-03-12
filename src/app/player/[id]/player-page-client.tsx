'use client';

import { PlayerCard } from '@/components/player-card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAdmin } from '@/context/admin-context';
import { TemplateSwitcher } from '@/components/template-switcher';
import { useState, useTransition } from 'react';
import type { Player, PlayerTournamentHistory, ScoringSettings, SponsorTemplateId, TemplateId } from '@/lib/types';
import { TournamentHistory } from '@/components/tournament-history';
import { useIsClient } from '@/hooks/use-is-client';
import { ShareButtons } from '@/components/share-buttons';
import { PlayerVisualizations } from '@/components/player-visualizations';
import { updatePlayer } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export function PlayerPageClient({
  player,
  tournaments,
  viewMode,
  pageSubtitle,
  contextId,
  scoringSettings,
  leagueName,
  showSponsors,
  showSponsorshipCallToActionGlobal,
  sponsorTemplate,
  callToActionSlogans,
}: {
  player: Player;
  tournaments: PlayerTournamentHistory[];
  viewMode: 'aggregate' | 'single';
  pageSubtitle: string | null;
  contextId?: string | null;
  scoringSettings: ScoringSettings[];
  leagueName: string[];
  showSponsors: boolean;
  showSponsorshipCallToActionGlobal: boolean;
  sponsorTemplate: SponsorTemplateId;
  callToActionSlogans?: string[];
}) {
  const { isAdmin } = useAdmin();
  const [template, setTemplate] = useState<TemplateId>(player.cardTemplateId || 'classic');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const isClient = useIsClient();

  const handleTemplateChange = (newTemplate: TemplateId) => {
      setTemplate(newTemplate);
      // Если админ меняет шаблон на странице игрока, сохраняем это изменение в профиль
      if (isAdmin) {
          startTransition(async () => {
              const result = await updatePlayer({ ...player, cardTemplateId: newTemplate });
              if (result.success) {
                  toast({ title: 'Шаблон сохранен', description: `Профиль игрока обновлен стилем "${newTemplate}".` });
              }
          });
      }
  };

  const backLink = viewMode === 'single' && contextId ? `/tournaments/${contextId}` : '/';
  const backText = viewMode === 'single' ? 'Назад к турниру' : 'Назад к рейтингам';

  return (
    <main className="flex-1 container py-8">
      <div className="flex justify-between items-start mb-8">
        <Button asChild variant="outline">
          <Link href={backLink}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backText}
          </Link>
        </Button>
      </div>

      {pageSubtitle && (
        <div className="mb-4 p-4 bg-muted/50 rounded-xl border border-white/5 flex items-center justify-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <h2 className="font-headline text-sm uppercase tracking-widest text-muted-foreground">{pageSubtitle}</h2>
        </div>
      )}
      
      <div className="grid lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3">
          <PlayerCard 
            player={{ ...player, cardTemplateId: template }} 
            template={template} 
            viewMode={viewMode} 
            showSponsors={showSponsors} 
            showSponsorshipCallToActionGlobal={showSponsorshipCallToActionGlobal}
            sponsorTemplate={sponsorTemplate}
            callToActionSlogans={callToActionSlogans}
            scoringSettings={scoringSettings}
            leagueNames={leagueName}
          />
        </div>
        <div className="lg:col-span-2 space-y-8 lg:sticky lg:top-24">
          {isClient && isAdmin && (
              <TemplateSwitcher 
                selectedTemplate={template} 
                onTemplateChange={handleTemplateChange} 
              />
          )}
          
          <PlayerVisualizations 
            player={player} 
            tournaments={tournaments} 
            viewMode={viewMode} 
          />

          <ShareButtons player={player} />
          
          {viewMode === 'aggregate' && (
            <TournamentHistory tournaments={tournaments} />
          )}
        </div>
      </div>
    </main>
  );
}
