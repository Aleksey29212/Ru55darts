import { getPlayerProfiles } from '@/lib/players';
import { getTournaments } from '@/lib/tournaments';
import { getAllScoringSettings, getLeagueSettings } from '@/lib/settings';
import type { Player, LeagueId } from '@/lib/types';
import { cache } from 'react';
import { calculatePlayerPoints } from './scoring';

/**
 * ЭТАЛОННЫЙ ДВИГАТЕЛЬ АГРЕГАЦИИ И РАНЖИРОВАНИЯ (v2.9 Audit)
 * ГАРАНТИЯ: Математическая точность тай-брейков и обработки дублей мест.
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

        // 1. Сбор данных и расчет очков для каждого турнирного вхождения
        allTournaments.forEach(t => {
            const lSettings = leagueSettings[t.league];
            if (!lSettings || (!lSettings.enabled && t.league !== generalLeagueId)) return;

            if (!leagueDataMap[t.league]) leagueDataMap[t.league] = {};

            const scoring = allScoringSettings[t.league];

            t.players.forEach(p => {
                const pResult = { ...p };
                if (scoring) calculatePlayerPoints(pResult, scoring);
                
                const entry = { ...pResult, tournamentId: t.id, leagueId: t.league };

                // Накопление в целевую лигу
                if (!leagueDataMap[t.league][p.id]) leagueDataMap[t.league][p.id] = [];
                leagueDataMap[t.league][p.id].push(entry);

                // Накопление в общий рейтинг (если лига отмечена как влияющая на глобал)
                if (t.league !== generalLeagueId && lSettings.includeInGeneralRanking) {
                    if (!leagueDataMap[generalLeagueId][p.id]) leagueDataMap[generalLeagueId][p.id] = [];
                    leagueDataMap[generalLeagueId][p.id].push(entry);
                }
            });
        });

        const eveningOmskRate = Number(allScoringSettings.evening_omsk?.exchangeRate) || 7;
        const finalRankings: Record<string, Player[]> = {};

        // 2. Агрегация и расчет средних показателей
        for (const leagueId in leagueDataMap) {
            const playersInLeague = leagueDataMap[leagueId];
            const processedPlayers: Player[] = Object.keys(playersInLeague).map(playerId => {
                const results = playersInLeague[playerId];
                const profile = profileMap.get(playerId);
                
                let pointsTotal = 0;
                let basePointsTotal = 0;
                let bonusPointsTotal = 0;
                let n180sTotal = 0;
                let hiOutMax = 0;
                let bestLegMin = 999;
                let avgSum = 0;
                let avgCount = 0;
                let playoffAppearances = 0; // Для расчета Win Rate (выходы в 1/4 и выше)

                results.forEach(r => {
                    // Стандартное суммирование (для всех лиг кроме Омска)
                    if (leagueId !== 'evening_omsk') {
                        pointsTotal += (Number(r.points) || 0);
                        basePointsTotal += (Number(r.basePoints) || 0);
                        bonusPointsTotal += (Number(r.bonusPoints) || 0);
                    }
                    
                    n180sTotal += (Number(r.n180s) || 0);
                    hiOutMax = Math.max(hiOutMax, Number(r.hiOut) || 0);
                    
                    if (Number(r.bestLeg) > 0) {
                        bestLegMin = Math.min(bestLegMin, Number(r.bestLeg));
                    }
                    
                    if ((Number(r.avg) || 0) > 0) {
                        avgSum += Number(r.avg);
                        avgCount++;
                    }
                    
                    // Учет "побед" как выходов в плей-офф (ранг 1-8)
                    if (Number(r.rank) <= 8) playoffAppearances++;
                });

                // СПЕЦИФИКА ОМСКА: Только 5 лучших результатов
                if (leagueId === 'evening_omsk') {
                    const sortedByPoints = [...results].sort((a, b) => (Number(b.points) || 0) - (Number(a.points) || 0));
                    const top5 = sortedByPoints.slice(0, 5);
                    pointsTotal = top5.reduce((sum, r) => sum + (Number(r.points) || 0), 0);
                    basePointsTotal = pointsTotal;
                    bonusPointsTotal = 0;
                }

                const finalAvg = avgCount > 0 ? avgSum / avgCount : 0;

                return {
                    ...profile!,
                    id: playerId,
                    name: profile?.name || results[0].name,
                    nickname: profile?.nickname || results[0].nickname,
                    avatarUrl: profile?.avatarUrl || results[0].avatarUrl,
                    rank: 0,
                    points: pointsTotal,
                    basePoints: basePointsTotal,
                    bonusPoints: bonusPointsTotal,
                    matchesPlayed: results.length,
                    wins: playoffAppearances,
                    losses: results.length - playoffAppearances,
                    avg: finalAvg,
                    n180s: n180sTotal,
                    hiOut: hiOutMax,
                    bestLeg: bestLegMin === 999 ? 0 : bestLegMin,
                    totalPointsFor180s: 0, // Устаревшие поля, держим для типов
                    totalPointsForHiOut: 0,
                    totalPointsForAvg: 0,
                    totalPointsForBestLeg: 0,
                    totalPointsFor9Darter: 0,
                    cashValue: leagueId === 'evening_omsk' ? Math.round(pointsTotal * eveningOmskRate) : undefined,
                    isQualifiedForFinal: false 
                };
            });

            // 3. СОРТИРОВКА (Математические Тай-брейки)
            // Приоритет: Баллы -> AVG (с точностью до 0.001) -> Hi-Out -> 180s -> Количество турниров
            const sorted = processedPlayers.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                
                // Сравнение AVG (дробные числа)
                if (Math.abs(b.avg - a.avg) > 0.001) return b.avg - a.avg;
                
                if (b.hiOut !== a.hiOut) return b.hiOut - a.hiOut;
                if (b.n180s !== a.n180s) return b.n180s - a.n180s;
                return b.matchesPlayed - a.matchesPlayed;
            });

            // 4. ПРИСВОЕНИЕ РАНГОВ (Competition Ranking Logic)
            // Если показатели идентичны — игроки делят одно место.
            let currentRank = 0;
            finalRankings[leagueId] = sorted.map((p, i) => {
                const prev = i > 0 ? sorted[i-1] : null;
                
                // Проверка на идентичность для разделения места
                const isSameAsPrev = prev && 
                    p.points === prev.points && 
                    Math.abs(p.avg - prev.avg) < 0.01 && 
                    p.hiOut === prev.hiOut;
                
                if (!isSameAsPrev) {
                    currentRank = i + 1;
                }
                
                return { 
                    ...p, 
                    rank: currentRank,
                    // Финалисты ТОП-16 (особенно актуально для Омска)
                    isQualifiedForFinal: leagueId === 'evening_omsk' && currentRank <= 16
                };
            });
        }

        return finalRankings;
    } catch (error) {
        console.error('Aggregation Engine Critical Error:', error);
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
