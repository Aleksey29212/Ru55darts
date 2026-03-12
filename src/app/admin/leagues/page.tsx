'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeagueSettingsForm } from './league-form';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { AllLeagueSettings, LeagueId } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import defaultLeagueSettings from '@/lib/league-settings.json';
import { useMemo } from 'react';

export default function LeaguesPage() {
  const db = useFirestore();
  const leagueSettingsRef = useMemoFirebase(() => db ? doc(db, 'app_settings', 'leagues') : null, [db]);
  const { data: leagueSettingsFromDb, isLoading } = useDoc<AllLeagueSettings>(leagueSettingsRef);

  const mergedSettings = useMemo(() => {
    const defaults = defaultLeagueSettings as AllLeagueSettings;
    const fromDb = leagueSettingsFromDb || {};
    
    const result = { ...defaults };
    (Object.keys(defaults) as LeagueId[]).forEach(key => {
      const dbEntry = fromDb[key] || {};
      const defEntry = defaults[key] || {};
      
      result[key] = {
        ...defEntry,
        ...dbEntry,
        // Гарантируем, что обязательные строковые поля никогда не будут undefined
        name: dbEntry.name || defEntry.name || '',
        bannerUrl: dbEntry.bannerUrl || defEntry.bannerUrl || '',
        enabled: dbEntry.enabled ?? defEntry.enabled ?? false,
        includeInGeneralRanking: dbEntry.includeInGeneralRanking ?? defEntry.includeInGeneralRanking ?? false
      };
    });
    return result;
  }, [leagueSettingsFromDb]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl font-headline uppercase tracking-tight">Управление лигами</CardTitle>
          <CardDescription>
            Включайте или отключайте отображение лиг на главной странице и задавайте им названия.
          </CardDescription>
        </CardHeader>
        {isLoading ? (
            <div className="p-6 space-y-6">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-4 rounded-lg border p-4">
                        <div className="flex flex-row items-center justify-between">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-6 w-12" />
                        </div>
                        <div className="space-y-2">
                             <Skeleton className="h-4 w-24" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                ))}
                 <div className="flex justify-end pt-6">
                    <Skeleton className="h-10 w-40" />
                 </div>
            </div>
        ) : (
            /* We use a key based on the merged data to force re-render when DB changes */
            <LeagueSettingsForm key={JSON.stringify(mergedSettings)} defaultValues={mergedSettings} />
        )}
      </Card>
    </div>
  );
}
