import { ImportForm } from "@/components/import-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LeagueId, AllLeagueSettings, League, Tournament } from "@/lib/types";
import { Info, History } from "lucide-react";
import { TournamentManagement } from "../tournaments/tournament-management";
import defaultLeagueSettings from '@/lib/league-settings.json';
import { getLeagueSettings } from "@/lib/settings";
import { getTournaments } from "@/lib/tournaments";

const LEAGUE_IDS: LeagueId[] = ['general', 'evening_omsk', 'premier', 'first', 'cricket', 'second', 'third', 'fourth', 'senior', 'youth', 'women'];

export default async function ImportAdminPage() {
    // Получаем настройки лиг и список турниров напрямую с сервера (работает и с БД, и с памятью)
    const leagueSettingsData = await getLeagueSettings();
    const tournaments = await getTournaments();

    // Формируем список лиг с русскими названиями
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
        <div className="max-w-6xl mx-auto space-y-12">
            <div className="space-y-8">
                <Card className="glassmorphism bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            Как работает импорт?
                        </CardTitle>
                        <CardDescription className="text-foreground/80">
                            Система сканирует страницу на <strong>dartsbase.ru</strong>, находит дату, 
                            определяет колонки статистики и рассчитывает баллы согласно правилам выбранной лиги. 
                            В демо-режиме данные сохраняются во временную память.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <ImportForm leagues={leagues} />
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

                <TournamentManagement tournaments={tournaments || []} leagues={leagues} />
            </div>
        </div>
    );
}
