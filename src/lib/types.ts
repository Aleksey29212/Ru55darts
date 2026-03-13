import type { Timestamp } from 'firebase/firestore';

export type TemplateId = 
    | 'classic' 
    | 'modern' 
    | 'dynamic' 
    | 'elite' 
    | 'cyber' 
    | 'retro' 
    | 'impact' 
    | 'minimal' 
    | 'arena' 
    | 'stealth';

export type LeagueId = 'general' | 'premier' | 'first' | 'cricket' | 'second' | 'third' | 'fourth' | 'senior' | 'youth' | 'women' | 'evening_omsk';

export type League = {
  id: LeagueId;
  name: string;
  enabled: boolean;
  includeInGeneralRanking: boolean;
  bannerUrl?: string;
};

export type LeagueSettings = Omit<League, 'id'>;

export type AllLeagueSettings = Record<LeagueId, LeagueSettings>;

export type PlayerSponsor = {
  name: string;
  logoUrl: string;
  linkUrl: string;
  promoCode?: string;
};

export type PlayerProfile = {
  id: string;
  name: string;
  nickname: string;
  avatarUrl: string;
  bio: string;
  imageHint: string;
  backgroundUrl?: string;
  cardTemplateId?: TemplateId;
  backgroundImageHint?: string;
  sponsors?: PlayerSponsor[];
  sponsorshipCallToAction?: string;
  showSponsorshipCallToAction?: boolean;
};

export type AppearanceSettings = {
    globalDefaultTemplate: TemplateId;
    theme?: any;
};

export type Player = PlayerProfile & {
  rank: number;
  points: number;
  basePoints: number;
  bonusPoints: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  avg: number;
  n180s: number;
  hiOut: number;
  bestLeg: number;
  
  // Aggregate bonus info
  totalPointsFor180s: number;
  totalPointsForHiOut: number;
  totalPointsForAvg: number;
  totalPointsForBestLeg: number;
  totalPointsFor9Darter: number;

  // Evening Omsk specific
  cashValue?: number;
  isQualifiedForFinal?: boolean;

  // Context info
  viewContextName?: string;
  isAggregatedView?: boolean;

  // Optional: Detailed bonus info for single-tournament view
  pointsFor180s?: number;
  is180BonusApplied?: boolean;
  pointsForHiOut?: number;
  isHiOutBonusApplied?: boolean;
  pointsForAvg?: number;
  isAvgBonusApplied?: boolean;
  pointsForBestLeg?: number;
  isBestLegBonusApplied?: boolean;
  pointsFor9Darter?: number;
  is9DarterBonusApplied?: boolean;
};


export type TournamentPlayerResult = {
  id: string;
  name: string;
  nickname: string;
  rank: number;
  points: number;
  basePoints: number;
  bonusPoints: number;
  
  // Detailed bonus info
  pointsFor180s: number;
  is180BonusApplied: boolean;
  pointsForHiOut: number;
  isHiOutBonusApplied: boolean;
  pointsForAvg: number;
  isAvgBonusApplied: boolean;
  pointsForBestLeg: number;
  isBestLegBonusApplied: boolean;
  pointsFor9Darter: number;
  is9DarterBonusApplied: boolean;

  avatarUrl: string;
  imageHint: string;
  avg: number;
  n180s: number;
  hiOut: number;
  bestLeg: number;
  nineDarters?: number;
};

export type Tournament = {
  id: string;
  name: string;
  date: Timestamp | string; 
  league: LeagueId;
  players: TournamentPlayerResult[];
  isFinalTour?: boolean;
  isManuallyEdited?: boolean;
};

export type ScoringSettings = {
  id?: LeagueId;
  pointsFor1st: number;
  pointsFor2nd: number;
  pointsFor3rd: number;
  pointsFor3rd_4th: number;
  
  // New specific place fields
  pointsFor5th?: number;
  pointsFor6th?: number;
  pointsFor7th?: number;
  pointsFor8th?: number;
  pointsFor9th?: number;
  pointsFor10th?: number;

  pointsFor5th_8th: number;
  pointsFor9th_16th: number;
  participationPoints: number;

  enable180Bonus: boolean;
  bonusPer180: number;

  enableHiOutBonus: boolean;
  hiOutThreshold: number;
  hiOutBonus: number;
  
  enableAvgBonus: boolean;
  avgThreshold: number;
  avgBonus: number;

  enableShortLegBonus: boolean;
  shortLegThreshold: number;
  shortLegBonus: number;

  enable9DarterBonus: boolean;
  bonusFor9Darter: number;

  // Evening Omsk specific
  exchangeRate?: number; // RUB per 1 point
  isEveningOmsk?: boolean;

  // Custom points per specific place
  customPointsByPlace?: Record<string, number>;
};


export type PlayerTournamentHistory = {
  playerId: string;
  tournamentId: string;
  tournamentName: string;
  tournamentDate: Timestamp | string;
  playerRank: number;
  playerPoints: number;
  leagueName: string;
};

export type PartnerCategory = 'shop' | 'platform' | 'media' | 'other';

export type Partner = {
  id: string;
  name: string;
  logoUrl: string;
  category: PartnerCategory;
  linkUrl?: string;
  promoCode?: string;
};

export type SponsorTemplateId = 'default' | 'banner' | 'minimal' | 'card' | 'integrated';

export type SponsorshipSettings = {
    adminTelegramLink: string;
    groupTelegramLink: string;
    adminVkLink: string;
    groupVkLink: string;
    showSponsorsInProfile?: boolean;
    showSponsorshipCallToAction?: boolean;
    sponsorTemplate?: SponsorTemplateId;
    callToActionSlogans?: string[];
};
