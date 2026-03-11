'use client';

import { useRouter } from 'next/navigation';
import type { LeagueId, Player, AllLeagueSettings, ScoringSettings, SponsorshipSettings, Partner } from '@/lib/types';
import { LeaderboardHero } from '@/components/leaderboard-hero';
import { PlayerRankings } from '@/components/player-rankings';
import { cn } from '@/lib/utils';
import { 
    Target, 
    Sunset, 
    Sparkles, 
    Wallet, 
    Award, 
    ShieldCheck, 
    Trophy, 
    CircleUser, 
    Loader2, 
    BarChart2, 
    ChevronsUp, 
    Diamond, 
    Users, 
    Baby
} from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';
import { Button } from './ui/button';
import { useIsClient } from '@/hooks/use-is-client';
import { ScoringHelpDialog } from './scoring-help-dialog';
import { useTransition, useMemo } from 'react';
import { PartnersDisplay } from './partners-display';

interface LeaguePanelsProps {
  enabledLeagues: LeagueId[];
  leagueSettings: AllLeagueSettings;
  currentLeagueRankings: Player[];
  currentLeagueId: LeagueId;
  allScoringSettings: Record<LeagueId, ScoringSettings>;
  sponsorshipSettings: SponsorshipSettings;
  partners: Partner[];
  playerCounts?: Record<string, number>;
}

const DEFAULT_BANNER = 'https://picsum.photos/seed/darts-league/600/200';

const leagueIcons: Record<string, any> = {
    general: Trophy,
    evening_omsk: Sunset,
    premier: ShieldCheck,
    first: Award,
    second: BarChart2,
    third: ChevronsUp,
    fourth: Diamond,
    cricket: Target,
    senior: Users,
    youth: Baby,
    women: CircleUser,
};

const getLeagueBaseColor = (leagueId: LeagueId) => {
    const colors: Record<string, string> = {
        general: 'rgba(6, 182, 212, 0.8)',
        evening_omsk: 'rgba(249, 115, 22, 0.8)',
        premier: 'rgba(59, 130, 246, 0.8)',
        first: 'rgba(245, 158, 11, 0.8)',
        second: 'rgba(139, 92, 246, 0.8)',
        third: 'rgba(16, 185, 129, 0.8)',
        fourth: 'rgba(236, 72, 153, 0.8)',
        cricket: 'rgba(34, 197, 94, 0.8)',
        senior: 'rgba(71, 85, 105, 0.8)',
        youth: 'rgba(163, 230, 53, 0.8)',
        women: 'rgba(217, 70, 239, 0.8)',
    };
    return colors[leagueId] || colors.general;
}

