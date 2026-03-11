
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClearTournamentsButton } from "./clear-button";
import { TournamentManagement } from "./tournament-management";
import type { LeagueId, Tournament, AllLeagueSettings, League } from "@/lib/types";
import { useCollection, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import defaultLeagueSettings from '@/lib/league-settings.json';

const LEAGUE_IDS: LeagueId[] = ['general', 'evening_omsk', 'premier', 'first', 'cricket', 'second', 'third', 'fourth', 'senior', 'youth', 'women'];

export default function TournamentsAdminPage() {
    const db = useFirestore();

    const tournamentsQuery = useMemoFirebase(() => db ? collection(db, 'tournaments') : null, [db]);
    const { data: tournaments, isLoading: isLoadingTournaments } = useCollection<Tournament>(tournamentsQuery);

    const leagueSettingsRef = useMemoFirebase(() => db ? doc(db, 'app_settings', 'leagues') : null, [db]);
    const { data: leagueSettingsData, isLoading: isLoadingLeagues } = useDoc<AllLeagueSettings>(leagueSettingsRef);

    const leagues: League[] = LEAGUE_IDS.map(key => {
        const fromDb = leagueSettingsData?.[key];
        const fromJson = (defaultLeagueSettings as any)[key];
        return {
            id: key,
            name: fromDb?.name || fromJson?.name || key,
            enabled: fromDb?.enabled ?? fromJson?.enabled ?? false,
            includeInGeneralRanking: (fromDb as any)?.includeInGeneralRanking ?? fromJson?.includeInGeneralRanking ?? false
        };
    });

    const isLoading = isLoadingTournaments || isLoadingLeagues;

    return (
        <div className="grid gap-8">
            {isLoading ? (
                <Card className="glassmorphism">
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            ) : (
                <TournamentManagement tournaments={tournaments || []} leagues={leagues} />
            )}
            
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
