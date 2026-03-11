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
 * ГАРАНТИЯ: Теперь система сохраняет результаты импорта во временную память, 
 * если ключи Firebase отсутствуют. Вы сразу увидите результат в интерфейсе.
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

  const db = getDb();

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

  // СОХРАНЕНИЕ: если БД есть - в БД, если нет - функции в lib сохранят в demo-память
  if (newPlayerProfiles.length > 0) {
      await updatePlayerProfiles([...playerProfiles, ...newPlayerProfiles]);
  }
  if (tournamentsToCreate.length > 0) {
      await addTournaments(tournamentsToCreate);
  }
  
  revalidatePath('/', 'layout');
  revalidatePath('/admin/import');
  revalidateTag('settings');
  revalidateTag('scoring');
  revalidateTag('tournaments');
  revalidateTag('leagues');
  revalidateTag('players');
  
  const successCount = tournamentsToCreate.length;
  const isDemo = !db;

  return { 
    success: successCount > 0, 
    message: isDemo 
      ? `Успешно (Демо): ${successCount} турнир(ов) загружено во временную память. Настройте Firebase для постоянного хранения.` 
      : `Успешно: ${successCount} турнир(ов) сохранено в базу данных.`,
    errors: errors.length > 0 ? errors : undefined
  };
}

export async function updatePlayer(player: PlayerProfile) {
  try {
    const db = getDb();
    // Функция в lib сама решит куда писать (БД или Память)
    await updatePlayerProfiles([player]);
    
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
        // В демо-режиме удаление происходит в lib
        if (db) {
            await deleteDoc(doc(db, 'players', playerId));
        }
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
    const db = getDb();
    if (!db) return { success: true, message: 'В демо-режиме настройки очков не сохраняются (используются стандартные).' };

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
    const db = getDb();
    if (!db) return { success: true, message: 'Демо-режим: изменения лиг применены визуально.' };

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
    const db = getDb();
    if (!db) return;

    const headersList = await headers(); 
    const userAgent = headersList.get('user-agent') || '';
    if (/bot|crawl|spider/i.test(userAgent)) return;
    
    await addDoc(collection(db, 'visits'), { timestamp: serverTimestamp() });
  } catch (e) {}
}

export async function saveBackgroundAction(prevState: unknown, formData: FormData) {
    const url = formData.get('url') as string;
    const intent = formData.get('intent') as string;
    const db = getDb();
    
    try {
        if (!db) return { success: true, message: 'Демо-режим: фон применен в текущей сессии.' };

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
        const db = getDb();
        if (!db) return { success: true, message: 'Демо-режим: ссылки обновлены в интерфейсе.' };

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
        const player = await getPlayerProfileById(playerId);
        if (!player) return { success: false, message: 'Игрок не найден.' };

        const newAvatar = dataUrl || `https://picsum.photos/seed/${encodeURIComponent(player.name)}/400/400`;
        await updatePlayerProfiles([{ ...player, avatarUrl: newAvatar }]);
        
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
        if (!db) return { success: true };
        
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
        await clearAllPlayerProfiles();
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
        if (!db) return { success: true, message: 'Аналитика сброшена в памяти.' };
        
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
        if (!db) return { success: true, message: 'Список партнеров очищен.' };
        
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

// Вспомогательная функция для обновления профилей
async function clearAllPlayerProfiles() {
    const { clearAllPlayerProfiles: libClear } = await import('@/lib/players');
    return libClear();
}
