'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import type { Player } from '@/lib/types';
import { useMemo } from 'react';

const chartConfig = {
  value: {
    label: 'Значение',
    color: 'hsl(var(--primary))',
  },
};

const calculateAggregateStats = (player: Player) => {
    const power = Math.min(100, (Number(player.avg) || 0) * 1.2 + (Number(player.n180s) || 0) * 2);
    const finishing = Math.min(100, (Number(player.hiOut) || 0) / 1.7);
    const legQuality = player.bestLeg > 0 ? (100 * 36) / (player.bestLeg - 9 + 36) : 0;

    return [
        { subject: 'Набор', value: power, fullMark: 100 },
        { subject: 'Чекаут', value: finishing, fullMark: 100 },
        { subject: 'Лег', value: legQuality, fullMark: 100 },
    ];
};

const calculateSingleTournamentStats = (player: Player) => {
    const avg = Math.min(100, (Number(player.avg) / 100) * 100);
    const powerScoring = Math.min(100, (Number(player.n180s) || 0) * 20);
    const finishing = Math.min(100, (Number(player.hiOut) || 0) / 1.7); // 170 is max
    const legQuality = player.bestLeg > 0 ? (100 * 36) / (player.bestLeg - 9 + 36) : 0; // x=9 -> 100, x=12 -> ~92

    return [
        { subject: 'Ср. набор', value: avg, fullMark: 100 },
        { subject: '180-ки', value: powerScoring, fullMark: 100 },
        { subject: 'Лучший лег', value: legQuality, fullMark: 100 },
        { subject: 'Чекаут', value: finishing, fullMark: 100 },
    ];
}


export function PlayerRadarChart({ player, viewMode }: { player: Player, viewMode: 'aggregate' | 'single' }) {
  const radarData = useMemo(() => {
    if (viewMode === 'single') {
        return calculateSingleTournamentStats(player);
    }
    return calculateAggregateStats(player);
  }, [player, viewMode]);

  return (
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-[250px] w-full"
      >
        <RadarChart
          data={radarData}
          outerRadius="60%"
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <PolarGrid gridType="polygon" className="stroke-border/50" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 10, fontWeight: 500 }} 
          />
          <Radar
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            strokeWidth={2}
            fillOpacity={0.4}
            dot={{ r: 3, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
          />
        </RadarChart>
      </ChartContainer>
  );
}
