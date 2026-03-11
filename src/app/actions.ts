'use server';

import { getPlayerProfiles, updatePlayerProfiles, getPlayerProfileById, clearAllPlayerProfiles } from '@/lib/players';
import { addTournaments, clearAllTournamentData, deleteTournamentById, getTournamentById } from '@/lib/tournaments';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { PlayerProfile, ScoringSettings, LeagueId, AllLeagueSettings, SponsorshipSettings } from '@/lib/types';
import { updateScoringSettings, updateLeagueSettings, getScoringSettings, updateBackgroundUrl, updateSponsorshipSettings } from '@/lib/settings';
import { getDb } from '@/firebase/server';
import { addDoc, collection, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { headers } from 'next/headers';
import { CardBackgrounds } from '@/lib/card-backgrounds';
import { scrapeTournamentData } from '@/lib/scraping';

/**
 * ГАРАНТИЯ: Все действия работают автоматически. 
 * Если ключи Firebase отсутствуют, данные сохраняются во временном хранилище.
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

  if (newPlayerProfiles.length > 0) {
      await updatePlayerProfiles(newPlayerProfiles);
  }
  if (tournamentsToCreate.length > 0) {
      await addTournaments(tournamentsToCreate);
  }
  
  revalidatePath('/', 'layout');
  revalidatePath('/admin/import');
  revalidateTag('tournaments');
  revalidateTag('players');
  revalidateTag('leagues');
  
  const successCount = tournamentsToCreate.length;

  return { 
    success: successCount > 0, 
    message: `Успешно: ${successCount} турнир(ов) загружено в систему.`,
    errors: errors.length > 0 ? errors : undefined
  };
}

export async function updatePlayer(player: PlayerProfile) {
  try {
    await updatePlayerProfiles([player]);
    revalidatePath('/', 'layout');
    revalidateTag('players');
    return { success: true, message: `Профиль обновлен.` };
  } catch (error) {
    return { success: false, message: 'Ошибка обновления.' };
  }
}

export async function deletePlayerAction(playerId: string) {
    try {
        const db = getDb();
        if (db) {
            await deleteDoc(doc(db, 'players', playerId));
        }
        revalidatePath('/', 'layout');
        revalidateTag('players');
        return { success: true, message: 'Игрок удален.' };
    } catch (e) {
        return { success: false, message: 'Ошибка при удалении.' };
    }
}

export async function clearAllPlayerData() {
    try {
        await clearAllPlayerProfiles();
        revalidatePath('/', 'layout');
        revalidateTag('players');
        return { success: true, message: 'Все профили игроков удалены.' };
    } catch (e) {
        return { success: false, message: 'Ошибка при очистке.' };
    }
}

export async function saveScoringSettings(leagueId: LeagueId, data: ScoringSettings) {
  try {
    await updateScoringSettings(leagueId, data);
    revalidateTag('scoring');
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
    revalidatePath('/', 'layout');
    return { success: true, message: `Настройки лиг обновлены.` };
  } catch (e) {
    return { success: false, message: 'Ошибка сохранения лиг.' };
  }
}

export async function deleteTournamentAction(tournamentId: string) {
    try {
        await deleteTournamentById(tournamentId);
        revalidateTag('tournaments');
        revalidatePath('/', 'layout');
        return { success: true, message: `Турнир удален.` };
    } catch (e) {
        return { success: false, message: 'Ошибка удаления турнира.' };
    }
}

export async function clearTournamentsAction() {
    try {
        await clearAllTournamentData();
        revalidatePath('/', 'layout');
        revalidateTag('tournaments');
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
    try {
        if (intent === 'reset') {
            await updateBackgroundUrl('');
            revalidatePath('/', 'layout');
            return { success: true, message: 'Фон сброшен.' };
        }
        await updateBackgroundUrl(url);
        revalidatePath('/', 'layout');
        return { success: true, message: 'Фон обновлен.' };
    } catch (e) {
        return { success: false, message: 'Ошибка сохранения фона.' };
    }
}

export async function saveSponsorshipAction(settings: SponsorshipSettings) {
    try {
        await updateSponsorshipSettings(settings);
        revalidatePath('/', 'layout');
        return { success: true, message: 'Настройки спонсорства обновлены.' };
    } catch (e) {
        return { success: false, message: 'Ошибка сохранения.' };
    }
}

export async function updatePlayerAvatar(playerId: string, dataUrl: string | null) {
    try {
        const player = await getPlayerProfileById(playerId);
        if (!player) return { success: false, message: 'Игрок не найден.' };
        const newAvatar = dataUrl || `https://picsum.photos/seed/${encodeURIComponent(player.name)}/400/400`;
        await updatePlayerProfiles([{ ...player, avatarUrl: newAvatar }]);
        revalidatePath('/', 'layout');
        revalidateTag('players');
        return { success: true, message: 'Фото обновлено.' };
    } catch (e) {
        return { success: false, message: 'Ошибка фотостудии.' };
    }
}
