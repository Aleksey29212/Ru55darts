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


export default async function TournamentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const tournamentData = await getTournamentById(id);

    if (!tournamentData) {
        notFound();
    }
    
    const leagueSettings = await getLeagueSettings();
    const leagueName = leagueSettings[tournamentData.league]?.name || tournamentData.league;

    // Recalculate points on the fly to ensure they are up-to-date with current settings
    const scoringSettings = await getScoringSettings(tournamentData.league);
    const playersWithCalculatedPoints = tournamentData.players.map(player => {
        // Create a copy to avoid mutating the original object from the cache
        const playerCopy = { ...player };
        calculatePlayerPoints(playerCopy, scoringSettings);
        return playerCopy;
    });

    const tournament = {
        ...tournamentData,
        players: playersWithCalculatedPoints,
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
                    <CardTitle className="text-2xl">{tournament.name}</CardTitle>
                    <CardDescription>Результаты от {formatDate(tournament.date as string)}</CardDescription>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                    <TournamentPlayerList players={sortedPlayers} tournamentId={tournament.id} />
                </CardContent>
            </Card>
        </main>
    );
}
