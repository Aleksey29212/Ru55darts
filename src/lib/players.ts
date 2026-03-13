import { collection, doc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { PlayerProfile } from './types';
import { cache } from 'react';
import { sanitizeFirestore } from './utils';

/**
 * ГАРАНТИЯ: Глобальный контейнер профилей (Persistent Site Container).
 * Хранит данные (включая Base64 фото) постоянно в рамках жизненного цикла сервера.
 * Данные не требуют повторного парсинга после загрузки.
 */
if (!(global as any).demoPlayers) {
    (global as any).demoPlayers = [];
}

export const getPlayerProfiles = cache(
  async (): Promise<PlayerProfile[]> => {
    const db = getDb();
    let players = [...((global as any).demoPlayers as PlayerProfile[])];

    if (db) {
        try {
            const playersCol = collection(db, 'players');
            const playerSnapshot = await getDocs(playersCol);
            const dbList = playerSnapshot.docs.map(doc => sanitizeFirestore({ ...doc.data(), id: doc.id }) as PlayerProfile);
            
            // Синхронизируем: БД имеет приоритет, но дополняем новыми из памяти
            const dbIds = new Set(dbList.map(p => p.id));
            players = [...dbList, ...players.filter(p => !dbIds.has(p.id))];
            
            // Обновляем контейнер сайта
            (global as any).demoPlayers = players;
        } catch (e) {
            console.error("Failed to fetch players from DB:", e);
        }
    }
    
    return players;
  }
);

export async function getPlayerProfileById(id: string): Promise<PlayerProfile | undefined> {
  const memoryStore = (global as any).demoPlayers as PlayerProfile[];
  const fromMemory = memoryStore.find(p => p.id === id);
  if (fromMemory) return fromMemory;

  const db = getDb();
  if (!db) return undefined;

  try {
      const playerDocRef = doc(db, 'players', id);
      const playerSnap = await getDoc(playerDocRef);
      if (playerSnap.exists()) {
        const player = sanitizeFirestore({ ...playerSnap.data(), id: playerSnap.id }) as PlayerProfile;
        // Добавляем в контейнер для будущих обращений
        if (!memoryStore.some(p => p.id === player.id)) {
            memoryStore.push(player);
        }
        return player;
      }
  } catch (e) {}
  return undefined;
}

export async function updatePlayerProfiles(players: PlayerProfile[]): Promise<void> {
  const memoryStore = (global as any).demoPlayers as PlayerProfile[];
  
  // 1. Мгновенное обновление в контейнере (In-memory storage)
  players.forEach(p => {
      const idx = memoryStore.findIndex(existing => existing.id === p.id);
      if (idx !== -1) {
          memoryStore[idx] = { ...memoryStore[idx], ...p };
      } else {
          memoryStore.push(p);
      }
  });

  const db = getDb();
  if (!db) return;

  // 2. Персистентное сохранение в базу данных
  try {
      const batch = writeBatch(db);
      players.forEach(player => {
        const playerDocRef = doc(db, 'players', player.id);
        const data = { ...player };
        delete (data as any).id; // ID является ключом документа
        batch.set(playerDocRef, data, { merge: true });
      });
      await batch.commit();
  } catch (e) {
      console.error("DB update error, changes kept in site container");
  }
}

export async function clearAllPlayerProfiles(): Promise<void> {
  (global as any).demoPlayers = [];
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
