import { collection, doc, getDocs, deleteDoc, writeBatch, Timestamp, getDoc } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { Tournament } from './types';
import { cache } from 'react';
import { sanitizeFirestore } from './utils';

/**
 * ГАРАНТИЯ: Глобальный контейнер турниров.
 * Исключает необходимость повторного парсинга уже загруженных данных.
 */
if (!(global as any).demoTournaments) {
    (global as any).demoTournaments = [];
}

export const getTournaments = cache(
  async (): Promise<Tournament[]> => {
    const db = getDb();
    
    // Всегда начинаем с контейнера (Memory Cache)
    let tournaments = [...((global as any).demoTournaments as Tournament[])];

    if (db) {
        try {
            const tournamentsCol = collection(db, 'tournaments');
            const tournamentSnapshot = await getDocs(tournamentsCol);
            const dbList = tournamentSnapshot.docs.map(doc => {
              return sanitizeFirestore({ ...doc.data(), id: doc.id }) as Tournament;
            });
            
            // Синхронизация: данные из БД имеют приоритет
            const dbIds = new Set(dbList.map(t => t.id));
            tournaments = [...dbList, ...tournaments.filter(t => !dbIds.has(t.id))];
            
            // Сохраняем в контейнер
            (global as any).demoTournaments = tournaments;
        } catch (e) {
            console.error("Failed to fetch tournaments from DB, serving from container");
        }
    }
    
    return sanitizeFirestore(tournaments) as Tournament[];
  }
);

export async function addTournaments(newTournaments: any[]): Promise<string[]> {
    if (!newTournaments || newTournaments.length === 0) {
        return [];
    }
    const db = getDb();
    const actuallyAddedIds: string[] = [];
    const memoryStore = (global as any).demoTournaments as Tournament[];

    for (const newT of newTournaments) {
        const docId = String(newT.id);
        if (!docId) continue;

        // Преобразование даты в Firestore Timestamp для корректного хранения
        const dataToSave = { 
            ...newT, 
            id: docId,
            date: newT.date instanceof Timestamp ? newT.date : Timestamp.fromDate(new Date(newT.date as string)) 
        };

        // Сохраняем в контейнер сайта (мгновенная доступность)
        const existsIdx = memoryStore.findIndex(existing => existing.id === dataToSave.id);
        if (existsIdx !== -1) {
            memoryStore[existsIdx] = dataToSave as Tournament;
        } else {
            memoryStore.push(dataToSave as Tournament);
        }
        actuallyAddedIds.push(docId);

        // Сохраняем в базу данных (персистентность)
        if (db) {
            try {
                const docRef = doc(db, 'tournaments', docId);
                const dataToSet = { ...dataToSave };
                delete (dataToSet as any).id;
                const { setDoc } = await import('firebase/firestore');
                await setDoc(docRef, dataToSet, { merge: true });
            } catch (e) {
                console.error("Failed to save to DB, data remains in site container");
            }
        }
    }
    
    return actuallyAddedIds;
}

export async function getTournamentById(id: string): Promise<Tournament | undefined> {
    const memoryStore = (global as any).demoTournaments as Tournament[];
    const fromMemory = memoryStore.find(t => t.id === id);
    if (fromMemory) return sanitizeFirestore(fromMemory);

    const db = getDb();
    if (!db) return undefined;

    try {
        const tournamentDocRef = doc(db, 'tournaments', id);
        const docSnap = await getDoc(tournamentDocRef);

        if (docSnap.exists()) {
            const tournament = sanitizeFirestore({ ...docSnap.data(), id: docSnap.id }) as Tournament;
            // Кешируем в контейнер
            if (!memoryStore.some(t => t.id === tournament.id)) {
                memoryStore.push(tournament);
            }
            return tournament;
        }
    } catch (e) {}
    return undefined;
}

export async function deleteTournamentById(id: string): Promise<void> {
    const memoryStore = (global as any).demoTournaments as Tournament[];
    const idx = memoryStore.findIndex(t => t.id === id);
    if (idx !== -1) memoryStore.splice(idx, 1);

    const db = getDb();
    if (!db) return;
    try {
        const tournamentDocRef = doc(db, 'tournaments', id);
        await deleteDoc(tournamentDocRef);
    } catch (e) {}
}

export async function clearAllTournamentData(): Promise<void> {
    (global as any).demoTournaments = [];
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
