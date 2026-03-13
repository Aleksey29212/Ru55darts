import * as cheerio from 'cheerio';
import type { TournamentPlayerResult, ScoringSettings, LeagueId } from './types';
import { calculatePlayerPoints } from './scoring';

/**
 * @fileOverview Модуль парсинга данных с dartsbase.ru
 * ГАРАНТИЯ: Точное извлечение числовых данных и очистка мусорных символов.
 * Версия алгоритма: 4.9 (Audit Ready)
 */

export interface ScrapedTournament {
  id: string;
  name: string;
  date: string;
  players: TournamentPlayerResult[];
}

/**
 * Извлекает дату из текстового заголовка турнира (ДД.ММ.ГГГГ).
 */
function parseDateFromText(text: string): Date {
  const dateRegex = /(\d{2})\.(\d{2})\.(\d{4})/;
  const match = text.match(dateRegex);
  if (match) {
    // Используем UTC для предотвращения смещения дат из-за часовых поясов
    return new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1])));
  }
  return new Date();
}

/**
 * ГАРАНТИЯ: Извлечение только ПЕРВОГО целого числа из строки.
 */
const extractNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    const cleanVal = String(val).trim();
    // Находим первую последовательность цифр
    const match = cleanVal.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
};

/**
 * ГАРАНТИЯ: Преобразование строки в дробное число (AVG).
 * Поддерживает оба формата десятичного разделителя (65.5 и 65,5).
 */
const cleanFloat = (val: string): number => {
    if (!val) return 0;
    const normalized = String(val).trim().replace(',', '.');
    // Извлекаем только первую часть, если есть пробелы или текст
    const parts = normalized.split(/\s+/);
    const result = parseFloat(parts[0]);
    return isNaN(result) ? 0 : result;
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

  // 1. Метаданные турнира
  const h1 = $('h1').first();
  const fullTitle = h1.text().trim();
  const tournamentDate = parseDateFromText(fullTitle);
  
  const h1Clone = h1.clone();
  h1Clone.find('span').remove();
  let tournamentName = h1Clone.text().trim() || `Турнир #${tournamentId}`;

  // 2. Поиск главной таблицы статистики
  let table = $('table').first();
  let maxMatchScore = -1;

  $('table').each((_, el) => {
      const headText = $(el).text().toLowerCase();
      const keywords = ['avg', 'игрок', 'место', '180', 'checkout', 'hi-out', 'sl', 'leg'];
      let score = 0;
      keywords.forEach(k => { if (headText.includes(k)) score++; });
      if (score > maxMatchScore) {
          maxMatchScore = score;
          table = $(el);
      }
  });

  // 3. Динамический маппинг колонок (Column Mapping)
  const headerMap: Record<string, number> = {};
  const headerRow = table.find('thead tr').length > 0 ? table.find('thead tr').first() : table.find('tr').first();
  
  headerRow.find('th, td').each((i, el) => {
    const txt = $(el).text().trim().toLowerCase();
    
    if (['max out', 'max finish', 'hi-out', 'checkout', 'hf', 'finish'].some(k => txt === k || (txt.includes(k) && !txt.includes('%'))) && !headerMap['hiout']) {
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
    else if ((txt.includes('9') || txt.includes('darter')) && !headerMap['nine']) {
        headerMap['nine'] = i;
    }
  });

  // 4. Извлечение строк игроков
  const results: TournamentPlayerResult[] = [];
  const rows = table.find('tbody tr').length > 0 ? table.find('tbody tr') : table.find('tr').slice(1);

  rows.each((_, row) => {
    const cols = $(row).find('td');
    if (cols.length < 2) return;

    const getVal = (idx: number | undefined) => (idx !== undefined ? $(cols[idx]).text().trim() : '');
    
    const nameCell = cols.eq(headerMap['player'] ?? 1);
    const playerLink = nameCell.find('a');
    const name = playerLink.text().trim() || nameCell.text().trim();
    if (!name || name.length < 2) return;

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
      nineDarters: extractNumber(getVal(headerMap['nine'])),
    };

    // 5. Расчет очков на основе правил лиги
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
