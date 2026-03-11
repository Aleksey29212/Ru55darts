import { collection, doc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { PlayerProfile } from './types';
import { cache } from 'react';
import { sanitizeFirestore } from './utils';

/**
 * ГАРАНТИЯ: Временное хранилище профилей для работы БЕЗ КЛЮЧЕЙ.
 */
let demoPlayers: PlayerProfile[] = [];

export const getPlayerProfiles = cache(
  async (): Promise<PlayerProfile[]> => {
    const db = getDb();
    let players = [...demoPlayers];

    if (db) {
        try {
            const playersCol = collection(db, 'players');
            const playerSnapshot = await getDocs(playersCol);
            const dbList = playerSnapshot.docs.map(doc => sanitizeFirestore({ ...doc.data(), id: doc.id }) as PlayerProfile);
            
            const dbIds = new Set(dbList.map(p => p.id));
            players = [...dbList, ...players.filter(p => !dbIds.has(p.id))];
        } catch (e) {
            console.error("Failed to fetch players from DB:", e);
        }
    }
    
    return players;
  }
);

export async function getPlayerProfileById(id: string): Promise<PlayerProfile | undefined> {
  const fromMemory = demoPlayers.find(p => p.id === id);
  if (fromMemory) return fromMemory;

  const db = getDb();
  if (!db) return undefined;

  try {
      const playerDocRef = doc(db, 'players', id);
      const playerSnap = await getDoc(playerDocRef);
      if (playerSnap.exists()) {
        return sanitizeFirestore({ ...playerSnap.data(), id: playerSnap.id }) as PlayerProfile;
      }
  } catch (e) {}
  return undefined;
}

export async function updatePlayerProfiles(players: PlayerProfile[]): Promise<void> {
  // Обновляем память
  players.forEach(p => {
      const idx = demoPlayers.findIndex(existing => existing.id === p.id);
      if (idx !== -1) demoPlayers[idx] = p;
      else demoPlayers.push(p);
  });

  const db = getDb();
  if (!db) return;

  try {
      const batch = writeBatch(db);
      players.forEach(player => {
        const playerDocRef = doc(db, 'players', player.id);
        const data = { ...player };
        delete (data as any).id;
        batch.set(playerDocRef, data, { merge: true });
      });
      await batch.commit();
  } catch (e) {}
}

export async function clearAllPlayerProfiles(): Promise<void> {
  demoPlayers = [];
  const db = getDb();
  if (!db) return;

  try {
      const playersCol = collection(db, 'players');
      const snapshot = await getDocs(playersCol);
      if (snapshot.empty) return;
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
      });
      await batch.commit();
  } catch (e) {}
}
