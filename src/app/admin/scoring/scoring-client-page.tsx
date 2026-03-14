'use client';

import { ScoringForm } from '@/components/scoring-form';
import { EveningOmskForm } from './evening-omsk-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AllLeagueSettings, LeagueId, ScoringSettings } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Shield, Star, Award, BarChart2, ChevronsUp, Diamond, Users, Sunset, Baby, CircleUser } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsClient } from '@/hooks/use-is-client';

const leagueVisuals: Record<string, { icon: React.ElementType; color: string }> = {
    general: { icon: Trophy, color: 'text-primary' },
    evening_omsk: { icon: Sunset, color: 'text-orange-500' },
    premier: { icon: Shield, color: 'text-destructive' },
    first: { icon: Award, color: 'text-accent' },
    cricket: { icon: Star, color: 'text-gold' },
    second: { icon: BarChart2, color: 'text-sky-400' },
    third: { icon: ChevronsUp, color: 'text-emerald-400' },
    fourth: { icon: Diamond, color: 'text-rose-400' },
    senior: { icon: Users, color: 'text-blue-400' },
    youth: { icon: Baby, color: 'text-lime-400' },
    women: { icon: CircleUser, color: 'text-indigo-400' },
};

interface ScoringClientPageProps {
  initialScoringSettings: Record<LeagueId, ScoringSettings>;
  initialLeagueSettings: AllLeagueSettings;
}

export function ScoringClientPage({ initialScoringSettings, initialLeagueSettings }: ScoringClientPageProps) {
  const db = useFirestore();
  const isClient = useIsClient();

  // Пытаемся получить живые данные из Firestore, если он настроен
  const scoringSettingsQuery = useMemoFirebase(() => db ? collection(db, 'scoring_configurations') : null, [db]);
  const { data: scoringSettingsFromDb, isLoading: isLoadingScoring } = useCollection<ScoringSettings>(scoringSettingsQuery);

  const allScoringSettings = useMemo(() => {
    // ВАЖНО: В демо-режиме используем initialScoringSettings, который пришел с сервера (из памяти)
    if (scoringSettingsFromDb && scoringSettingsFromDb.length > 0) {
        const merged = { ...initialScoringSettings };
        scoringSettingsFromDb.forEach(setting => {
            if (setting.id) merged[setting.id as LeagueId] = { ...merged[setting.id as LeagueId], ...setting };
        });
        return merged;
    }
    return initialScoringSettings;
  }, [scoringSettingsFromDb, initialScoringSettings]);

  const leagueSettings = initialLeagueSettings;
  
  const enabledLeagues = useMemo(() => (Object.keys(leagueSettings) as LeagueId[]).filter(key => leagueSettings[key].enabled), [leagueSettings]);
  const [selectedLeague, setSelectedLeague] = useState<LeagueId>('general');

  useEffect(() => {
      if (enabledLeagues.length > 0 && !enabledLeagues.includes(selectedLeague)) {
          setSelectedLeague(enabledLeagues[0]);
      }
  }, [enabledLeagues, selectedLeague]);

  if (!isClient) {
      return (
         <div className="max-w-4xl mx-auto">
            <Card className="glassmorphism">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                    </div>
                    <Skeleton className="h-[500px] w-full" />
                </CardContent>
            </Card>
        </div>
      );
  }

  if (enabledLeagues.length === 0) {
      return (
         <div className="max-w-4xl mx-auto">
            <Card className="glassmorphism">
                <CardHeader>
                <CardTitle className="text-2xl">Настройка подсчета очков</CardTitle>
                <CardDescription>
                    Сначала включите хотя бы одну лигу в разделе "Управление лигами", чтобы настроить для нее очки.
                </CardDescription>
                </CardHeader>
            </Card>
        </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl">Настройка подсчета очков</CardTitle>
          <CardDescription>
            Определите систему начисления очков для каждой лиги. Изменения повлияют на все будущие расчеты рейтинга.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {enabledLeagues.map(leagueId => {
              const visual = leagueVisuals[leagueId] || leagueVisuals.general;
              const Icon = visual.icon;
              const isSelected = selectedLeague === leagueId;
              return (
                <button
                  key={leagueId}
                  onClick={() => setSelectedLeague(leagueId)}
                  className={cn(
                    'p-4 rounded-lg text-left transition-all duration-200 flex items-center gap-3 interactive-scale',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary',
                    isSelected
                      ? 'bg-primary/10 border border-primary shadow-lg'
                      : 'bg-card/50 border border-border hover:border-primary/50'
                  )}
                >
                  <Icon className={cn(
                      "h-6 w-6 shrink-0 text-muted-foreground transition-colors",
                      isSelected ? visual.color : 'group-hover:text-foreground'
                  )} />
                  <p className={cn("font-semibold transition-colors", isSelected ? "text-primary" : "text-muted-foreground")}>{leagueSettings[leagueId].name}</p>
                </button>
              )
            })}
          </div>

          <div className="mt-6">
            {enabledLeagues.map(leagueId => (
              selectedLeague === leagueId && (
                <div key={leagueId} className="animate-in fade-in-50 duration-300">
                    {leagueId === 'evening_omsk' ? (
                        <EveningOmskForm 
                            defaultValues={allScoringSettings[leagueId]} 
                            leagueName={leagueSettings[leagueId].name}
                        />
                    ) : (
                        <ScoringForm 
                            leagueId={leagueId}
                            leagueName={leagueSettings[leagueId].name}
                            defaultValues={allScoringSettings[leagueId]} 
                        />
                    )}
                </div>
              )
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
