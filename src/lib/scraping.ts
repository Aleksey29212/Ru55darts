import * as cheerio from 'cheerio';
import type { TournamentPlayerResult, ScoringSettings, LeagueId } from './types';
import { calculatePlayerPoints } from './scoring';

/**
 * @fileOverview Модуль парсинга данных с dartsbase.ru
 * ГАРАНТИЯ: Точный поиск Max Out и очистка текстовых пометок в скобках.
 * Версия алгоритма: 4.8 (Master)
 */

export interface ScrapedTournament {
  id: string;
  name: string;
  date: string;
  players: TournamentPlayerResult[];
}

/**
 * Извлекает дату из текстового заголовка турнира.
 * Формат: ДД.ММ.ГГГГ
 */
function parseDateFromText(text: string): Date {
  const dateRegex = /(\d{2})\.(\d{2})\.(\d{4})/;
  const match = text.match(dateRegex);
  if (match) {
    return new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1])));
  }
  return new Date();
}

/**
 * ЭТАЛОННЫЙ АЛГОРИТМ: Извлекает только ПЕРВОЕ число из строки.
 * Решает проблему: "130 (T20, T20, D5)" -> 130 или "180 (x2)" -> 180
 */
const extractNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    const cleanVal = String(val).trim();
    const match = cleanVal.match(/\d+/); // Берем только первое вхождение цифр
    return match ? parseInt(match[0], 10) : 0;
};

/**
 * Очистка дробных чисел (AVG).
 */
const cleanFloat = (val: string): number => {
    if (!val) return 0;
    const parts = String(val).trim().split(/\s+/);
    return parseFloat(parts[0].replace(',', '.')) || 0;
};

export async function scrapeTournamentData(
  input: string, 
  leagueId: LeagueId, 
  scoringSettings: ScoringSettings
): Promise<ScrapedTournament> {
  const isUrl = input.startsWith('http');
  const url = isUrl ? input : `https://dartsbase.ru/tournaments/${input}/stats`;
  const tournamentId = isUrl ? (input.split('/').pop() || 'manual') : input;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36' },
    cache: 'no-store'
  });

  if (!response.ok) throw new Error(`Ошибка загрузки: ${response.statusText}`);
  
  const html = await response.text();
  const $ = cheerio.load(html);

  // 1. Извлечение метаданных (Название и Дата)
  const h1 = $('h1').first();
  const fullTitle = h1.text().trim();
  const tournamentDate = parseDateFromText(fullTitle);
  
  const h1Clone = h1.clone();
  h1Clone.find('span').remove(); // Убираем вложенные элементы для чистоты имени
  let tournamentName = h1Clone.text().trim() || `Турнир #${tournamentId}`;

  // 2. Поиск главной таблицы статистики (Smart Search)
  let table = $('table').first();
  let maxMatchScore = -1;

  $('table').each((_, el) => {
      const headText = $(el).text().toLowerCase();
      const keywords = ['avg', 'игрок', 'место', '180', 'checkout', 'hi-out', 'max out', 'finish'];
      let score = 0;
      keywords.forEach(k => { if (headText.includes(k)) score++; });
      if (score > maxMatchScore) {
          maxMatchScore = score;
          table = $(el);
      }
  });

  // 3. SMART MAPPING: Динамическое определение индексов колонок
  const headerMap: Record<string, number> = {};
  const headerRow = table.find('thead tr').length > 0 ? table.find('thead tr').first() : table.find('tr').first();
  
  headerRow.find('th, td').each((i, el) => {
    const txt = $(el).text().trim().toLowerCase();
    
    // Поиск колонки чекаута (Max Out)
    const isHiOutColumn = [
        'max out', 'max finish', 'max.co', 'hi-out', 'checkout', 'hf', 'finish'
    ].some(k => txt === k || (txt.includes(k) && !txt.includes('%')));

    if (isHiOutColumn && !headerMap['hiout']) {
        headerMap['hiout'] = i;
    }
    else if ((txt.includes('best leg') || txt.includes('short leg') || txt === 'sl') && !headerMap['bestleg']) {
        headerMap['bestleg'] = i;
    }
    else if ((txt.startsWith('#') || txt === 'место' || txt.includes('rank')) && !headerMap['rank']) {
        headerMap['rank'] = i;
    }
    else if ((txt.includes('игрок') || txt.includes('player') || txt.includes('имя')) && !headerMap['player']) {
        headerMap['player'] = i;
    }
    else if ((txt === 'avg' || txt.includes('average')) && !headerMap['avg']) {
        headerMap['avg'] = i;
    }
    else if ((txt === '180' || txt === '180s') && !headerMap['180']) {
        headerMap['180'] = i;
    }
  });

  // 4. Парсинг строк игроков
  const results: TournamentPlayerResult[] = [];
  const rows = table.find('tbody tr').length > 0 ? table.find('tbody tr') : table.find('tr').slice(1);

  rows.each((i, row) => {
    const cols = $(row).find('td');
    if (cols.length < 2) return;

    const getVal = (idx: number | undefined) => (idx !== undefined ? $(cols[idx]).text().trim() : '');
    
    const nameCell = cols.eq(headerMap['player'] ?? 1);
    const playerLink = nameCell.find('a');
    const name = playerLink.text().trim() || nameCell.text().trim();
    if (!name || name.length < 2) return;

    // Формируем ID игрока (из ссылки или slug)
    const pId = playerLink.attr('href')?.split('/').pop() || name.replace(/\s+/g, '-').toLowerCase();
    
    const playerResult: TournamentPlayerResult = {
      id: pId,
      name,
      nickname: 'Новичок',
      rank: extractNumber(getVal(headerMap['rank'])) || 999,
      points: 0,
      basePoints: 0,
      bonusPoints: 0,
      is180BonusApplied: false,
      pointsFor180s: 0,
      isHiOutBonusApplied: false,
      pointsForHiOut: 0,
      isAvgBonusApplied: false,
      pointsForAvg: 0,
      isBestLegBonusApplied: false,
      pointsForBestLeg: 0,
      is9DarterBonusApplied: false,
      pointsFor9Darter: 0,
      avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(name)}/400/400`,
      imageHint: 'person portrait',
      avg: cleanFloat(getVal(headerMap['avg'])),
      n180s: extractNumber(getVal(headerMap['180'])),
      hiOut: extractNumber(getVal(headerMap['hiout'])),
      bestLeg: extractNumber(getVal(headerMap['bestleg'])),
    };

    // Применяем правила начисления баллов выбранной лиги
    calculatePlayerPoints(playerResult, scoringSettings);
    results.push(playerResult);
  });

  return { 
    id: tournamentId, 
    name: tournamentName, 
    date: tournamentDate.toISOString(), 
    players: results 
  };
}