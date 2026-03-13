import type { TournamentPlayerResult, ScoringSettings } from './types';

/**
 * Возвращает базовые баллы за место согласно настройкам лиги.
 */
export function getPointsForRank(rank: number, settings: ScoringSettings): number {
    // 1. Приоритет индивидуальной настройки конкретного места
    if (settings.customPointsByPlace && settings.customPointsByPlace[rank.toString()] !== undefined) {
        return Number(settings.customPointsByPlace[rank.toString()]);
    }

    // 2. Групповые настройки для ТОП-16
    if (rank === 1) return settings.pointsFor1st;
    if (rank === 2) return settings.pointsFor2nd;
    if (rank >= 3 && rank <= 4) return settings.pointsFor3rd_4th;
    if (rank >= 5 && rank <= 8) return settings.pointsFor5th_8th;
    if (rank >= 9 && rank <= 16) return settings.pointsFor9th_16th;
    
    return 0;
}

/**
 * Рассчитывает итоговые баллы игрока за турнир (база + бонусы).
 */
export function calculatePlayerPoints(result: TournamentPlayerResult, settings: ScoringSettings): void {
    // Уникальная логика для лиги Вечерний Омск (множители)
    if (settings.isEveningOmsk) {
        return calculateEveningOmskPoints(result, settings);
    }

    // 1. Базовые очки за место (ТОП-16)
    const placePoints = getPointsForRank(result.rank, settings);
    
    // 2. Очки за участие (всем)
    const participationPoints = settings.participationPoints || 0;
    
    result.basePoints = placePoints + participationPoints;
    
    // 3. Сброс и расчет расширенных бонусов
    result.bonusPoints = 0;
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

    // Бонус за 180 (за каждый)
    if (settings.enable180Bonus && result.n180s > 0) {
        result.pointsFor180s = result.n180s * settings.bonusPer180;
        result.is180BonusApplied = true;
        result.bonusPoints += result.pointsFor180s;
    }

    // Бонус за Hi-Out (порог)
    if (settings.enableHiOutBonus && result.hiOut >= settings.hiOutThreshold) {
        result.pointsForHiOut = settings.hiOutBonus;
        result.isHiOutBonusApplied = true;
        result.bonusPoints += result.pointsForHiOut;
    }

    // Бонус за Average (порог)
    if (settings.enableAvgBonus && result.avg >= settings.avgThreshold) {
        result.pointsForAvg = settings.avgBonus;
        result.isAvgBonusApplied = true;
        result.bonusPoints += result.pointsForAvg;
    }

    // Бонус за Короткий Лег (Short Leg)
    if (settings.enableShortLegBonus && result.bestLeg > 0 && result.bestLeg <= settings.shortLegThreshold) {
        result.pointsForBestLeg = settings.shortLegBonus;
        result.isBestLegBonusApplied = true;
        result.bonusPoints += result.pointsForBestLeg;
    }

    // Бонус за 9 дротиков
    if (settings.enable9DarterBonus && result.nineDarters && result.nineDarters > 0) {
        result.pointsFor9Darter = result.nineDarters * settings.bonusFor9Darter;
        result.is9DarterBonusApplied = true;
        result.bonusPoints += result.pointsFor9Darter;
    }

    // Итоговая сумма за турнир
    result.points = (result.basePoints || 0) + (result.bonusPoints || 0);
}

/**
 * МАТЕМАТИКА ВЕЧЕРНЕГО ОМСКА
 */
function calculateEveningOmskPoints(result: TournamentPlayerResult, settings: ScoringSettings): void {
    const avg = result.avg || 0;
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

    result.basePoints = Math.round(avg * multiplier);
    result.bonusPoints = 0; 
    result.points = result.basePoints;
}
