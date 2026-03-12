import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { ScoringSettings, AllLeagueSettings, LeagueId, SponsorshipSettings, AppearanceSettings, TemplateId } from './types';
import { cache } from 'react';
import defaultScoringSettingsData from './scoring-settings.json';
import defaultLeagueSettingsData from './league-settings.json';
import { sanitizeFirestore } from './utils';

/**
 * ГАРАНТИЯ: Глобальное хранилище настроек для работы БЕЗ КЛЮЧЕЙ.
 * Данные сохраняются в глобальном объекте Node.js для персистентности между запросами.
 */
if (!(global as any).memoScoringSettings) (global as any).memoScoringSettings = {};
if (!(global as any).memoLeagueSettings) (global as any).memoLeagueSettings = null;
if (!(global as any).memoSponsorshipSettings) (global as any).memoSponsorshipSettings = null;
if (!(global as any).memoBackgroundUrl) (global as any).memoBackgroundUrl = '';
if (!(global as any).memoAppearance) (global as any).memoAppearance = null;

export const getAllScoringSettings = cache(
  async (): Promise<Record<LeagueId, ScoringSettings>> => {
    const allDefaults: Record<LeagueId, ScoringSettings> = defaultScoringSettingsData as any;
    const db = getDb();
    
    // Сначала берем данные из памяти
    let fromDb: Partial<Record<LeagueId, ScoringSettings>> = { ...(global as any).memoScoringSettings };

    if (db) {
        try {
            const settingsCol = collection(db, 'scoring_configurations');
            const snapshot = await getDocs(settingsCol);
            snapshot.docs.forEach(doc => {
                const data = sanitizeFirestore({ ...doc.data(), id: doc.id }) as ScoringSettings;
                fromDb[doc.id as LeagueId] = data;
                (global as any).memoScoringSettings[doc.id as LeagueId] = data;
            });
        } catch (e) {
            console.warn("DB fetch error, using memory/defaults");
        }
    }

    const merged: any = {};
    (Object.keys(allDefaults) as LeagueId[]).forEach(key => {
        merged[key] = { ...allDefaults[key], ...(fromDb[key] || {}) };
    });
    return merged;
  }
);

export const getScoringSettings = cache(
  async (leagueId: LeagueId): Promise<ScoringSettings> => {
    const all = await getAllScoringSettings();
    return all[leagueId] || all.general;
  }
);

export async function updateScoringSettings(leagueId: LeagueId, settings: ScoringSettings): Promise<void> {
  // Сохраняем в глобальную память (для демо-режима)
  (global as any).memoScoringSettings[leagueId] = settings;
  
  const db = getDb();
  if (!db) return;
  try {
      const docRef = doc(db, 'scoring_configurations', leagueId);
      const dataToSet = { ...settings };
      delete (dataToSet as any).id;
      await setDoc(docRef, dataToSet);
  } catch (e) {}
}

export const getLeagueSettings = cache(
  async (): Promise<AllLeagueSettings> => {
    const defaults: AllLeagueSettings = defaultLeagueSettingsData as any;
    const db = getDb();
    
    // Приоритет: глобальная память, иначе дефолты
    let current = (global as any).memoLeagueSettings || defaults;

    if (db) {
        try {
            const docRef = doc(db, 'app_settings', 'leagues');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const dbSettings = sanitizeFirestore(docSnap.data()) as Partial<AllLeagueSettings>;
                const merged = { ...defaults };
                (Object.keys(defaults) as LeagueId[]).forEach(key => {
                    if (dbSettings[key]) {
                        merged[key] = { ...defaults[key], ...dbSettings[key] };
                    }
                });
                current = merged;
                (global as any).memoLeagueSettings = current;
            }
        } catch (e) {}
    }
    
    return current;
  }
);

export async function updateLeagueSettings(settings: AllLeagueSettings): Promise<void> {
    // Сохраняем в глобальную память
    (global as any).memoLeagueSettings = settings;
    
    const db = getDb();
    if (!db) return;
    try {
        const docRef = doc(db, 'app_settings', 'leagues');
        await setDoc(docRef, settings, { merge: true });
    } catch (e) {}
}

export const getBackgroundUrl = cache(
  async (): Promise<string> => {
    const db = getDb();
    if (!db) return (global as any).memoBackgroundUrl;

    try {
        const docRef = doc(db, 'app_settings', 'background');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = sanitizeFirestore(docSnap.data());
            const url = data.url || '';
            (global as any).memoBackgroundUrl = url;
            return url;
        }
    } catch (e) {}
    return (global as any).memoBackgroundUrl;
  }
);

export async function updateBackgroundUrl(url: string): Promise<void> {
    (global as any).memoBackgroundUrl = url;
    const db = getDb();
    if (!db) return;
    try {
        const docRef = doc(db, 'app_settings', 'background');
        await setDoc(docRef, { url });
    } catch (e) {}
}

export const getSponsorshipSettings = cache(
  async (): Promise<SponsorshipSettings> => {
    const defaults: SponsorshipSettings = {
        adminTelegramLink: 'https://t.me/+guTrCGUrh4gxNGZi',
        groupTelegramLink: 'https://t.me/+guTrCGUrh4gxNGZi',
        adminVkLink: 'https://vk.ru/dartbrig',
        groupVkLink: 'https://vk.ru/dartbrig',
        showSponsorsInProfile: true,
        showSponsorshipCallToAction: true,
        sponsorTemplate: 'default',
        callToActionSlogans: [
            'Поддержите новую звезду дартс!',
            'Ваш бренд и будущие победы!',
            'Инвестируйте в талант!',
            'Станьте частью большой игры!',
        ],
    };
    
    const db = getDb();
    let current = (global as any).memoSponsorshipSettings || defaults;

    if (db) {
        try {
            const docRef = doc(db, 'app_settings', 'sponsorship');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = sanitizeFirestore(docSnap.data());
                current = { ...defaults, ...data };
                (global as any).memoSponsorshipSettings = current;
            }
        } catch (e) {}
    }
    
    return current;
  }
);

export async function updateSponsorshipSettings(settings: SponsorshipSettings): Promise<void> {
    (global as any).memoSponsorshipSettings = settings;
    const db = getDb();
    if (!db) return;
    try {
        const docRef = doc(db, 'app_settings', 'sponsorship');
        await setDoc(docRef, settings, { merge: true });
    } catch (e) {}
}

export const getAppearanceSettings = cache(
    async (): Promise<AppearanceSettings> => {
        const defaults: AppearanceSettings = {
            globalDefaultTemplate: 'classic'
        };
        const db = getDb();
        let current = (global as any).memoAppearance || defaults;

        if (db) {
            try {
                const docRef = doc(db, 'app_settings', 'appearance');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    current = { ...defaults, ...sanitizeFirestore(docSnap.data()) };
                    (global as any).memoAppearance = current;
                }
            } catch (e) {}
        }
        return current;
    }
);

export async function updateAppearanceSettings(settings: Partial<AppearanceSettings>): Promise<void> {
    const current = await getAppearanceSettings();
    const updated = { ...current, ...settings };
    (global as any).memoAppearance = updated;
    
    const db = getDb();
    if (!db) return;
    try {
        const docRef = doc(db, 'app_settings', 'appearance');
        await setDoc(docRef, updated, { merge: true });
    } catch (e) {}
}
