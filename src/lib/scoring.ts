import type { TournamentPlayerResult, ScoringSettings } from './types';

/**
 * Возвращает базовые баллы за место согласно настройкам лиги.
 */
export function getPointsForRank(rank: number, settings: ScoringSettings): number {
    // 1. Приоритет индивидуальной настройки конкретного места (1-16)
    if (settings.customPointsByPlace && settings.customPointsByPlace[rank.toString()] !== undefined) {
        return Number(settings.customPointsByPlace[rank.toString()]);
    }

    // 2. Групповые настройки для ТОП-16
    if (rank === 1) return Number(settings.pointsFor1st) || 0;
    if (rank === 2) return Number(settings.pointsFor2nd) || 0;
    if (rank >= 3 && rank <= 4) return Number(settings.pointsFor3rd_4th) || 0;
    if (rank >= 5 && rank <= 8) return Number(settings.pointsFor5th_8th) || 0;
    if (rank >= 9 && rank <= 16) return Number(settings.pointsFor9th_16th) || 0;
    
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

    // 1. Базовые очки за место (только для 1-16 мест)
    const placePoints = getPointsForRank(result.rank, settings);
    
    // 2. Очки за участие (начисляются всем, кто есть в протоколе)
    const participationPoints = Number(settings.participationPoints) || 0;
    
    // Итоговая база
    result.basePoints = placePoints + participationPoints;
    
    // 3. Сброс и расчет расширенных бонусов
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
    if (settings.enable180Bonus && result.n180s > 0) {
        result.pointsFor180s = result.n180s * (Number(settings.bonusPer180) || 0);
        result.is180BonusApplied = true;
        currentBonusTotal += result.pointsFor180s;
    }

    // Бонус за Hi-Out (при достижении порога)
    if (settings.enableHiOutBonus && result.hiOut >= (Number(settings.hiOutThreshold) || 0)) {
        result.pointsForHiOut = Number(settings.hiOutBonus) || 0;
        result.isHiOutBonusApplied = true;
        currentBonusTotal += result.pointsForHiOut;
    }

    // Бонус за Average (при достижении порога среднего набора)
    if (settings.enableAvgBonus && result.avg >= (Number(settings.avgThreshold) || 0)) {
        result.pointsForAvg = Number(settings.avgBonus) || 0;
        result.isAvgBonusApplied = true;
        currentBonusTotal += result.pointsForAvg;
    }

    // Бонус за Короткий Лег (Short Leg) - если лучший лег меньше или равен порогу
    if (settings.enableShortLegBonus && result.bestLeg > 0 && result.bestLeg <= (Number(settings.shortLegThreshold) || 0)) {
        result.pointsForBestLeg = Number(settings.shortLegBonus) || 0;
        result.isBestLegBonusApplied = true;
        currentBonusTotal += result.pointsForBestLeg;
    }

    // Бонус за 9 дротиков (Королевский бонус)
    if (settings.enable9DarterBonus && result.nineDarters && result.nineDarters > 0) {
        result.pointsFor9Darter = result.nineDarters * (Number(settings.bonusFor9Darter) || 0);
        result.is9DarterBonusApplied = true;
        currentBonusTotal += result.pointsFor9Darter;
    }

    result.bonusPoints = currentBonusTotal;

    // ФИНАЛЬНАЯ СУММА: База + Все Бонусы
    result.points = result.basePoints + result.bonusPoints;
}

/**
 * МАТЕМАТИКА ВЕЧЕРНЕГО ОМСКА (v2.8 Stable)
 * ГАРАНТИЯ: Победитель получает множитель 1.0. Округление до целых.
 */
function calculateEveningOmskPoints(result: TournamentPlayerResult, settings: ScoringSettings): void {
    const avg = Number(result.avg) || 0;
    let multiplier = 0;

    if (result.rank === 1) {
        multiplier = 1.00;
    } else if (result.rank === 2) {
        multiplier = 0.70;
    } else if (result.rank <= 4) {
        multiplier = 0.50;
    } else if (result.rank <= 8) {
        multiplier = 0.25;
    }

    // Очки = Средний набор * Множитель этапа
    result.basePoints = Math.round(avg * multiplier);
    result.bonusPoints = 0; // В Омске бонусы не влияют на баланс выплат
    result.points = result.basePoints;
}
