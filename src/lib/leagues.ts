import { getPlayerProfiles } from '@/lib/players';
import { getTournaments } from '@/lib/tournaments';
import { getAllScoringSettings, getLeagueSettings } from '@/lib/settings';
import type { Player, LeagueId } from '@/lib/types';
import { cache } from 'react';
import { calculatePlayerPoints } from './scoring';

/**
 * ЭТАЛОННЫЙ ДВИГАТЕЛЬ АГРЕГАЦИИ (v4.5 Robust)
 * Оптимизирован для Next.js 15 и больших объемов данных.
 * ГАРАНТИЯ: Точный расчет рейтингов даже при пустой БД.
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

        // 1. Распределение результатов по лигам
        allTournaments.forEach(t => {
            const lSettings = leagueSettings[t.league];
            // Игнорируем выключенные лиги (кроме Глобальной)
            if (!lSettings || (!lSettings.enabled && t.league !== generalLeagueId)) return;

            if (!leagueDataMap[t.league]) leagueDataMap[t.league] = {};

            const scoring = allScoringSettings[t.league];

            t.players.forEach(p => {
                const pResult = { ...p };
                if (scoring) calculatePlayerPoints(pResult, scoring);
                
                const entry = { ...pResult, tournamentId: t.id, leagueId: t.league };

                // Начисление в локальный рейтинг лиги
                if (!leagueDataMap[t.league][p.id]) leagueDataMap[t.league][p.id] = [];
                leagueDataMap[t.league][p.id].push(entry);

                // Начисление в Глобальный рейтинг (если включено в настройках лиги)
                if (t.league !== generalLeagueId && lSettings.includeInGeneralRanking) {
                    if (!leagueDataMap[generalLeagueId][p.id]) leagueDataMap[generalLeagueId][p.id] = [];
                    leagueDataMap[generalLeagueId][p.id].push(entry);
                }
            });
        });

        const eveningOmskRate = allScoringSettings.evening_omsk?.exchangeRate || 7;
        const finalRankings: Record<string, Player[]> = {};

        // 2. Детальный расчет по каждой лиге
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
                let wins = 0;

                // Категории бонусов для карточки
                let totalPointsFor180s = 0;
                let totalPointsForHiOut = 0;
                let totalPointsForAvg = 0;
                let totalPointsForBestLeg = 0;
                let totalPointsFor9Darter = 0;

                results.forEach(r => {
                    // Стандартное накопление (кроме Омска, где своя формула)
                    if (leagueId !== 'evening_omsk') {
                        points += (r.points || 0);
                        basePoints += (r.basePoints || 0);
                        bonusPoints += (r.bonusPoints || 0);
                        
                        totalPointsFor180s += (r.pointsFor180s || 0);
                        totalPointsForHiOut += (r.pointsForHiOut || 0);
                        totalPointsForAvg += (r.pointsForAvg || 0);
                        totalPointsForBestLeg += (r.pointsForBestLeg || 0);
                        totalPointsFor9Darter += (r.pointsFor9Darter || 0);
                    }
                    
                    n180s += (r.n180s || 0);
                    hiOut = Math.max(hiOut, r.hiOut || 0);
                    if (r.bestLeg > 0) bestLeg = Math.min(bestLeg, r.bestLeg);
                    avgSum += (r.avg || 0);
                    if (r.rank <= 8) wins++;
                });

                // Специфика "Вечернего Омска": 5 лучших туров по очкам
                if (leagueId === 'evening_omsk') {
                    const top5 = [...results].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5);
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
                    avg: results.length > 0 ? avgSum / results.length : 0,
                    n180s,
                    hiOut,
                    bestLeg: bestLeg === 999 ? 0 : bestLeg,
                    totalPointsFor180s,
                    totalPointsForHiOut,
                    totalPointsForAvg,
                    totalPointsForBestLeg,
                    totalPointsFor9Darter,
                    cashValue: leagueId === 'evening_omsk' ? points * eveningOmskRate : undefined,
                    isQualifiedForFinal: leagueId === 'evening_omsk' && results.length >= 1 
                };
            });

            // Сортировка (Очки -> AVG)
            const sorted = processedPlayers.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                return b.avg - a.avg;
            });

            // Присвоение мест с учетом одинаковых результатов
            let currentRank = 0;
            finalRankings[leagueId] = sorted.map((p, i) => {
                const isSameResult = i > 0 && 
                    sorted[i].points === sorted[i-1].points && 
                    Math.abs(sorted[i].avg - sorted[i-1].avg) < 0.01;
                
                if (!isSameResult) {
                    currentRank = i + 1;
                }
                return { ...p, rank: currentRank };
            });
        }

        return finalRankings;
    } catch (error) {
        console.error('Критическая ошибка агрегации Rankings:', error);
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
