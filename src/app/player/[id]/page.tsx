import { getPlayerProfileById } from '@/lib/players';
import { getTournaments } from '@/lib/tournaments';
import { notFound } from 'next/navigation';
import { PlayerPageClient } from './player-page-client';
import type { Player, ScoringSettings, LeagueId } from '@/lib/types';
import { getRankings } from '@/lib/leagues';
import { Timestamp } from 'firebase/firestore';
import { getLeagueSettings, getSponsorshipSettings, getAllScoringSettings } from '@/lib/settings';
import { calculatePlayerPoints } from '@/lib/scoring';

/**
 * @fileOverview Серверный компонент страницы игрока.
 * ГАРАНТИЯ: Адаптация под Next.js 15 (Async Params & SearchParams).
 */

export default async function PlayerPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tournamentId?: string; leagueId?: LeagueId }>;
}) {
  const params = await props.params; // NEXT.JS 15: Must await params
  const searchParams = await props.searchParams; // NEXT.JS 15: Must await searchParams
  
  const playerId = decodeURIComponent(params.id);
  const tournamentId = searchParams?.tournamentId;
  const leagueContextId = searchParams?.leagueId;

  const basePlayerProfile = await getPlayerProfileById(playerId);
  if (!basePlayerProfile) {
    notFound();
  }

  const allTournaments = await getTournaments();
  const leagueSettings = await getLeagueSettings();
  const sponsorshipSettings = await getSponsorshipSettings();
  const allScoringSettings = await getAllScoringSettings();

  const viewMode: 'aggregate' | 'single' = tournamentId ? 'single' : 'aggregate';

  // 1. Определение контекста лиги (приоритет: параметр URL -> турнир -> Глобальный)
  let currentLeagueId: LeagueId = leagueContextId || 'general';
  
  if (viewMode === 'single' && tournamentId) {
      const specificTournament = allTournaments.find(t => t.id === tournamentId);
      if (specificTournament) {
          currentLeagueId = specificTournament.league;
      }
  }

  // 2. Получение агрегированных данных игрока в выбранной лиге
  const leagueRankings = await getRankings(currentLeagueId);
  const foundPlayerInLeague = leagueRankings.find(p => p.id === playerId);

  // 3. Формирование истории турниров строго по критериям лиги
  const historyTournamentsMatchCriteria = allTournaments.filter(t => {
      const lInfo = leagueSettings[t.league];
      if (!lInfo || (!lInfo.enabled && t.league !== 'general')) return false;

      if (currentLeagueId === 'general') {
          return t.league === 'general' || lInfo.includeInGeneralRanking;
      }
      return t.league === currentLeagueId;
  });

  const playerTournaments = historyTournamentsMatchCriteria
    .filter(t => t.players.some(p => p.id === playerId))
    .map(t => {
        const pResult = t.players.find(p => p.id === playerId)!;
        const scoring = allScoringSettings[t.league];
        const pCopy = { ...pResult };
        if (scoring) calculatePlayerPoints(pCopy, scoring);
        
        return {
            playerId,
            tournamentId: t.id,
            tournamentName: t.name,
            tournamentDate: t.date,
            playerRank: pCopy.rank,
            playerPoints: pCopy.points,
            leagueName: leagueSettings[t.league]?.name || t.league,
        };
    })
    .sort((a, b) => {
        const getTime = (d: any) => {
            if (d instanceof Timestamp) return d.toMillis();
            if (typeof d === 'string') return new Date(d).getTime();
            return new Date(d).getTime();
        };
        return getTime(b.tournamentDate) - getTime(a.tournamentDate);
    });

  let playerForCard: Player;
  if (!foundPlayerInLeague) {
      // Игрок еще не участвовал в этой лиге
      playerForCard = {
        ...basePlayerProfile,
        rank: 0, points: 0, basePoints: 0, bonusPoints: 0,
        matchesPlayed: playerTournaments.length,
        wins: 0, losses: 0, avg: 0, n180s: 0, hiOut: 0, bestLeg: 0,
        totalPointsFor180s: 0, totalPointsForHiOut: 0, totalPointsForAvg: 0,
        totalPointsForBestLeg: 0, totalPointsFor9Darter: 0,
        viewContextName: leagueSettings[currentLeagueId]?.name || 'Общий рейтинг',
        isAggregatedView: currentLeagueId === 'general'
      };
  } else {
      playerForCard = {
          ...foundPlayerInLeague,
          viewContextName: leagueSettings[currentLeagueId]?.name || 'Общий рейтинг',
          isAggregatedView: currentLeagueId === 'general'
      };
  }

  // 4. Подготовка справок по очкам для модального окна
  let scoringSettingsForHelp: ScoringSettings[] = [];
  let leagueNamesForHelp: string[] = [];

  if (currentLeagueId !== 'general') {
      const currentSetting = allScoringSettings[currentLeagueId];
      if (currentSetting) {
          scoringSettingsForHelp = [{ ...currentSetting, id: currentLeagueId }];
          leagueNamesForHelp = [leagueSettings[currentLeagueId]?.name || currentLeagueId];
      }
  } else {
      const contributingLeagues = (Object.keys(leagueSettings) as LeagueId[])
        .filter(id => id === 'general' || (leagueSettings[id].enabled && leagueSettings[id].includeInGeneralRanking));
      
      scoringSettingsForHelp = contributingLeagues.map(id => ({ ...allScoringSettings[id], id }));
      leagueNamesForHelp = scoringSettingsForHelp.map(s => leagueSettings[s.id as LeagueId]?.name || String(s.id));
  }

  return (
    <PlayerPageClient
      player={playerForCard}
      tournaments={playerTournaments}
      viewMode={viewMode}
      pageSubtitle={playerForCard.viewContextName || 'Профиль игрока'}
      contextId={tournamentId}
      scoringSettings={scoringSettingsForHelp}
      leagueName={leagueNamesForHelp}
      showSponsors={sponsorshipSettings.showSponsorsInProfile ?? true}
      showSponsorshipCallToActionGlobal={sponsorshipSettings.showSponsorshipCallToAction ?? true}
      sponsorTemplate={sponsorshipSettings.sponsorTemplate ?? 'default'}
      callToActionSlogans={sponsorshipSettings.callToActionSlogans}
    />
  );
}
