import { getPlayerProfiles } from '@/lib/players';
import { getTournaments } from '@/lib/tournaments';
import { getAllScoringSettings, getLeagueSettings } from '@/lib/settings';
import type { Player, Tournament, LeagueId, TournamentPlayerResult, AllLeagueSettings, ScoringSettings } from '@/lib/types';
import { cache } from 'react';
import { calculatePlayerPoints } from './scoring';

/**
 * ОПТИМИЗИРОВАННЫЙ ДВИГАТЕЛЬ АГРЕГАЦИИ (Версия 3.7)
 * ИСПРАВЛЕНО: Устранено дублирование турниров в Общем рейтинге (было 2 вместо 1).
 */
async function calculateAllRankings(): Promise<Record<string, Player[]>> {
    try {
        const [playerProfiles, allTournaments, allScoringSettings, leagueSettings] = await Promise.all([
            getPlayerProfiles(),
            getTournaments(),
            getAllScoringSettings(),
            getLeagueSettings(),
        ]);

        const enabledLeagueIds = (Object.keys(leagueSettings) as LeagueId[]).filter(id => leagueSettings[id].enabled || id === 'general');
        
        const resultsMap = new Map<string, Record<string, (TournamentPlayerResult & { tournamentId: string, tournamentDate: Tournament['date'], leagueId: LeagueId })[]>>();
        
        enabledLeagueIds.forEach(id => resultsMap.set(id, {}));
        if (!resultsMap.has('general')) resultsMap.set('general', {});

        allTournaments.forEach(t => {
            const lInfo = leagueSettings[t.league];
            if (!lInfo) return; 

            const isLeagueEnabled = lInfo.enabled || t.league === 'general';
            if (!isLeagueEnabled) return;

            const settings = allScoringSettings[t.league];
            const isIncludedInGeneral = lInfo.includeInGeneralRanking;

            (t.players || []).forEach(p => {
                const resultCopy = { ...p };
                if (settings) calculatePlayerPoints(resultCopy, settings);
                
                const entry = { ...resultCopy, tournamentId: t.id, tournamentDate: t.date, leagueId: t.league };

                // 1. Добавляем в конкретную лигу
                const leagueResults = resultsMap.get(t.league);
                if (leagueResults) {
                    if (!leagueResults[p.id]) leagueResults[p.id] = [];
                    leagueResults[p.id].push(entry);
                }

                // 2. Добавляем в общий зачет (ИСПРАВЛЕНО: Только если это НЕ сама лига general, чтобы не двоилось)
                if (t.league !== 'general' && isIncludedInGeneral) {
                    const generalResults = resultsMap.get('general')!;
                    if (!generalResults[p.id]) generalResults[p.id] = [];
                    generalResults[p.id].push(entry);
                }
            });
        });

        const eveningOmskRate = allScoringSettings.evening_omsk?.exchangeRate || 7;
        const finalRankings: Record<string, Player[]> = {};

        for (const [leagueId, playersData] of resultsMap.entries()) {
            const athleteStats = Object.keys(playersData).map(playerId => {
                const profile = playerProfiles.find(p => p.id === playerId);
                const results = playersData[playerId];
                
                let finalPoints = 0;
                let basePoints = 0;
                let bonusPoints = 0;
                let n180s = 0;
                let hiOut = 0;
                let bestLeg = 999;
                let avgSum = 0;
                let wins = 0;
                
                let totalPointsFor180s = 0;
                let totalPointsForHiOut = 0;
                let totalPointsForAvg = 0;
                let totalPointsForBestLeg = 0;
                let totalPointsFor9Darter = 0;

                results.forEach(r => {
                    const curPoints = Number(r.points || 0);
                    const curBase = Number(r.basePoints || 0);
                    const curBonus = Number(r.bonusPoints || 0);
                    const cur180 = Number(r.n180s || 0);
                    const curHiOut = Number(r.hiOut || 0);
                    const curBestLeg = Number(r.bestLeg || 0);
                    const curAvg = Number(r.avg || 0);

                    if (leagueId !== 'evening_omsk') {
                        finalPoints += curPoints;
                        basePoints += curBase;
                        bonusPoints += curBonus;
                        totalPointsFor180s += Number(r.pointsFor180s || 0);
                        totalPointsForHiOut += Number(r.pointsForHiOut || 0);
                        totalPointsForAvg += Number(r.pointsForAvg || 0);
                        totalPointsForBestLeg += Number(r.pointsForBestLeg || 0);
                        totalPointsFor9Darter += Number(r.pointsFor9Darter || 0);
                    }

                    n180s += cur180;
                    const normalizedHiOut = Number(curHiOut) || 0;
                    if (normalizedHiOut > 0 && normalizedHiOut <= 170) {
                        hiOut = Math.max(hiOut, normalizedHiOut);
                    }
                    if (curBestLeg > 0) bestLeg = Math.min(bestLeg, curBestLeg);
                    avgSum += curAvg;
                    if (r.rank <= 8) wins++;
                });

                if (leagueId === 'evening_omsk') {
                    const sortedResults = [...results].sort((a, b) => Number(b.points) - Number(a.points)).slice(0, 5);
                    finalPoints = sortedResults.reduce((sum, r) => sum + Number(r.points || 0), 0);
                    basePoints = finalPoints;
                    bonusPoints = 0;
                }

                // Гарантия уникальности турниров для счетчика matchesPlayed
                const uniqueTournaments = new Set(results.map(r => r.tournamentId));
                const matchesPlayed = uniqueTournaments.size;

                const avg = results.length > 0 ? avgSum / results.length : 0;
                
                const player: Player = {
                    id: playerId,
                    name: profile?.name || results[0]?.name || playerId,
                    nickname: profile?.nickname || results[0]?.nickname || 'Новичок',
                    avatarUrl: profile?.avatarUrl || results[0]?.avatarUrl || `https://picsum.photos/seed/${encodeURIComponent(playerId)}/400/400`,
                    bio: profile?.bio || '',
                    imageHint: profile?.imageHint || 'person portrait',
                    backgroundUrl: profile?.backgroundUrl || '',
                    sponsors: profile?.sponsors || [],
                    points: finalPoints,
                    basePoints,
                    bonusPoints,
                    matchesPlayed, 
                    wins,
                    losses: matchesPlayed - wins,
                    avg,
                    n180s,
                    hiOut,
                    bestLeg: bestLeg === 999 ? 0 : bestLeg,
                    totalPointsFor180s,
                    totalPointsForHiOut,
                    totalPointsForAvg,
                    totalPointsForBestLeg,
                    totalPointsFor9Darter,
                    isAggregatedView: leagueId === 'general',
                    rank: 0 
                };

                const omskResults = results.filter(r => r.leagueId === 'evening_omsk');
                if (omskResults.length > 0) {
                    const omskPoints = omskResults.sort((a,b) => Number(b.points) - Number(a.points)).slice(0, 5)
                        .reduce((s, r) => s + Number(r.points || 0), 0);
                    player.cashValue = omskPoints * eveningOmskRate;
                }

                return player;
            });

            const sorted = athleteStats.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (Math.abs(b.avg - a.avg) > 0.01) return b.avg - a.avg;
                return b.wins - a.wins;
            });

            let currentRank = 0;
            finalRankings[leagueId] = sorted.map((p, i) => {
                if (i === 0 || sorted[i].points !== sorted[i-1].points || Math.abs(sorted[i].avg - sorted[i-1].avg) > 0.1) {
                    currentRank = i + 1;
                }
                const player = { ...p, rank: currentRank };
                if (leagueId === 'evening_omsk' && player.rank <= 16) player.isQualifiedForFinal = true;
                return player;
            });
        }

        return finalRankings;
    } catch (error) {
        console.error('Ошибка агрегации рейтингов:', error);
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