import { collection, doc, getDocs, deleteDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { Tournament } from './types';
import { cache } from 'react';
import { getDoc } from 'firebase/firestore';
import { sanitizeFirestore } from './utils';

/**
 * ГАРАНТИЯ: Глобальное хранилище для работы БЕЗ КЛЮЧЕЙ Firebase.
 * Данные сохраняются в глобальном объекте Node.js для персистентности в рамках сессии.
 */
if (!(global as any).demoTournaments) {
    (global as any).demoTournaments = [];
}
const demoTournaments: Tournament[] = (global as any).demoTournaments;

export const getTournaments = cache(
  async (): Promise<Tournament[]> => {
    const db = getDb();
    
    // Всегда начинаем с данных в памяти
    let tournaments = [...demoTournaments];

    if (db) {
        try {
            const tournamentsCol = collection(db, 'tournaments');
            const tournamentSnapshot = await getDocs(tournamentsCol);
            const dbList = tournamentSnapshot.docs.map(doc => {
              const data = doc.data();
              return sanitizeFirestore({ id: doc.id, ...data }) as Tournament;
            });
            // Объединяем, если есть в БД (приоритет БД)
            const dbIds = new Set(dbList.map(t => t.id));
            tournaments = [...dbList, ...tournaments.filter(t => !dbIds.has(t.id))];
        } catch (e) {
            console.error("Failed to fetch tournaments from DB:", e);
        }
    }
    
    return tournaments;
  }
);

export async function addTournaments(newTournaments: any[]): Promise<string[]> {
    if (!newTournaments || newTournaments.length === 0) {
        return [];
    }
    const db = getDb();
    const actuallyAddedIds: string[] = [];

    for (const newT of newTournaments) {
        const docId = String(newT.id);
        if (!docId) continue;

        const dataToSave = { 
            ...newT, 
            id: docId,
            date: newT.date instanceof Timestamp ? newT.date : Timestamp.fromDate(new Date(newT.date as string)) 
        };

        // Всегда сохраняем в глобальную память
        const existsIdx = demoTournaments.findIndex(existing => existing.id === dataToSave.id);
        if (existsIdx !== -1) {
            demoTournaments[existsIdx] = dataToSave as Tournament;
        } else {
            demoTournaments.push(dataToSave as Tournament);
        }
        actuallyAddedIds.push(docId);

        if (db) {
            try {
                const docRef = doc(db, 'tournaments', docId);
                const dataToSet = { ...dataToSave };
                delete (dataToSet as any).id;
                const { setDoc } = await import('firebase/firestore');
                await setDoc(docRef, dataToSet);
            } catch (e) {
                console.error("Failed to save to DB, using memory");
            }
        }
    }
    
    return actuallyAddedIds;
}

export async function getTournamentById(id: string): Promise<Tournament | undefined> {
    const fromMemory = demoTournaments.find(t => t.id === id);
    if (fromMemory) return fromMemory;

    const db = getDb();
    if (!db) return undefined;

    try {
        const tournamentDocRef = doc(db, 'tournaments', id);
        const docSnap = await getDoc(tournamentDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return sanitizeFirestore({ id: docSnap.id, ...data }) as Tournament;
        }
    } catch (e) {}
    return undefined;
}

export async function deleteTournamentById(id: string): Promise<void> {
    const idx = demoTournaments.findIndex(t => t.id === id);
    if (idx !== -1) demoTournaments.splice(idx, 1);

    const db = getDb();
    if (!db) return;
    try {
        const tournamentDocRef = doc(db, 'tournaments', id);
        await deleteDoc(tournamentDocRef);
    } catch (e) {}
}

export async function clearAllTournamentData(): Promise<void> {
    demoTournaments.length = 0;
    const db = getDb();
    if (!db) return;
    try {
        const tournamentsCol = collection(db, 'tournaments');
        const snapshot = await getDocs(tournamentsCol);
        if (snapshot.empty) return;
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => { batch.delete(doc.ref); });
        await batch.commit();
    } catch (e) {}
}
