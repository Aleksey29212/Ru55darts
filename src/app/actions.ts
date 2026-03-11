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
 * ГАРАНТИЯ: Все экшены асинхронны, используют Safe DB Check и мгновенно обновляют UI.
 */

export async function importTournament(prevState: unknown, formData: FormData) {
  const tournamentIdsRaw = formData.get('tournamentId');
  const league = formData.get('league') as LeagueId;

  if (!tournamentIdsRaw || typeof tournamentIdsRaw !== 'string' || !league) {
    return { success: false, message: 'Некорректный ввод.' };
  }

  const db = getDb();
  if (!db) return { success: false, message: 'Система не настроена. Проверьте ключи Firebase.' };

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
        errors.push(`${input}: Турнир уже загружен.`);
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
      : `Ошибка импорта.`,
    errors: errors.length > 0 ? errors : undefined
  };
}

export async function updatePlayer(player: PlayerProfile) {
  try {
    const db = getDb();
    if (!db) return { success: false, message: 'База данных недоступна.' };
    
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
        if (!db) return { success: false, message: 'База данных недоступна.' };
        
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
  try {
    await updateScoringSettings(leagueId, data);
    revalidateTag('scoring');
    revalidateTag('settings');
    revalidateTag('leagues');
    revalidatePath('/', 'layout');
    return { success: true, message: `Настройки сохранены.` };
  } catch (e) {
    return { success: false, message: 'Ошибка сохранения.' };
  }
}

export async function saveLeagueSettings(data: AllLeagueSettings) {
  try {
    await updateLeagueSettings(data);
    revalidateTag('leagues');
    revalidateTag('settings');
    revalidateTag('scoring');
    revalidateTag('tournaments');
    revalidatePath('/', 'layout');
    revalidatePath('/admin/leagues');
    return { success: true, message: `Настройки лиг обновлены.` };
  } catch (e) {
    return { success: false, message: 'Ошибка сохранения лиг.' };
  }
}

export async function deleteTournamentAction(tournamentId: string) {
    try {
        await deleteTournamentById(tournamentId);
        revalidateTag('tournaments');
        revalidateTag('leagues');
        revalidatePath('/', 'layout');
        revalidatePath('/admin/tournaments');
        return { success: true, message: `Турнир удален.` };
    } catch (e) {
        return { success: false, message: 'Ошибка удаления турнира.' };
    }
}

export async function clearTournamentsAction() {
    try {
        await clearAllTournamentData();
        revalidatePath('/', 'layout');
        revalidatePath('/admin/tournaments');
        revalidateTag('tournaments');
        revalidateTag('leagues');
        return { success: true, message: 'Архив очищен.' };
    } catch (e) {
        return { success: false, message: 'Ошибка очистки архива.' };
    }
}

export async function logVisitAction() {
  try {
    const headersList = await headers(); 
    const userAgent = headersList.get('user-agent') || '';
    if (/bot|crawl|spider/i.test(userAgent)) return;
    
    const db = getDb();
    if (!db) return;
    
    await addDoc(collection(db, 'visits'), { timestamp: serverTimestamp() });
  } catch (e) {}
}

export async function saveBackgroundAction(prevState: unknown, formData: FormData) {
    const url = formData.get('url') as string;
    const intent = formData.get('intent') as string;
    
    try {
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
        return { success: true, message: 'Фон обновлен.' };
    } catch (e) {
        return { success: false, message: 'Ошибка сохранения фона.' };
    }
}

export async function saveSponsorshipAction(settings: SponsorshipSettings) {
    try {
        await updateSponsorshipSettings(settings);
        revalidateTag('sponsorship');
        revalidateTag('settings');
        revalidatePath('/', 'layout');
        return { success: true, message: 'Настройки спонсорства обновлены.' };
    } catch (e) {
        return { success: false, message: 'Ошибка сохранения спонсорства.' };
    }
}

export async function updatePlayerAvatar(playerId: string, dataUrl: string | null) {
    try {
        const db = getDb();
        if (!db) return { success: false, message: 'База недоступна.' };
        
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
        return { success: true, message: 'Фото обновлено.' };
    } catch (e) {
        return { success: false, message: 'Ошибка фотостудии.' };
    }
}

export async function logSponsorClickAction(playerId: string, sponsorName: string) {
    try {
        const db = getDb();
        if (!db) return { success: false };
        
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
        if (!db) return { success: false, message: 'База недоступна.' };
        
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
        if (!db) return { success: false, message: 'База недоступна.' };
        
        const visitsCol = collection(db, 'visits');
        const clicksCol = collection(db, 'sponsor_clicks');
        
        const [vSnap, cSnap] = await Promise.all([getDocs(visitsCol), getDocs(clicksCol)]);
        
        if (vSnap.empty && cSnap.empty) return { success: true, message: 'Логи уже пусты.' };

        const batch = writeBatch(db);
        vSnap.docs.forEach(doc => batch.delete(doc.ref));
        cSnap.docs.forEach(doc => batch.delete(doc.ref));
        
        await batch.commit();
        revalidatePath('/admin/analytics');
        return { success: true, message: 'Аналитика очищена.' };
    } catch (e) {
        return { success: false, message: 'Ошибка при очистке.' };
    }
}

export async function clearPartnersAction() {
    try {
        const db = getDb();
        if (!db) return { success: false, message: 'База недоступна.' };
        
        const partnersCol = collection(db, 'partners');
        const snapshot = await getDocs(partnersCol);
        
        if (snapshot.empty) return { success: true, message: 'Список пуст.' };

        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        await batch.commit();
        revalidatePath('/admin/partners');
        revalidatePath('/partners');
        return { success: true, message: 'Партнеры удалены.' };
    } catch (e) {
        return { success: false, message: 'Ошибка при очистке.' };
    }
}

export async function exportAllRankingsAction() {
    try {
        const rankings = await getRankings('general');
        if (!rankings || rankings.length === 0) return { success: false, message: 'Нет данных.' };

        const headers = ['Место', 'Игрок', 'Никнейм', 'Очки', 'AVG'];
        const csvRows = rankings.map(p => [
            p.rank,
            p.name,
            p.nickname,
            p.points,
            p.avg.toFixed(2)
        ].join(','));

        const csv = [headers.join(','), ...csvRows].join('\n');
        return { success: true, csv };
    } catch (e) {
        return { success: false, message: 'Ошибка экспорта.' };
    }
}
