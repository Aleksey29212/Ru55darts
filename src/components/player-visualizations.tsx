'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayerRadarChart } from './player-radar-chart';
import { PlayerRatingChart } from './player-rating-chart';
import type { Player, PlayerTournamentHistory } from '@/lib/types';
import { Activity, Zap, BarChart3 } from 'lucide-react';
import { useIsClient } from '@/hooks/use-is-client';
import { Skeleton } from './ui/skeleton';

interface PlayerVisualizationsProps {
  player: Player;
  tournaments: PlayerTournamentHistory[];
  viewMode: 'aggregate' | 'single';
}

export function PlayerVisualizations({ player, tournaments, viewMode }: PlayerVisualizationsProps) {
  const isClient = useIsClient();
  const hasHistory = tournaments.length >= 2 && viewMode === 'aggregate';

  if (!isClient) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  return (
    <Card className="glassmorphism overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart3 className="text-primary" />
          Аналитика игрока
        </CardTitle>
        <CardDescription>
          Визуальное представление навыков и прогресса.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="radar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="radar" className="gap-2">
              <Zap className="h-4 w-4" />
              Навыки
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2" disabled={!hasHistory}>
              <Activity className="h-4 w-4" />
              Прогресс
            </TabsTrigger>
          </TabsList>

          <TabsContent value="radar" className="mt-0 outline-none">
            <div className="flex flex-col items-center">
              <PlayerRadarChart player={player} viewMode={viewMode} />
              
              {viewMode === 'aggregate' && (
                <div className="w-full mt-4 p-3 rounded-lg border bg-primary/5 space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Zap className="h-2.5 w-2.5" />
                    Параметры анализа
                  </h4>
                  <div className="grid grid-cols-1 gap-1 text-[10px] leading-tight">
                    <div className="flex justify-between border-b border-primary/10 pb-1">
                      <span className="text-muted-foreground">Набор:</span>
                      <span className="text-foreground">AVG + 180-ки</span>
                    </div>
                    <div className="flex justify-between border-b border-primary/10 pb-1">
                      <span className="text-muted-foreground">Успешность:</span>
                      <span className="text-foreground">% ТОП-8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Чекаут:</span>
                      <span className="text-foreground">Max Hi-Out</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0 outline-none">
            {hasHistory ? (
              <div className="pt-2">
                <PlayerRatingChart tournaments={tournaments} hideHeader />
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm italic text-center px-4">
                Недостаточно данных для построения графика прогресса
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
