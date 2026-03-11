import { collection, doc, getDocs, deleteDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { Tournament } from './types';
import { cache } from 'react';
import { getDoc } from 'firebase/firestore';
import { sanitizeFirestore } from './utils';

/**
 * ГАРАНТИЯ: Временное хранилище для работы БЕЗ КЛЮЧЕЙ Firebase.
 * Данные сохраняются в оперативной памяти до перезагрузки сервера.
 */
let demoTournaments: Tournament[] = [];

export const getTournaments = cache(
  async (): Promise<Tournament[]> => {
    const db = getDb();
    
    // Сначала берем данные из памяти (для демо-режима)
    let tournaments = [...demoTournaments];

    if (db) {
        try {
            const tournamentsCol = collection(db, 'tournaments');
            const tournamentSnapshot = await getDocs(tournamentsCol);
            const dbList = tournamentSnapshot.docs.map(doc => {
              const data = doc.data();
              return sanitizeFirestore({ id: doc.id, ...data }) as Tournament;
            });
            // Объединяем, если есть и там и там (приоритет БД)
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

        if (db) {
            try {
                const docRef = doc(db, 'tournaments', docId);
                const dataToSet = { ...dataToSave };
                delete (dataToSet as any).id;
                await sanitizeFirestore(dataToSet); // validation
                // We use setDoc here instead of batch for simplicity in mixed mode
                const { setDoc } = await import('firebase/firestore');
                await setDoc(docRef, dataToSet);
                actuallyAddedIds.push(docId);
            } catch (e) {
                console.error("Failed to save to DB, falling back to memory:", e);
                saveToMemory(dataToSave);
                actuallyAddedIds.push(docId);
            }
        } else {
            saveToMemory(dataToSave);
            actuallyAddedIds.push(docId);
        }
    }
    
    return actuallyAddedIds;
}

function saveToMemory(t: any) {
    const exists = demoTournaments.find(existing => existing.id === t.id);
    if (!exists) {
        demoTournaments.push(t as Tournament);
    }
}

export async function getTournamentById(id: string): Promise<Tournament | undefined> {
    // Проверка в памяти
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
    // Удаление из памяти
    demoTournaments = demoTournaments.filter(t => t.id !== id);

    const db = getDb();
    if (!db) return;
    try {
        const tournamentDocRef = doc(db, 'tournaments', id);
        await deleteDoc(tournamentDocRef);
    } catch (e) {}
}

export async function clearAllTournamentData(): Promise<void> {
    demoTournaments = [];
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
