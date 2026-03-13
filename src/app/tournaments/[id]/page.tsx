import { getTournamentById } from '@/lib/tournaments';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { TournamentShareButton } from '@/components/tournament-share-button';
import { getLeagueSettings, getScoringSettings } from '@/lib/settings';
import { calculatePlayerPoints } from '@/lib/scoring';
import { TournamentPlayerList } from './tournament-player-list';

/**
 * @fileOverview Страница подробностей турнира.
 * ГАРАНТИЯ: Адаптировано под Next.js 15 (Async Params).
 * Учёт ручных правок при отображении баллов.
 */

export default async function TournamentDetailsPage(props: { 
  params: Promise<{ id: string }> 
}) {
    const params = await props.params; 
    const tournamentData = await getTournamentById(params.id);

    if (!tournamentData) {
        notFound();
    }
    
    const leagueSettings = await getLeagueSettings();
    const leagueName = leagueSettings[tournamentData.league]?.name || tournamentData.league;

    // Пересчет очков "на лету" только если турнир НЕ был отредактирован вручную
    const scoringSettings = await getScoringSettings(tournamentData.league);
    
    const processedPlayers = tournamentData.players.map(player => {
        const playerCopy = { ...player };
        if (!tournamentData.isManuallyEdited) {
            calculatePlayerPoints(playerCopy, scoringSettings);
        }
        return playerCopy;
    });

    const tournament = {
        ...tournamentData,
        players: processedPlayers,
    };
    
    const sortedPlayers = [...tournament.players].sort((a, b) => a.rank - b.rank);

    return (
        <main className="flex-1 container py-8">
            <div className="mb-8 flex justify-between items-center">
                <Button asChild variant="outline">
                    <Link href="/tournaments">
                        <ArrowLeft />
                        Назад к турнирам
                    </Link>
                </Button>
                <TournamentShareButton tournament={tournament} />
            </div>
            <Card className="glassmorphism">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">{tournament.name}</CardTitle>
                            <CardDescription>Результаты от {formatDate(tournament.date as string)}</CardDescription>
                        </div>
                        {tournament.isManuallyEdited && (
                            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                Проверено админом
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                    <TournamentPlayerList players={sortedPlayers} tournamentId={tournament.id} />
                </CardContent>
            </Card>
        </main>
    );
}
