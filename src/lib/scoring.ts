import type { TournamentPlayerResult, ScoringSettings } from './types';

/**
 * Возвращает базовые баллы за место согласно настройкам лиги.
 * ГАРАНТИЯ: Иерархия приоритетов (Custom -> Specific 1-10 -> Group fallback).
 */
export function getPointsForRank(rank: number, settings: ScoringSettings): number {
    const r = Number(rank);
    
    // 1. Приоритет индивидуальной настройки конкретного места (через customPoints)
    if (settings.customPointsByPlace && settings.customPointsByPlace[r.toString()] !== undefined) {
        return Number(settings.customPointsByPlace[r.toString()]);
    }

    // 2. Индивидуальные настройки 1-10 мест (высокий приоритет)
    if (r === 1) return Number(settings.pointsFor1st) || 0;
    if (r === 2) return Number(settings.pointsFor2nd) || 0;
    
    // 3 место имеет приоритет над группой 3-4
    if (r === 3 && (settings.pointsFor3rd ?? 0) > 0) return Number(settings.pointsFor3rd);
    if (r === 3 || r === 4) return Number(settings.pointsFor3rd_4th) || 0;

    // Места 5-10 проверяются индивидуально перед групповым fallback
    if (r === 5 && (settings.pointsFor5th ?? 0) > 0) return Number(settings.pointsFor5th);
    if (r === 6 && (settings.pointsFor6th ?? 0) > 0) return Number(settings.pointsFor6th);
    if (r === 7 && (settings.pointsFor7th ?? 0) > 0) return Number(settings.pointsFor7th);
    if (r === 8 && (settings.pointsFor8th ?? 0) > 0) return Number(settings.pointsFor8th);
    if (r === 9 && (settings.pointsFor9th ?? 0) > 0) return Number(settings.pointsFor9th);
    if (r === 10 && (settings.pointsFor10th ?? 0) > 0) return Number(settings.pointsFor10th);

    // 3. Групповые настройки для ТОП-16 (fallback)
    if (r >= 5 && r <= 8) return Number(settings.pointsFor5th_8th) || 0;
    if (r >= 9 && r <= 16) return Number(settings.pointsFor9th_16th) || 0;
    
    return 0;
}

/**
 * Рассчитывает итоговые баллы игрока за турнир (база + бонусы).
 * ГАРАНТИЯ: Математическая точность суммирования и округления.
 */
export function calculatePlayerPoints(result: TournamentPlayerResult, settings: ScoringSettings): void {
    // Уникальная логика для лиги Вечерний Омск (множители)
    if (settings.isEveningOmsk) {
        return calculateEveningOmskPoints(result, settings);
    }

    // 1. Сброс текущих баллов перед расчетом (важно для пересчета)
    result.points = 0;
    result.basePoints = 0;
    result.bonusPoints = 0;

    // 2. Базовые очки за место (с учетом индивидуальных приоритетов 1-10)
    const placePoints = getPointsForRank(result.rank, settings);
    
    // 3. Очки за участие (начисляются всем, кто есть в протоколе)
    const participationPoints = Number(settings.participationPoints) || 0;
    
    // Итоговая база
    result.basePoints = Number(placePoints) + Number(participationPoints);
    
    // 4. Расчет расширенных бонусов
    let currentBonusTotal = 0;
    
    result.pointsFor180s = 0;
    result.is180BonusApplied = false;
    result.pointsForHiOut = 0;
    result.isHiOutBonusApplied = false;
    result.pointsForAvg = 0;
    result.isAvgBonusApplied = false;
    result.pointsForBestLeg = 0;
    result.isBestLegBonusApplied = false;
    result.pointsFor9Darter = 0;
    result.is9DarterBonusApplied = false;

    // Бонус за 180 (за каждый совершенный максимум)
    if (settings.enable180Bonus && Number(result.n180s) > 0) {
        result.pointsFor180s = Number(result.n180s) * (Number(settings.bonusPer180) || 0);
        result.is180BonusApplied = true;
        currentBonusTotal += result.pointsFor180s;
    }

    // Бонус за Hi-Out (при достижении порога)
    if (settings.enableHiOutBonus && Number(result.hiOut) >= (Number(settings.hiOutThreshold) || 0)) {
        result.pointsForHiOut = Number(settings.hiOutBonus) || 0;
        result.isHiOutBonusApplied = true;
        currentBonusTotal += result.pointsForHiOut;
    }

    // Бонус за Average (при достижении порога среднего набора)
    if (settings.enableAvgBonus && Number(result.avg) >= (Number(settings.avgThreshold) || 0)) {
        result.pointsForAvg = Number(settings.avgBonus) || 0;
        result.isAvgBonusApplied = true;
        currentBonusTotal += result.pointsForAvg;
    }

    // Бонус за Короткий Лег (Short Leg)
    if (settings.enableShortLegBonus && Number(result.bestLeg) > 0 && Number(result.bestLeg) <= (Number(settings.shortLegThreshold) || 0)) {
        result.pointsForBestLeg = Number(settings.shortLegBonus) || 0;
        result.isBestLegBonusApplied = true;
        currentBonusTotal += result.pointsForBestLeg;
    }

    // Бонус за 9 дротиков (Королевский бонус)
    if (settings.enable9DarterBonus && Number(result.nineDarters) > 0) {
        result.pointsFor9Darter = Number(result.nineDarters) * (Number(settings.bonusFor9Darter) || 0);
        result.is9DarterBonusApplied = true;
        currentBonusTotal += result.pointsFor9Darter;
    }

    result.bonusPoints = currentBonusTotal;

    // ФИНАЛЬНАЯ СУММА: База + Все Бонусы (Гарантия числового типа)
    result.points = Number(result.basePoints) + Number(result.bonusPoints);
}

/**
 * МАТЕМАТИКА ВЕЧЕРНЕГО ОМСКА (v2.8 Stable)
 * ГАРАНТИЯ: Победитель получает множитель 1.0. Округление до целых.
 */
function calculateEveningOmskPoints(result: TournamentPlayerResult, settings: ScoringSettings): void {
    const avg = Number(result.avg) || 0;
    const r = Number(result.rank);
    let multiplier = 0;

    if (r === 1) {
        multiplier = 1.00;
    } else if (r === 2) {
        multiplier = 0.70;
    } else if (r <= 4) {
        multiplier = 0.50;
    } else if (r <= 8) {
        multiplier = 0.25;
    }

    // Очки = Средний набор * Множитель этапа
    result.basePoints = Math.round(avg * multiplier);
    result.bonusPoints = 0; 
    result.points = result.basePoints;
}
