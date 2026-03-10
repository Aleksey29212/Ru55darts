'use server';

import { getPlayerProfiles, updatePlayerProfiles } from '@/lib/players';
import { addTournaments, clearAllTournamentData, deleteTournamentById, getTournamentById } from '@/lib/tournaments';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { PlayerProfile, ScoringSettings, LeagueId, AllLeagueSettings, SponsorshipSettings } from '@/lib/types';
import { updateScoringSettings, updateLeagueSettings, getScoringSettings, updateBackgroundUrl, updateSponsorshipSettings } from '@/lib/settings';
import { getDb } from '@/firebase/server';
import { addDoc, collection, doc, serverTimestamp, updateDoc, deleteDoc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import { headers } from 'next/headers';
import { getRankings } from '@/lib/leagues';
import { CardBackgrounds } from '@/lib/card-backgrounds';
import { scrapeTournamentData } from '@/lib/scraping';

/**
 * ГАРАНТИЯ: Все экшены асинхронны и используют revalidatePath для мгновенного обновления UI.
 */

export async function importTournament(prevState: unknown, formData: FormData) {
  const tournamentIdsRaw = formData.get('tournamentId');
  const league = formData.get('league') as LeagueId;

  if (!tournamentIdsRaw || typeof tournamentIdsRaw !== 'string' || !league) {
    return { success: false, message: 'Некорректный ввод.' };
  }

  const inputs = tournamentIdsRaw.split(/[,;\s]+/).filter(Boolean);
  const scoringSettings = await getScoringSettings(league);
  const tournamentsToCreate: any[] = [];
  let playerProfiles = await getPlayerProfiles();
  const newPlayerProfiles: PlayerProfile[] = [];
  const errors: string[] = [];

  for (const input of inputs) {
    try {
      const scraped = await scrapeTournamentData(input, league, scoringSettings);
      
      const existing = await getTournamentById(scraped.id);
      if (existing) {
        errors.push(`${input}: Турнир уже загружен в систему.`);
        continue;
      }

      for (const pResult of scraped.players) {
        const exists = playerProfiles.some(p => p.id === pResult.id) || newPlayerProfiles.some(p => p.id === pResult.id);
        if (!exists) {
          const randomBg = CardBackgrounds[Math.floor(Math.random() * CardBackgrounds.length)];
          newPlayerProfiles.push({
            id: pResult.id,
            name: pResult.name,
            nickname: 'Новичок',
            avatarUrl: pResult.avatarUrl,
            bio: `Профиль создан автоматически при импорте турнира ${scraped.name}.`,
            imageHint: 'person portrait',
            backgroundUrl: randomBg.url,
            backgroundImageHint: randomBg.hint,
            sponsorshipCallToAction: 'Станьте спонсором игрока',
            showSponsorshipCallToAction: true,
            sponsors: []
          });
        }
      }

      tournamentsToCreate.push({
        id: scraped.id,
        name: scraped.name,
        date: scraped.date,
        league: league,
        players: scraped.players,
      });
    } catch (e: any) {
      errors.push(`${input}: ${e.message}`);
    }
  }

  if (newPlayerProfiles.length > 0) await updatePlayerProfiles([...playerProfiles, ...newPlayerProfiles]);
  if (tournamentsToCreate.length > 0) await addTournaments(tournamentsToCreate);
  
  revalidatePath('/', 'layout');
  revalidatePath('/admin/import');
  revalidateTag('settings');
  revalidateTag('scoring');
  revalidateTag('tournaments');
  revalidateTag('leagues');
  
  const successCount = tournamentsToCreate.length;
  return { 
    success: successCount > 0, 
    message: successCount > 0 
      ? `Успешно: ${successCount} турнир(ов) добавлено.` 
      : `Ошибка импорта: турниры уже в базе или некорректные ID.`,
    errors: errors.length > 0 ? errors : undefined
  };
}

export async function updatePlayer(player: PlayerProfile) {
  try {
    const db = getDb();
    const { id, ...playerData } = player;
    await updateDoc(doc(db, 'players', id), playerData);
    revalidatePath('/', 'layout');
    revalidatePath('/admin/players');
    revalidateTag('players');
    return { success: true, message: `Профиль обновлен.` };
  } catch (error) {
    return { success: false, message: 'Ошибка обновления.' };
  }
}

export async function deletePlayerAction(playerId: string) {
    try {
        const db = getDb();
        await deleteDoc(doc(db, 'players', playerId));
        revalidatePath('/', 'layout');
        revalidatePath('/admin/players');
        revalidateTag('players');
        return { success: true, message: 'Игрок удален.' };
    } catch (e) {
        return { success: false, message: 'Ошибка при удалении.' };
    }
}

export async function saveScoringSettings(leagueId: LeagueId, data: ScoringSettings) {
  await updateScoringSettings(leagueId, data);
  revalidateTag('scoring');
  revalidateTag('settings');
  revalidateTag('leagues');
  revalidatePath('/', 'layout');
  return { success: true, message: `Настройки очков для лиги "${leagueId}" сохранены.` };
}

export async function saveLeagueSettings(data: AllLeagueSettings) {
  await updateLeagueSettings(data);
  revalidateTag('leagues');
  revalidateTag('settings');
  revalidateTag('scoring');
  revalidateTag('tournaments');
  revalidatePath('/', 'layout');
  revalidatePath('/admin/leagues');
  return { success: true, message: `Настройки лиг успешно обновлены на главной панели.` };
}

export async function deleteTournamentAction(tournamentId: string) {
    await deleteTournamentById(tournamentId);
    revalidateTag('tournaments');
    revalidateTag('leagues');
    revalidatePath('/', 'layout');
    revalidatePath('/admin/tournaments');
    return { success: true, message: `Турнир #${tournamentId} удален из базы.` };
}

export async function clearTournamentsAction() {
    await clearAllTournamentData();
    revalidatePath('/', 'layout');
    revalidatePath('/admin/tournaments');
    revalidateTag('tournaments');
    revalidateTag('leagues');
    return { success: true, message: 'Архив турниров полностью очищен.' };
}

export async function logVisitAction() {
  const headersList = await headers(); // NEXT.JS 15: Must await headers()
  const userAgent = headersList.get('user-agent') || '';
  if (/bot|crawl|spider/i.test(userAgent)) return;
  const db = getDb();
  await addDoc(collection(db, 'visits'), { timestamp: serverTimestamp() });
}

export async function saveBackgroundAction(prevState: unknown, formData: FormData) {
    const url = formData.get('url') as string;
    const intent = formData.get('intent') as string;
    
    if (intent === 'reset') {
        await updateBackgroundUrl('');
        revalidateTag('background');
        revalidateTag('settings');
        revalidatePath('/', 'layout');
        return { success: true, message: 'Фон сброшен.' };
    }
    
    await updateBackgroundUrl(url);
    revalidateTag('background');
    revalidateTag('settings');
    revalidatePath('/', 'layout');
    return { success: true, message: 'Новый фон применен.' };
}

export async function saveSponsorshipAction(settings: SponsorshipSettings) {
    await updateSponsorshipSettings(settings);
    revalidateTag('sponsorship');
    revalidateTag('settings');
    revalidatePath('/', 'layout');
    return { success: true, message: 'Настройки связи и спонсорства обновлены.' };
}

export async function updatePlayerAvatar(playerId: string, dataUrl: string | null) {
    try {
        const db = getDb();
        const playerRef = doc(db, 'players', playerId);
        if (dataUrl) {
            await updateDoc(playerRef, { avatarUrl: dataUrl });
        } else {
            const playerSnap = await getDoc(playerRef);
            const name = playerSnap.exists() ? playerSnap.data()?.name : playerId;
            await updateDoc(playerRef, { avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(name)}/400/400` });
        }
        revalidatePath('/', 'layout');
        revalidatePath('/admin/photo-studio');
        revalidateTag('players');
        return { success: true, message: 'Фото игрока обновлено.' };
    } catch (e) {
        return { success: false, message: 'Ошибка фотостудии.' };
    }
}

export async function logSponsorClickAction(playerId: string, sponsorName: string) {
    try {
        const db = getDb();
        await addDoc(collection(db, 'sponsor_clicks'), {
            playerId,
            sponsorName,
            timestamp: serverTimestamp()
        });
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

export async function clearAllPlayerData() {
    try {
        const db = getDb();
        const playersCol = collection(db, 'players');
        const snapshot = await getDocs(playersCol);
        if (snapshot.empty) return { success: true, message: 'База уже пуста.' };
        
        const batch = writeBatch(db);
        for (const doc of snapshot.docs) {
            batch.delete(doc.ref);
        }
        await batch.commit();
        revalidatePath('/', 'layout');
        revalidatePath('/admin/players');
        revalidateTag('players');
        return { success: true, message: 'Все данные игроков удалены.' };
    } catch (e) {
        return { success: false, message: 'Ошибка очистки.' };
    }
}

export async function clearAnalyticsAction() {
    try {
        const db = getDb();
        const visitsCol = collection(db, 'visits');
        const clicksCol = collection(db, 'sponsor_clicks');
        
        const [vSnap, cSnap] = await Promise.all([getDocs(visitsCol), getDocs(clicksCol)]);
        
        if (vSnap.empty && cSnap.empty) return { success: true, message: 'Логи уже пусты.' };

        const batch = writeBatch(db);
        vSnap.docs.forEach(doc => batch.delete(doc.ref));
        cSnap.docs.forEach(doc => batch.delete(doc.ref));
        
        await batch.commit();
        revalidatePath('/admin/analytics');
        return { success: true, message: 'Статистика посещений и кликов полностью очищена.' };
    } catch (e) {
        return { success: false, message: 'Ошибка при очистке логов.' };
    }
}

export async function clearPartnersAction() {
    try {
        const db = getDb();
        const partnersCol = collection(db, 'partners');
        const snapshot = await getDocs(partnersCol);
        
        if (snapshot.empty) return { success: true, message: 'Список партнеров уже пуст.' };

        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        await batch.commit();
        revalidatePath('/admin/partners');
        revalidatePath('/partners');
        return { success: true, message: 'Все партнеры удалены из базы.' };
    } catch (e) {
        return { success: false, message: 'Ошибка при очистке партнеров.' };
    }
}

export async function exportAllRankingsAction() {
    try {
        const rankings = await getRankings('general');
        if (!rankings || rankings.length === 0) return { success: false, message: 'Нет данных для экспорта.' };

        const headers = ['Место', 'Игрок', 'Никнейм', 'Очки (Всего)', 'Основные', 'Бонусы', 'Матчи', 'Победы', 'AVG', 'Hi-Out'];
        const csvRows = rankings.map(p => [
            p.rank,
            p.name,
            p.nickname,
            p.points,
            p.basePoints,
            p.bonusPoints,
            p.matchesPlayed,
            p.wins,
            p.avg.toFixed(2),
            p.hiOut
        ].join(','));

        const csv = [headers.join(','), ...csvRows].join('\n');
        return { success: true, csv };
    } catch (e) {
        return { success: false, message: 'Ошибка экспорта.' };
    }
}
