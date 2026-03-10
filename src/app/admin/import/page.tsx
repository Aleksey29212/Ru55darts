'use client';

import { ImportForm } from "@/components/import-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import type { LeagueId, AllLeagueSettings, League, Tournament } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, History } from "lucide-react";
import { TournamentManagement } from "../tournaments/tournament-management";

// Move Evening Omsk to be more prominent in the admin list as well
const LEAGUE_IDS: LeagueId[] = ['general', 'evening_omsk', 'premier', 'first', 'cricket', 'second', 'third', 'fourth', 'senior', 'youth', 'women'];

export default function ImportAdminPage() {
    const db = useFirestore();

    const leagueSettingsRef = useMemoFirebase(() => db ? doc(db, 'app_settings', 'leagues') : null, [db]);
    const { data: leagueSettingsData, isLoading: isLoadingLeagues } = useDoc<AllLeagueSettings>(leagueSettingsRef);

    const tournamentsQuery = useMemoFirebase(() => db ? collection(db, 'tournaments') : null, [db]);
    const { data: tournaments, isLoading: isLoadingTournaments } = useCollection<Tournament>(tournamentsQuery);

    const leagueSettings = leagueSettingsData || {};

    const leagues: League[] = LEAGUE_IDS.map(key => ({
        id: key,
        name: leagueSettings[key]?.name || key,
        enabled: leagueSettings[key]?.enabled ?? false,
        includeInGeneralRanking: (leagueSettings[key] as any)?.includeInGeneralRanking ?? false
    }));

    const isLoading = isLoadingLeagues || isLoadingTournaments;

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            <div className="space-y-8">
                <Card className="glassmorphism bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            Как работает импорт?
                        </CardTitle>
                        <CardDescription className="text-foreground/80">
                            Наша система автоматически сканирует страницу турнира на <strong>dartsbase.ru</strong>. 
                            Она находит дату проведения прямо в заголовке, динамически определяет колонки статистики (AVG, 180, Место) 
                            и рассчитывает баллы согласно правилам выбранной лиги. 
                            Если игрока еще нет в базе, его профиль будет создан автоматически.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {isLoadingLeagues ? (
                    <Card className="glassmorphism">
                        <CardHeader>
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-12 w-full" />
                        </CardContent>
                    </Card>
                ) : (
                    <ImportForm leagues={leagues} />
                )}
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <History className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-headline uppercase tracking-tight">Архив загрузок</h2>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Управление результатами</p>
                    </div>
                </div>

                {isLoadingTournaments ? (
                    <Card className="glassmorphism">
                        <CardContent className="p-6 space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </CardContent>
                    </Card>
                ) : (
                    <TournamentManagement tournaments={tournaments || []} leagues={leagues} />
                )}
            </div>
        </div>
    );
}
