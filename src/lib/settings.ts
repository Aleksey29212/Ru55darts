import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { ScoringSettings, AllLeagueSettings, LeagueId, SponsorshipSettings } from './types';
import { cache } from 'react';
import defaultScoringSettingsData from './scoring-settings.json';
import defaultLeagueSettingsData from './league-settings.json';
import { sanitizeFirestore } from './utils';

export const getAllScoringSettings = cache(
  async (): Promise<Record<LeagueId, ScoringSettings>> => {
    const db = getDb();
    const settingsCol = collection(db, 'scoring_configurations');
    const snapshot = await getDocs(settingsCol);
    
    const allDefaults: Record<LeagueId, ScoringSettings> = defaultScoringSettingsData;

    if (snapshot.empty) {
      return allDefaults;
    }
    
    const fromDb: Partial<Record<LeagueId, ScoringSettings>> = {};
    snapshot.docs.forEach(doc => {
        fromDb[doc.id as LeagueId] = sanitizeFirestore({ id: doc.id, ...doc.data() }) as ScoringSettings;
    });

    const finalSettings: Record<LeagueId, ScoringSettings> = {
      general: { ...allDefaults.general, ...fromDb.general },
      evening_omsk: { ...allDefaults.evening_omsk, ...fromDb.evening_omsk },
      premier: { ...allDefaults.premier, ...fromDb.premier },
      first: { ...allDefaults.first, ...fromDb.first },
      cricket: { ...allDefaults.cricket, ...fromDb.cricket },
      second: { ...allDefaults.second, ...fromDb.second },
      third: { ...allDefaults.third, ...fromDb.third },
      fourth: { ...allDefaults.fourth, ...fromDb.fourth },
      senior: { ...allDefaults.senior, ...fromDb.senior },
      youth: { ...allDefaults.youth, ...fromDb.youth },
      women: { ...allDefaults.women, ...fromDb.women },
    };

    return finalSettings;
  }
);

export const getScoringSettings = cache(
  async (leagueId: LeagueId): Promise<ScoringSettings> => {
    const db = getDb();
    const docRef = doc(db, 'scoring_configurations', leagueId);
    const docSnap = await getDoc(docRef);

    const defaults = defaultScoringSettingsData[leagueId] || defaultScoringSettingsData.general;

    if (docSnap.exists()) {
      return sanitizeFirestore({ ...defaults, ...docSnap.data(), id: docSnap.id }) as ScoringSettings;
    }
    return { ...defaults, id: leagueId } as ScoringSettings;
  }
);

export async function updateScoringSettings(leagueId: LeagueId, settings: ScoringSettings): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'scoring_configurations', leagueId);
  const dataToSet = { ...settings };
  delete dataToSet.id;
  await setDoc(docRef, dataToSet);
}


export const getLeagueSettings = cache(
  async (): Promise<AllLeagueSettings> => {
    const db = getDb();
    const docRef = doc(db, 'app_settings', 'leagues');
    const docSnap = await getDoc(docRef);

    const defaultAllLeagueSettings: AllLeagueSettings = defaultLeagueSettingsData;

    if (docSnap.exists()) {
        const dbSettings = sanitizeFirestore(docSnap.data()) as Partial<AllLeagueSettings>;
        
        const mergedSettings = { ...defaultAllLeagueSettings };
        (Object.keys(defaultAllLeagueSettings) as LeagueId[]).forEach(key => {
            if (dbSettings[key]) {
                mergedSettings[key] = { 
                    ...defaultAllLeagueSettings[key], 
                    ...dbSettings[key]
                };
            }
        });
        return mergedSettings;
    }
    return defaultAllLeagueSettings;
  }
);

export async function updateLeagueSettings(settings: AllLeagueSettings): Promise<void> {
    const db = getDb();
    const docRef = doc(db, 'app_settings', 'leagues');
    await setDoc(docRef, settings, { merge: true });
}

export const getBackgroundUrl = cache(
  async (): Promise<string> => {
    const db = getDb();
    const docRef = doc(db, 'app_settings', 'background');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = sanitizeFirestore(docSnap.data());
        return data.url || '';
    }
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
    const db = getDb();
    const docRef = doc(db, 'app_settings', 'sponsorship');
    const docSnap = await getDoc(docRef);

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
    
    if (docSnap.exists()) {
        const data = sanitizeFirestore(docSnap.data());
        return {
            ...defaults,
            ...data,
        };
    }
    return defaults;
  }
);

export async function updateSponsorshipSettings(settings: SponsorshipSettings): Promise<void> {
    const db = getDb();
    const docRef = doc(db, 'app_settings', 'sponsorship');
    await setDoc(docRef, settings, { merge: true });
}
