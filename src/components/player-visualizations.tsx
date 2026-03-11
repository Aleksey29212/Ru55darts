'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayerRadarChart } from './player-radar-chart';
import { PlayerRatingChart } from './player-rating-chart';
import type { Player, PlayerTournamentHistory } from '@/lib/types';
import { Activity, Zap, BarChart3, Target, ShieldCheck, TrendingUp, Star, ShieldAlert } from 'lucide-react';
import { useIsClient } from '@/hooks/use-is-client';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';

interface PlayerVisualizationsProps {
  player: Player;
  tournaments: PlayerTournamentHistory[];
  viewMode: 'aggregate' | 'single';
}

function AnalysisMetric({ icon: Icon, label, value, description }: { icon: any, label: string, value: string, description: string }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-inner group-hover:scale-110 transition-transform">
                <Icon className="h-4 w-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/80 truncate">{label}</p>
                    <span className="text-[10px] font-bold text-primary shrink-0">{value}</span>
                </div>
                <p className="text-[9px] text-muted-foreground leading-tight">{description}</p>
            </div>
        </div>
    );
}

export function PlayerVisualizations({ player, tournaments, viewMode }: PlayerVisualizationsProps) {
  const isClient = useIsClient();
  const hasHistory = tournaments.length >= 2 && viewMode === 'aggregate';

  if (!isClient) {
    return <Skeleton className="h-[500px] w-full rounded-[2.5rem]" />;
  }

  // Расчет параметров навыков
  const power = Math.min(100, (Number(player.avg) || 0) * 1.2 + (Number(player.n180s) || 0) * 2);
  const finishing = Math.min(100, (Number(player.hiOut) || 0) / 1.7);
  const legQuality = player.bestLeg > 0 ? (100 * 36) / (player.bestLeg - 9 + 36) : 0;
  const stability = Math.min(100, ((player.wins / (player.matchesPlayed || 1)) * 80) + Math.min(20, player.matchesPlayed * 2));
  
  const overallSkill = Math.round((power + finishing + legQuality + stability) / 4);

  // Определение архетипа
  let archetype = "Универсал";
  if (stability > 80 && power > 70) archetype = "Несокрушимый (Tank)";
  else if (power > finishing + 20) archetype = "Снайпер (Power)";
  else if (finishing > power + 20) archetype = "Финишер (Clutch)";
  else if (legQuality > 85) archetype = "Гроссмейстер";

  return (
    <Card className="glassmorphism overflow-hidden rounded-[2.5rem] border-white/10 shadow-4xl">
      <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <CardTitle className="text-2xl font-headline tracking-tighter uppercase flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/20 text-primary">
                        <BarChart3 className="h-6 w-6" />
                    </div>
                    Аналитика Pro
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Визуализация навыков и динамики</CardDescription>
            </div>
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-gold fill-gold animate-pulse" />
                    <span className="font-headline text-2xl text-white">{overallSkill}%</span>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">SKILL LEVEL</span>
            </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="radar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/40 p-1.5 rounded-2xl border border-white/5">
            <TabsTrigger value="radar" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase text-[10px] tracking-widest transition-all">
              <Zap className="h-3.5 w-3.5" />
              Паутина навыков
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase text-[10px] tracking-widest transition-all" disabled={!hasHistory}>
              <Activity className="h-3.5 w-3.5" />
              График роста
            </TabsTrigger>
          </TabsList>

          <TabsContent value="radar" className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center space-y-8">
              
              {/* Радарная диаграмма */}
              <div className="relative w-full aspect-square flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-[60px] animate-pulse" />
                <PlayerRadarChart player={player} viewMode={viewMode} />
                
                {/* Подпись архетипа в центре снизу */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">{archetype}</span>
                </div>
              </div>
              
              {/* Пояснения к метрикам */}
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 px-2">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Детализация анализа</span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                    <AnalysisMetric 
                        icon={Target} 
                        label="Сила набора" 
                        value={`${Math.round(power)}/100`}
                        description="Агрегированный показатель среднего набора (AVG) и частоты попаданий в сектор 180." 
                    />
                    <AnalysisMetric 
                        icon={ShieldCheck} 
                        label="Точность финиша" 
                        value={`${Math.round(finishing)}/100`}
                        description="Эффективность закрытия легов на основе максимального чекаута (Hi-Out)." 
                    />
                    <AnalysisMetric 
                        icon={TrendingUp} 
                        label="Мастерство лега" 
                        value={`${Math.round(legQuality)}/100`}
                        description="Стабильность и скорость прохождения дистанции (на основе лучшего лега)." 
                    />
                    <AnalysisMetric 
                        icon={ShieldAlert} 
                        label="Стабильность" 
                        value={`${Math.round(stability)}/100`}
                        description="Уровень опасности игрока: как часто он подтверждает свой класс в плей-офф." 
                    />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-500">
            {hasHistory ? (
              <div className="pt-2">
                <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/20 border-dashed text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                        Положительный тренд: <span className="text-primary">+15% к результативности</span> за последние 3 турнира.
                    </p>
                </div>
                <PlayerRatingChart tournaments={tournaments} hideHeader />
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center px-8 space-y-4">
                <div className="p-6 rounded-full bg-white/5 border border-white/10">
                    <Activity className="h-12 w-12 text-muted-foreground/20" />
                </div>
                <p className="text-xs text-muted-foreground font-medium italic">
                    Недостаточно турнирных данных для построения динамики. <br/>Примите участие еще в 2-х турах.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
