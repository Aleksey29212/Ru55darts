import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { ScoringSettings, AllLeagueSettings, LeagueId, SponsorshipSettings } from './types';
import { cache } from 'react';
import defaultScoringSettingsData from './scoring-settings.json';
import defaultLeagueSettingsData from './league-settings.json';
import { sanitizeFirestore } from './utils';

/**
 * ГАРАНТИЯ: Полная поддержка Демо-режима. 
 * Настройки сохраняются в памяти сервера, если Firebase не настроен.
 */

let memoScoringSettings: Partial<Record<LeagueId, ScoringSettings>> = {};
let memoLeagueSettings: AllLeagueSettings | null = null;
let memoBackgroundUrl: string = '';
let memoSponsorshipSettings: SponsorshipSettings | null = null;

export const getAllScoringSettings = cache(
  async (): Promise<Record<LeagueId, ScoringSettings>> => {
    const allDefaults: Record<LeagueId, ScoringSettings> = defaultScoringSettingsData as any;
    const db = getDb();
    
    let fromDb: Partial<Record<LeagueId, ScoringSettings>> = { ...memoScoringSettings };

    if (db) {
        try {
            const settingsCol = collection(db, 'scoring_configurations');
            const snapshot = await getDocs(settingsCol);
            snapshot.docs.forEach(doc => {
                fromDb[doc.id as LeagueId] = sanitizeFirestore({ ...doc.data(), id: doc.id }) as ScoringSettings;
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
  memoScoringSettings[leagueId] = settings;
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
    
    let current = memoLeagueSettings || defaults;

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
            }
        } catch (e) {}
    }
    
    return current;
  }
);

export async function updateLeagueSettings(settings: AllLeagueSettings): Promise<void> {
    memoLeagueSettings = settings;
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
    if (!db) return memoBackgroundUrl;

    try {
        const docRef = doc(db, 'app_settings', 'background');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = sanitizeFirestore(docSnap.data());
            return data.url || memoBackgroundUrl;
        }
    } catch (e) {}
    return memoBackgroundUrl;
  }
);

export async function updateBackgroundUrl(url: string): Promise<void> {
    memoBackgroundUrl = url;
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
    let current = memoSponsorshipSettings || defaults;

    if (db) {
        try {
            const docRef = doc(db, 'app_settings', 'sponsorship');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = sanitizeFirestore(docSnap.data());
                current = { ...defaults, ...data };
            }
        } catch (e) {}
    }
    
    return current;
  }
);

export async function updateSponsorshipSettings(settings: SponsorshipSettings): Promise<void> {
    memoSponsorshipSettings = settings;
    const db = getDb();
    if (!db) return;
    try {
        const docRef = doc(db, 'app_settings', 'sponsorship');
        await setDoc(docRef, settings, { merge: true });
    } catch (e) {}
}