function LeagueSection({ 
    leagueId, 
    players, 
    scoringSettings, 
    sponsorshipSettings 
}: { 
    leagueId: LeagueId, 
    players: Player[], 
    scoringSettings: ScoringSettings, 
    sponsorshipSettings: SponsorshipSettings 
}) {
    const activePlayers = players.filter(p => p.matchesPlayed > 0);
    const topPlayers = activePlayers.filter(p => p.rank > 0 && p.rank <= 3).sort((a, b) => a.rank - b.rank);
    const isEveningOmsk = leagueId === 'evening_omsk';

    return (
        <div className="space-y-12 md:space-y-20 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {isEveningOmsk && (
                <div className="relative group overflow-hidden rounded-[3.5rem] p-8 md:p-20 bg-gradient-to-br from-orange-600/30 via-black/60 to-transparent border-2 border-orange-500/40 shadow-[0_40px_120px_rgba(249,115,22,0.25)] transition-all hover:border-orange-500/60">
                    <div className="absolute -top-32 -right-32 p-4 opacity-15 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-[5000ms]">
                        <Sunset className="h-[400px] w-[400px] md:h-[600px] md:w-[600px] text-orange-500" />
                    </div>
                    <div className="flex flex-col lg:flex-row gap-16 relative z-10 items-center lg:items-start">
                        <div className="bg-orange-500/30 p-10 rounded-[3rem] border-2 border-orange-500/40 h-fit animate-pulse shadow-[0_0_60px_rgba(249,115,22,0.4)] group-hover:rotate-6 transition-transform">
                            <Sparkles className="h-16 w-16 md:h-24 md:w-24 text-orange-400" />
                        </div>
                        <div className="space-y-10 flex-1 text-center lg:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-center lg:justify-start gap-8">
                                <h3 className="text-5xl md:text-8xl font-headline uppercase tracking-tighter text-orange-400 text-glow-accent drop-shadow-2xl">ВЕЧЕРНИЙ ОМСК</h3>
                                <ScoringHelpDialog settings={scoringSettings} leagueName="Вечерний Омск" sponsorshipSettings={sponsorshipSettings}>
                                    <Button variant="outline" className="rounded-full h-16 px-10 border-orange-500/40 text-orange-400 hover:bg-orange-500/30 font-bold uppercase tracking-widest text-[11px] gap-4 shadow-2xl interactive-scale">
                                        <ShieldCheck className="h-6 w-6" />
                                        Официальный Регламент
                                    </Button>
                                </ScoringHelpDialog>
                            </div>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-4">
                                <div className="flex items-center gap-6 px-10 py-6 rounded-[2rem] bg-black/80 border-2 border-orange-500/30 shadow-3xl hover:bg-black transition-all group/stat">
                                    <Wallet className="h-10 w-10 text-orange-500 transition-transform group-hover/stat:scale-110" />
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-orange-300/50">Стоимость балла</span>
                                        <span className="text-2xl md:text-4xl font-headline text-orange-300">{scoringSettings?.exchangeRate || 7} ₽ <span className="text-sm opacity-40">/ PTS</span></span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 px-10 py-6 rounded-[2rem] bg-orange-500/25 border-2 border-orange-500/50 shadow-3xl hover:scale-105 transition-all group/stat">
                                    <Award className="h-10 w-10 text-orange-300 transition-transform group-hover/stat:scale-110" />
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-orange-100/50">Суперфинал сезона</span>
                                        <span className="text-2xl md:text-4xl font-headline text-orange-100">ТОП-16 МАСТЕРОВ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {activePlayers.length > 0 ? (
                <div className="space-y-16">
                    {topPlayers.length > 0 && <LeaderboardHero players={topPlayers} />}
                    <PlayerRankings players={activePlayers} leagueId={leagueId} />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 md:py-64 glassmorphism rounded-[5rem] border-2 border-dashed border-primary/25 text-center px-12 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent animate-pulse duration-[4s]" />
                    <div className="relative z-10 space-y-10">
                        <div className="p-16 rounded-[3.5rem] bg-primary/15 mb-8 ring-[16px] ring-primary/5 inline-block group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-[0_0_80px_rgba(var(--primary-rgb),0.2)]">
                            <Target className="h-28 w-24 md:h-40 md:w-40 text-primary/40" />
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-4xl md:text-7xl font-headline text-muted-foreground/30 uppercase tracking-tighter leading-none">ОЖИДАНИЕ ТУРНИРА</h3>
                            <p className="text-xl md:text-2xl text-muted-foreground/60 max-w-2xl mx-auto italic font-medium">Стадион пуст, но скоро здесь закипят страсти. Первый импорт данных заполнит эту таблицу.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function LeaguePanels({ 
    enabledLeagues, 
    leagueSettings, 
    currentLeagueRankings, 
    currentLeagueId, 
    allScoringSettings, 
    sponsorshipSettings,
    partners,
    playerCounts = {}
}: LeaguePanelsProps) {
    const router = useRouter();
    const isClient = useIsClient();
    const [isPending, startTransition] = useTransition();
    
    // Динамический порядок для Десктопа: выбранная лига всегда первая
    const orderedLeagues = useMemo(() => {
        const sorted = [...enabledLeagues];
        const activeIdx = sorted.indexOf(currentLeagueId);
        if (activeIdx > -1) {
            const [active] = sorted.splice(activeIdx, 1);
            sorted.unshift(active);
        }
        return sorted;
    }, [enabledLeagues, currentLeagueId]);

    const handleLeagueSelect = (leagueId: LeagueId) => {
        if (leagueId === currentLeagueId) return;
        startTransition(() => {
            router.push(`/?league=${leagueId}`, { scroll: false });
        });
    };

    if (!isClient) {
        return (
            <div className="space-y-12">
                <div className="h-32 w-full bg-muted/20 rounded-[2.5rem] animate-pulse" />
                <Skeleton className="h-[800px] w-full rounded-[4rem]" />
            </div>
        );
    }

    const currentScoring = allScoringSettings[currentLeagueId];

    return (
        <div className="w-full space-y-14">
            {/* Sticky Header Section */}
            <div className="sticky top-16 md:top-20 z-40 bg-background/95 backdrop-blur-3xl border-b-2 border-white/10 -mx-4 px-4 py-6 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all">
                <div className="w-full">
                    <PartnersDisplay partners={partners} variant="compact" hideLabel />
                </div>

                {/* ДЕСКТОП: Сетка карточек */}
                <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 animate-in fade-in duration-500">
                    {orderedLeagues.map((leagueId) => {
                        const leagueInfo = leagueSettings[leagueId];
                        const isSelected = currentLeagueId === leagueId;
                        const banner = leagueInfo.bannerUrl || DEFAULT_BANNER;
                        const LeagueIcon = leagueIcons[leagueId] || Target;
                        const baseColor = getLeagueBaseColor(leagueId);
                        const playerCount = playerCounts[leagueId] || 0;

                        return (
                            <div
                                key={leagueId}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleLeagueSelect(leagueId)}
                                className={cn(
                                    'relative h-16 rounded-2xl overflow-hidden transition-all duration-500 transform cursor-pointer outline-none border-2 shadow-lg group',
                                    isSelected 
                                        ? 'border-primary ring-2 ring-primary/20 scale-[1.02] z-10 shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] animate-shimmer' 
                                        : 'border-white/5 opacity-70 hover:opacity-100 hover:border-primary/40'
                                )}
                            >
                                <Image src={banner} alt="" fill className="object-cover transition-all duration-1000 group-hover:scale-110" unoptimized={banner.startsWith('data:')} />
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-r transition-opacity duration-700",
                                    isSelected ? "from-black/95 via-black/80 to-transparent" : "from-black/90 via-black/70 to-transparent"
                                )} />
                                <div className="absolute inset-0 px-3 flex items-center gap-3">
                                    <div className="relative">
                                        <div 
                                            className={cn(
                                                "p-2 rounded-xl backdrop-blur-xl border border-white/20 text-white shadow-2xl transition-all duration-700",
                                                isSelected && "scale-110 rotate-[360deg] border-white/40"
                                            )}
                                            style={{ backgroundColor: baseColor }}
                                        >
                                            {isPending && isSelected ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <LeagueIcon className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className={cn(
                                            "absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-black border border-white/20 shadow-lg",
                                            isSelected ? "bg-primary text-primary-foreground" : "bg-black/80 text-white"
                                        )}>
                                            {playerCount}
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center overflow-hidden">
                                        <p className="text-[12px] font-headline text-white uppercase tracking-tight truncate leading-none mb-1">
                                            {leagueInfo.name}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            {isSelected ? (
                                                <>
                                                    <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                                                    <p className="text-[8px] text-primary font-black uppercase tracking-[0.2em]">В ЭФИРЕ</p>
                                                </>
                                            ) : (
                                                <p className="text-[8px] text-muted-foreground/60 font-bold uppercase tracking-widest">Игроков: {playerCount}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* МОБИЛЬНЫЙ: Стопка закладок (Bookmark Stack) */}
                <div className="flex md:hidden overflow-x-auto no-scrollbar pt-8 pb-4 px-6 items-end h-44 mask-fade-edges">
                    {enabledLeagues.map((leagueId, idx) => {
                        const leagueInfo = leagueSettings[leagueId];
                        const isSelected = currentLeagueId === leagueId;
                        const banner = leagueInfo.bannerUrl || DEFAULT_BANNER;
                        const LeagueIcon = leagueIcons[leagueId] || Target;
                        const playerCount = playerCounts[leagueId] || 0;
                        const baseColor = getLeagueBaseColor(leagueId);
                        
                        return (
                            <div
                                key={leagueId}
                                role="button"
                                onClick={() => handleLeagueSelect(leagueId)}
                                className={cn(
                                    "relative flex-shrink-0 w-28 h-32 rounded-t-[2.5rem] transition-all duration-500 ease-out border-x-2 border-t-2 shadow-2xl",
                                    "-ml-16 first:ml-0 cursor-pointer overflow-hidden",
                                    isSelected 
                                        ? "z-50 -translate-y-6 scale-110 mx-4 border-primary ring-4 ring-primary/20 shadow-[0_20px_50px_rgba(var(--primary-rgb),0.4)]" 
                                        : "z-[var(--z-idx)] border-white/10 grayscale-[0.4] hover:-translate-y-2 opacity-80"
                                )}
                                style={{ 
                                    '--z-idx': isSelected ? 100 : (enabledLeagues.length - idx),
                                    backgroundColor: baseColor 
                                } as React.CSSProperties}
                            >
                                <Image src={banner} alt="" fill className="object-cover" unoptimized={banner.startsWith('data:')} />
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent",
                                    isSelected ? "opacity-40" : "opacity-80"
                                )} />
                                
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                                    <div className={cn(
                                        "p-2.5 rounded-xl backdrop-blur-xl border transition-all duration-700 shadow-2xl mb-2",
                                        isSelected ? "bg-primary text-primary-foreground border-white/40 scale-110" : "bg-black/40 text-white border-white/10"
                                    )}>
                                        {isPending && isSelected ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <LeagueIcon className="h-5 w-5" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-headline uppercase leading-tight line-clamp-2 px-1 text-glow-white",
                                        isSelected ? "text-primary scale-105" : "text-white/80"
                                    )}>
                                        {leagueInfo.name}
                                    </span>
                                    {playerCount > 0 && (
                                        <div className="mt-2 bg-black/60 rounded-full px-2 py-0.5 border border-white/10">
                                            <span className="text-[8px] font-black text-primary">#{playerCount}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="w-full relative pt-6">
                {isPending && (
                    <div className="absolute inset-0 z-10 bg-background/30 backdrop-blur-[3px] transition-all duration-500 pointer-events-none" />
                )}
                <section key={currentLeagueId} className="animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="flex items-center gap-6 mb-14">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-primary/50" />
                        <h2 className="text-3xl md:text-6xl font-headline uppercase tracking-tighter text-white text-glow-white drop-shadow-2xl">
                            {leagueSettings[currentLeagueId]?.name}
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/30 to-primary/50" />
                    </div>
                    
                    <LeagueSection 
                        leagueId={currentLeagueId}
                        players={currentLeagueRankings}
                        scoringSettings={currentScoring}
                        sponsorshipSettings={sponsorshipSettings}
                    />
                </section>
            </div>
        </div>
    );
}
