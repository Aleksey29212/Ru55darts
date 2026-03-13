import type { TournamentPlayerResult, ScoringSettings } from './types';

export function getPointsForRank(rank: number, settings: ScoringSettings): number {
    if (rank === 1) return settings.pointsFor1st;
    if (rank === 2) return settings.pointsFor2nd;
    if (rank >= 3 && rank <= 4) return settings.pointsFor3rd_4th;
    if (rank >= 5 && rank <= 8) return settings.pointsFor5th_8th;
    if (rank >= 9 && rank <= 16) return settings.pointsFor9th_16th;
    return settings.participationPoints;
}

export function calculatePlayerPoints(result: TournamentPlayerResult, settings: ScoringSettings): void {
    // Unique logic for Evening Omsk league
    if (settings.isEveningOmsk) {
        return calculateEveningOmskPoints(result, settings);
    }

    result.basePoints = getPointsForRank(result.rank, settings);
    
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

    // Bonus for each 180 thrown
    if (settings.enable180Bonus && result.n180s > 0) {
        result.pointsFor180s = result.n180s * settings.bonusPer180;
        result.is180BonusApplied = true;
        result.bonusPoints += result.pointsFor180s;
    }
    // Bonus if Hi-Out meets or exceeds the threshold
    if (settings.enableHiOutBonus && result.hiOut >= settings.hiOutThreshold) {
        result.pointsForHiOut = settings.hiOutBonus;
        result.isHiOutBonusApplied = true;
        result.bonusPoints += result.pointsForHiOut;
    }
    // Bonus if AVG meets or exceeds the threshold
    if (settings.enableAvgBonus && result.avg >= settings.avgThreshold) {
        result.pointsForAvg = settings.avgBonus;
        result.isAvgBonusApplied = true;
        result.bonusPoints += result.pointsForAvg;
    }
    // Bonus if best leg is less than or equal to the threshold (and > 0)
    if (settings.enableShortLegBonus && result.bestLeg > 0 && result.bestLeg <= settings.shortLegThreshold) {
        result.pointsForBestLeg = settings.shortLegBonus;
        result.isBestLegBonusApplied = true;
        result.bonusPoints += result.pointsForBestLeg;
    }
    
    if (settings.enable9DarterBonus && result.nineDarters && result.nineDarters > 0) {
        result.pointsFor9Darter = result.nineDarters * settings.bonusFor9Darter;
        result.is9DarterBonusApplied = true;
        result.bonusPoints += result.pointsFor9Darter;
    }

    result.points = result.basePoints + result.bonusPoints;
}

/**
 * Исправленная математика "Вечернего Омска":
 * Используются абсолютные множители за стадию, а не накопительные.
 */
function calculateEveningOmskPoints(result: TournamentPlayerResult, settings: ScoringSettings): void {
    const avg = result.avg || 0;
    let multiplier = 0;

    // Определение множителя по наивысшему достижению в туре
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
    
    // Сброс флагов бонусов (в этой лиге они не предусмотрены)
    result.is180BonusApplied = false;
    result.isHiOutBonusApplied = false;
    result.isAvgBonusApplied = false;
    result.isBestLegBonusApplied = false;
    result.is9DarterBonusApplied = false;
}
