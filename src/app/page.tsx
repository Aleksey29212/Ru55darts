import { getAllScoringSettings, getLeagueSettings, getSponsorshipSettings } from '@/lib/settings';
import { getRankingsSnapshot } from '@/lib/leagues';
import type { LeagueId, Player } from '@/lib/types';
import { getTournaments } from '@/lib/tournaments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';
import { PlayerSelector } from '@/components/player-selector';
import { getPartners } from '@/lib/partners';
import { PartnersDisplay } from '@/components/partners-display';
import { LeaguePanels } from '@/components/league-panels';
import { NewsTicker } from '@/components/news-ticker';
import newsTickerData from '@/lib/news-ticker-data.json';

export const dynamic = 'force-dynamic';

const LEAGUE_ORDER: LeagueId[] = ['general', 'evening_omsk', 'premier', 'first', 'cricket', 'second', 'third', 'fourth', 'senior', 'youth', 'women'];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ league?: LeagueId }>;
}) {
  const resolvedSearchParams = await searchParams;
  const { newsItems } = newsTickerData;
  
  let leagueSettings: any = {};
  let tournaments: any[] = [];
  let partners: any[] = [];
  let allScoringSettings: any = {};
  let sponsorshipSettings: any = {};
  let rankingsSnapshot: Record<string, Player[]> = {};

  try {
    const results = await Promise.all([
      getLeagueSettings(),
      getTournaments(),
      getPartners(),
      getAllScoringSettings(),
      getSponsorshipSettings(),
      getRankingsSnapshot(),
    ]);
    leagueSettings = results[0];
    tournaments = results[1];
    partners = results[2];
    allScoringSettings = results[3];
    sponsorshipSettings = results[4];
    rankingsSnapshot = results[5];
  } catch (e) {
    console.error("Home page data fetch failed:", e);
  }

  if (tournaments.length === 0) {
    return (
        <div className="flex-1 container py-12 flex items-center justify-center min-h-[60vh]">
            <Card className="glassmorphism max-w-lg w-full text-center p-8 rounded-[2.5rem]">
                <CardHeader>
                    <CardTitle className="font-headline text-4xl text-primary text-glow">Добро пожаловать!</CardTitle>
                    <CardDescription className="text-lg">Ваша панель управления рейтингами готова.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-8 text-muted-foreground">Войдите в панель администратора, чтобы импортировать первый турнир и запустить систему.</p>
                    <Button asChild size="lg" className="h-14 px-8 font-bold shadow-xl shadow-primary/20 rounded-2xl interactive-scale text-primary-foreground">
                    <Link href="/admin">
                        <Shield className="mr-2 h-5 w-5" />
                        Панель администратора
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  const enabledLeagues = LEAGUE_ORDER.filter(id => {
      const isEnabled = leagueSettings[id] && leagueSettings[id].enabled;
      const hasData = rankingsSnapshot[id] && rankingsSnapshot[id].length > 0;
      return isEnabled || hasData || id === 'general';
  });

  const leagueParam = resolvedSearchParams?.league;
  const defaultTab = leagueParam && enabledLeagues.includes(leagueParam) ? leagueParam : enabledLeagues[0];

  const allActivePlayers = Object.values(rankingsSnapshot)
    .flat()
    .filter(p => p.matchesPlayed > 0)
    .filter((p, index, self) => index === self.findIndex(t => t.id === p.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex-1 container py-8 space-y-8 animate-in fade-in duration-700">
        <NewsTicker items={newsItems} />
        <PartnersDisplay partners={partners} variant="compact" />
        {allActivePlayers.length > 0 && <PlayerSelector players={allActivePlayers}/>}
        <LeaguePanels 
            enabledLeagues={enabledLeagues}
            leagueSettings={leagueSettings}
            rankings={enabledLeagues.map(id => rankingsSnapshot[id] || [])}
            defaultTab={defaultTab}
            allScoringSettings={allScoringSettings}
            sponsorshipSettings={sponsorshipSettings}
        />
    </div>
  );
}
