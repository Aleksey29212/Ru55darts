import { getPlayerProfiles } from '@/lib/players';
import { getTournaments } from '@/lib/tournaments';
import { getAllScoringSettings, getLeagueSettings } from '@/lib/settings';
import type { Player, LeagueId } from '@/lib/types';
import { cache } from 'react';
import { calculatePlayerPoints } from './scoring';

/**
 * ЭТАЛОННЫЙ ДВИГАТЕЛЬ АГРЕГАЦИИ (v2.9 Audit)
 * ГАРАНТИЯ: Обработка задвоенных мест и расчет ТОП-16 финалистов.
 */
async function calculateAllRankings(): Promise<Record<string, Player[]>> {
    try {
        const [playerProfiles, allTournaments, allScoringSettings, leagueSettings] = await Promise.all([
            getPlayerProfiles(),
            getTournaments(),
            getAllScoringSettings(),
            getLeagueSettings(),
        ]);

        if (!allTournaments || allTournaments.length === 0) return {};

        const profileMap = new Map(playerProfiles.map(p => [p.id, p]));
        const leagueDataMap: Record<string, Record<string, any[]>> = {};
        const generalLeagueId = 'general';
        leagueDataMap[generalLeagueId] = {};

        // 1. Распределение турниров по лигам и расчет очков "на лету"
        allTournaments.forEach(t => {
            const lSettings = leagueSettings[t.league];
            if (!lSettings || (!lSettings.enabled && t.league !== generalLeagueId)) return;

            if (!leagueDataMap[t.league]) leagueDataMap[t.league] = {};

            const scoring = allScoringSettings[t.league];

            t.players.forEach(p => {
                const pResult = { ...p };
                if (scoring) calculatePlayerPoints(pResult, scoring);
                
                const entry = { ...pResult, tournamentId: t.id, leagueId: t.league };

                // Накопление в лигу начисления
                if (!leagueDataMap[t.league][p.id]) leagueDataMap[t.league][p.id] = [];
                leagueDataMap[t.league][p.id].push(entry);

                // Накопление в общий рейтинг (если включено для лиги)
                if (t.league !== generalLeagueId && lSettings.includeInGeneralRanking) {
                    if (!leagueDataMap[generalLeagueId][p.id]) leagueDataMap[generalLeagueId][p.id] = [];
                    leagueDataMap[generalLeagueId][p.id].push(entry);
                }
            });
        });

        const eveningOmskRate = allScoringSettings.evening_omsk?.exchangeRate || 7;
        const finalRankings: Record<string, Player[]> = {};

        // 2. Агрегация данных по каждому игроку в каждой лиге
        for (const leagueId in leagueDataMap) {
            const playersInLeague = leagueDataMap[leagueId];
            const processedPlayers: Player[] = Object.keys(playersInLeague).map(playerId => {
                const results = playersInLeague[playerId];
                const profile = profileMap.get(playerId);
                
                let points = 0;
                let basePoints = 0;
                let bonusPoints = 0;
                let n180s = 0;
                let hiOut = 0;
                let bestLeg = 999;
                let avgSum = 0;
                let avgCount = 0;
                let wins = 0; // Для агрегата: победы = выходы в плей-офф (rank <= 8)

                results.forEach(r => {
                    // В Омске расчет идет ниже по логике 5 лучших туров
                    if (leagueId !== 'evening_omsk') {
                        points += (r.points || 0);
                        basePoints += (r.basePoints || 0);
                        bonusPoints += (r.bonusPoints || 0);
                    }
                    
                    n180s += (r.n180s || 0);
                    hiOut = Math.max(hiOut, r.hiOut || 0);
                    if (r.bestLeg > 0) bestLeg = Math.min(bestLeg, r.bestLeg);
                    
                    if ((r.avg || 0) > 0) {
                        avgSum += r.avg;
                        avgCount++;
                    }
                    if (r.rank <= 8) wins++;
                });

                // Специфика «Вечернего Омска»: в зачет идут только 5 лучших туров
                if (leagueId === 'evening_omsk') {
                    const sortedByPoints = [...results].sort((a, b) => (b.points || 0) - (a.points || 0));
                    const top5 = sortedByPoints.slice(0, 5);
                    points = top5.reduce((sum, r) => sum + (r.points || 0), 0);
                    basePoints = points;
                    bonusPoints = 0;
                }

                return {
                    ...profile!,
                    id: playerId,
                    name: profile?.name || results[0].name,
                    nickname: profile?.nickname || results[0].nickname,
                    avatarUrl: profile?.avatarUrl || results[0].avatarUrl,
                    rank: 0,
                    points,
                    basePoints,
                    bonusPoints,
                    matchesPlayed: results.length,
                    wins,
                    losses: results.length - wins,
                    avg: avgCount > 0 ? avgSum / avgCount : 0,
                    n180s,
                    hiOut,
                    bestLeg: bestLeg === 999 ? 0 : bestLeg,
                    totalPointsFor180s: 0,
                    totalPointsForHiOut: 0,
                    totalPointsForAvg: 0,
                    totalPointsForBestLeg: 0,
                    totalPointsFor9Darter: 0,
                    cashValue: leagueId === 'evening_omsk' ? points * eveningOmskRate : undefined,
                    isQualifiedForFinal: false 
                };
            });

            // 3. СОРТИРОВКА (Тай-брейки): Баллы -> AVG -> Hi-Out -> 180s -> Опыт
            const sorted = processedPlayers.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.avg !== a.avg) return b.avg - a.avg;
                if (b.hiOut !== a.hiOut) return b.hiOut - a.hiOut;
                if (b.n180s !== a.n180s) return b.n180s - a.n180s;
                return b.matchesPlayed - a.matchesPlayed;
            });

            // 4. ПРИСВОЕНИЕ РАНГОВ (Обработка задвоенных мест)
            let currentRank = 0;
            finalRankings[leagueId] = sorted.map((p, i) => {
                const prev = i > 0 ? sorted[i-1] : null;
                // Игроки делят место, если их ключевые показатели идентичны
                const isSame = prev && 
                    p.points === prev.points && 
                    Math.abs(p.avg - prev.avg) < 0.01 && 
                    p.hiOut === prev.hiOut;
                
                if (!isSame) {
                    currentRank = i + 1;
                }
                
                return { 
                    ...p, 
                    rank: currentRank,
                    // Квалификация в финал (ТОП-16)
                    isQualifiedForFinal: leagueId === 'evening_omsk' && currentRank <= 16
                };
            });
        }

        return finalRankings;
    } catch (error) {
        console.error('Aggregation Error:', error);
        return {};
    }
}

export const getRankings = cache(async (leagueId: LeagueId) => {
    const all = await calculateAllRankings();
    return all[leagueId] || [];
});

export const getRankingsSnapshot = cache(async () => {
    return calculateAllRankings();
});
