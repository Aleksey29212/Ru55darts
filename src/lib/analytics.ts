import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import { unstable_noStore as noStore } from 'next/cache';
import { getPlayerProfiles } from './players';

export type VisitStats = {
  day: number;
  week: number;
  year: number;
  total: number;
};

export type SponsorClickStat = {
  playerId: string;
  playerName: string;
  sponsorName: string;
  clicks: number;
};

export async function getVisitStats(): Promise<VisitStats> {
  noStore();
  const db = getDb();
  if (!db) return { day: 0, week: 0, year: 0, total: 0 };

  try {
    const visitsCol = collection(db, 'visits');
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const dayQuery = query(visitsCol, where('timestamp', '>=', oneDayAgo));
    const weekQuery = query(visitsCol, where('timestamp', '>=', oneWeekAgo));
    const yearQuery = query(visitsCol, where('timestamp', '>=', oneYearAgo));

    const [daySnapshot, weekSnapshot, yearSnapshot, totalSnapshot] = await Promise.all([
      getDocs(dayQuery).catch(() => ({ size: 0 })),
      getDocs(weekQuery).catch(() => ({ size: 0 })),
      getDocs(yearQuery).catch(() => ({ size: 0 })),
      getDocs(visitsCol).catch(() => ({ size: 0 })),
    ]);

    return {
      day: (daySnapshot as any).size || 0,
      week: (weekSnapshot as any).size || 0,
      year: (yearSnapshot as any).size || 0,
      total: (totalSnapshot as any).size || 0,
    };
  } catch (error) {
    console.warn('Error fetching visit stats (Analytics inactive):', error);
    return { day: 0, week: 0, year: 0, total: 0 };
  }
}

export async function getSponsorClickStats(): Promise<SponsorClickStat[]> {
    noStore();
    const db = getDb();
    if (!db) return [];
    
    try {
        const clicksCol = collection(db, 'sponsor_clicks');
        const players = await getPlayerProfiles();
        const playerMap = new Map(players.map(p => [p.id, p.name]));

        const clicksSnapshot = await getDocs(clicksCol);

        const statsMap = new Map<string, { playerId: string; sponsorName: string; clicks: number }>();

        clicksSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.playerId && data.sponsorName) {
                const key = `${data.playerId}__${data.sponsorName}`;
                if (!statsMap.has(key)) {
                    statsMap.set(key, { playerId: data.playerId, sponsorName: data.sponsorName, clicks: 0 });
                }
                statsMap.get(key)!.clicks++;
            }
        });

        const results: SponsorClickStat[] = Array.from(statsMap.values()).map(stat => ({
            ...stat,
            playerName: playerMap.get(stat.playerId) || stat.playerId,
        })).sort((a, b) => b.clicks - a.clicks);

        return results;
    } catch (error) {
        console.warn('Error fetching sponsor click stats:', error);
        return [];
    }
}
