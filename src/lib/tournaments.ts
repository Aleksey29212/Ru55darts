import { collection, doc, getDocs, deleteDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { Tournament } from './types';
import { cache } from 'react';
import { getDoc } from 'firebase/firestore';
import { sanitizeFirestore } from './utils';

// Используем React cache для предотвращения ошибок кэширования больших объектов (>2MB)
export const getTournaments = cache(
  async (): Promise<Tournament[]> => {
    const db = getDb();
    if (!db) return [];

    try {
        const tournamentsCol = collection(db, 'tournaments');
        const tournamentSnapshot = await getDocs(tournamentsCol);
        const tournamentList = tournamentSnapshot.docs.map(doc => {
          const data = doc.data();
          return sanitizeFirestore({ id: doc.id, ...data }) as Tournament;
        });
        return tournamentList;
    } catch (e) {
        console.error("Failed to fetch tournaments:", e);
        return [];
    }
  }
);

export async function addTournaments(newTournaments: any[]): Promise<string[]> {
    if (!newTournaments || newTournaments.length === 0) {
        return [];
    }
    const db = getDb();
    if (!db) return [];

    const batch = writeBatch(db);
    const actuallyAddedIds: string[] = [];

    for (const newT of newTournaments) {
        const docId = newT.id;
        if (!docId) continue;

        const docRef = doc(db, 'tournaments', String(docId));
        const dataToSet = { 
            ...newT, 
            date: Timestamp.fromDate(new Date(newT.date as string)) 
        };
        delete dataToSet.id;
        batch.set(docRef, dataToSet);
        actuallyAddedIds.push(String(docId));
    }
    
    if (actuallyAddedIds.length > 0) {
        await batch.commit();
    }
    return actuallyAddedIds;
}

export async function getTournamentById(id: string): Promise<Tournament | undefined> {
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
    const db = getDb();
    if (!db) return;
    const tournamentDocRef = doc(db, 'tournaments', id);
    await deleteDoc(tournamentDocRef);
}

export async function clearAllTournamentData(): Promise<void> {
    const db = getDb();
    if (!db) return;
    const tournamentsCol = collection(db, 'tournaments');
    const snapshot = await getDocs(tournamentsCol);
    if (snapshot.empty) return;
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}
