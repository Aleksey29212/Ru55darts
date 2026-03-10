'use client';

import { doc, type Firestore, deleteField } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { PlayerProfile } from '@/lib/types';

const PLAYERS_COLLECTION = 'players';

export function updatePlayerProfile(db: Firestore, player: PlayerProfile) {
  const { id, ...playerData } = player;
  const playerDocRef = doc(db, PLAYERS_COLLECTION, id);

  const dataToUpdate: { [key: string]: any } = { ...playerData };

  // Filter out any incomplete sponsors before saving
  if (dataToUpdate.sponsors) {
      dataToUpdate.sponsors = dataToUpdate.sponsors.filter(s => s && s.name && s.logoUrl);
  } else {
      dataToUpdate.sponsors = [];
  }

  // If call to action is an empty string, remove it
  if (playerData.sponsorshipCallToAction === '') {
    dataToUpdate.sponsorshipCallToAction = deleteField();
  }
  
  // We only update, never create a player profile from the player card UI
  updateDocumentNonBlocking(playerDocRef, dataToUpdate);
}
