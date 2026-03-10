import { collection, doc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { PlayerProfile } from './types';
import { cache } from 'react';
import { sanitizeFirestore } from './utils';

// Используем только React cache для предотвращения лимита в 2МБ у unstable_cache
export const getPlayerProfiles = cache(
  async (): Promise<PlayerProfile[]> => {
    const db = getDb();
    const playersCol = collection(db, 'players');
    const playerSnapshot = await getDocs(playersCol);
    const playerList = playerSnapshot.docs.map(doc => sanitizeFirestore({ ...doc.data(), id: doc.id }) as PlayerProfile);
    return playerList;
  }
);

export async function getPlayerProfileById(id: string): Promise<PlayerProfile | undefined> {
  const db = getDb();
  const playerDocRef = doc(db, 'players', id);
  const playerSnap = await getDoc(playerDocRef);
  if (playerSnap.exists()) {
    return sanitizeFirestore({ ...playerSnap.data(), id: playerSnap.id }) as PlayerProfile;
  }
  return undefined;
}

export async function updatePlayerProfiles(players: PlayerProfile[]): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  players.forEach(player => {
    const playerDocRef = doc(db, 'players', player.id);
    const data = { ...player };
    delete (data as any).id;
    batch.set(playerDocRef, data, { merge: true });
  });
  await batch.commit();
}

export async function clearAllPlayerProfiles(): Promise<void> {
  const db = getDb();
  const playersCol = collection(db, 'players');
  const snapshot = await getDocs(playersCol);
  if (snapshot.empty) return;
  
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
  });
  await batch.commit();
}
