import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClearTournamentsButton } from "./clear-button";
import { TournamentManagement } from "./tournament-management";
import type { LeagueId, League } from "@/lib/types";
import defaultLeagueSettings from '@/lib/league-settings.json';
import { getTournaments } from "@/lib/tournaments";
import { getLeagueSettings } from "@/lib/settings";

const LEAGUE_IDS: LeagueId[] = ['general', 'evening_omsk', 'premier', 'first', 'cricket', 'second', 'third', 'fourth', 'senior', 'youth', 'women'];

export default async function TournamentsAdminPage() {
    const tournaments = await getTournaments();
    const leagueSettingsData = await getLeagueSettings();

    const leagues: League[] = LEAGUE_IDS.map(key => {
        const setting = leagueSettingsData[key];
        const fromJson = (defaultLeagueSettings as any)[key];
        return {
            id: key,
            name: setting?.name || fromJson?.name || key,
            enabled: setting?.enabled ?? fromJson?.enabled ?? false,
            includeInGeneralRanking: setting?.includeInGeneralRanking ?? fromJson?.includeInGeneralRanking ?? false
        };
    });

    return (
        <div className="grid gap-8">
            <TournamentManagement tournaments={tournaments || []} leagues={leagues} />
            
            <Card className="glassmorphism border-destructive">
                <CardHeader>
                    <CardTitle className="text-xl text-destructive">Опасная зона</CardTitle>
                    <CardDescription>
                        Это действие необратимо. Будьте внимательны.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Очистить ВСЕ турниры</p>
                        <p className="text-sm text-muted-foreground">Удаляет все турниры и сбрасывает статистику игроков.</p>
                    </div>
                    <ClearTournamentsButton />
                </CardContent>
            </Card>
        </div>
    );
}
