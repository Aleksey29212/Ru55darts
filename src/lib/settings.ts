import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { ScoringSettings, AllLeagueSettings, LeagueId, SponsorshipSettings } from './types';
import { cache } from 'react';
import defaultScoringSettingsData from './scoring-settings.json';
import defaultLeagueSettingsData from './league-settings.json';
import { sanitizeFirestore } from './utils';

/**
 * ГАРАНТИЯ: Устойчивость к отсутствию данных в БД. 
 * Возвращает стандартные настройки (default), если БД пуста.
 */

export const getAllScoringSettings = cache(
  async (): Promise<Record<LeagueId, ScoringSettings>> => {
    const allDefaults: Record<LeagueId, ScoringSettings> = defaultScoringSettingsData as any;
    
    try {
        const db = getDb();
        const settingsCol = collection(db, 'scoring_configurations');
        const snapshot = await getDocs(settingsCol);
        
        if (snapshot.empty) return allDefaults;
        
        const fromDb: Partial<Record<LeagueId, ScoringSettings>> = {};
        snapshot.docs.forEach(doc => {
            fromDb[doc.id as LeagueId] = sanitizeFirestore({ ...doc.data(), id: doc.id }) as ScoringSettings;
        });

        const merged: any = {};
        (Object.keys(allDefaults) as LeagueId[]).forEach(key => {
            merged[key] = { ...allDefaults[key], ...(fromDb[key] || {}) };
        });
        return merged;
    } catch (e) {
        console.warn("Using default scoring settings due to fetch error:", e);
        return allDefaults;
    }
  }
);

export const getScoringSettings = cache(
  async (leagueId: LeagueId): Promise<ScoringSettings> => {
    const defaults = (defaultScoringSettingsData as any)[leagueId] || (defaultScoringSettingsData as any).general;

    try {
        const db = getDb();
        const docRef = doc(db, 'scoring_configurations', leagueId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return sanitizeFirestore({ ...defaults, ...docSnap.data(), id: docSnap.id }) as ScoringSettings;
        }
    } catch (e) {}
    
    return { ...defaults, id: leagueId } as ScoringSettings;
  }
);

export async function updateScoringSettings(leagueId: LeagueId, settings: ScoringSettings): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'scoring_configurations', leagueId);
  const dataToSet = { ...settings };
  delete (dataToSet as any).id;
  await setDoc(docRef, dataToSet);
}

export const getLeagueSettings = cache(
  async (): Promise<AllLeagueSettings> => {
    const defaults: AllLeagueSettings = defaultLeagueSettingsData as any;

    try {
        const db = getDb();
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
            return merged;
        }
    } catch (e) {}
    
    return defaults;
  }
);

export async function updateLeagueSettings(settings: AllLeagueSettings): Promise<void> {
    const db = getDb();
    const docRef = doc(db, 'app_settings', 'leagues');
    await setDoc(docRef, settings, { merge: true });
}

export const getBackgroundUrl = cache(
  async (): Promise<string> => {
    try {
        const db = getDb();
        const docRef = doc(db, 'app_settings', 'background');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = sanitizeFirestore(docSnap.data());
            return data.url || '';
        }
    } catch (e) {}
    return '';
  }
);

export async function updateBackgroundUrl(url: string): Promise<void> {
    const db = getDb();
    const docRef = doc(db, 'app_settings', 'background');
    await setDoc(docRef, { url });
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
    
    try {
        const db = getDb();
        const docRef = doc(db, 'app_settings', 'sponsorship');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = sanitizeFirestore(docSnap.data());
            return { ...defaults, ...data };
        }
    } catch (e) {}
    
    return defaults;
  }
);

export async function updateSponsorshipSettings(settings: SponsorshipSettings): Promise<void> {
    const db = getDb();
    const docRef = doc(db, 'app_settings', 'sponsorship');
    await setDoc(docRef, settings, { merge: true });
}
