import { collection, doc, getDocs } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { Partner } from './types';
import { cache } from 'react';
import { sanitizeFirestore } from './utils';

export const getPartners = cache(
  async (): Promise<Partner[]> => {
    const db = getDb();
    if (!db) return [];

    try {
        const partnersCol = collection(db, 'partners');
        const snapshot = await getDocs(partnersCol);
        const partnerList = snapshot.docs.map(doc => sanitizeFirestore({ id: doc.id, ...doc.data() }) as Partner);
        return partnerList;
    } catch (e) {
        console.error("Failed to fetch partners:", e);
        return [];
    }
  }
);
