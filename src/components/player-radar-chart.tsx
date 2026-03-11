'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, PolarRadiusAxis } from 'recharts';
import type { Player } from '@/lib/types';
import { useMemo } from 'react';

const chartConfig = {
  value: {
    label: 'Рейтинг',
    color: 'hsl(var(--primary))',
  },
};

const calculateAggregateStats = (player: Player) => {
    // Расчет силы набора (AVG + 180s)
    const power = Math.min(100, (Number(player.avg) || 0) * 1.2 + (Number(player.n180s) || 0) * 2);
    // Расчет точности финиша (Hi-Out)
    const finishing = Math.min(100, (Number(player.hiOut) || 0) / 1.7);
    // Расчет мастерства лега (Best Leg)
    const legQuality = player.bestLeg > 0 ? (100 * 36) / (player.bestLeg - 9 + 36) : 0;
    // НОВЫЙ ЭЛЕМЕНТ: Стабильность (Win Rate + Опыт)
    const stability = Math.min(100, ((player.wins / (player.matchesPlayed || 1)) * 80) + Math.min(20, player.matchesPlayed * 2));

    return [
        { subject: 'НАБОР', value: power, fullMark: 100 },
        { subject: 'ЧЕКАУТ', value: finishing, fullMark: 100 },
        { subject: 'ЛЕГ', value: legQuality, fullMark: 100 },
        { subject: 'СТАБИЛЬНОСТЬ', value: stability, fullMark: 100 },
    ];
};

const calculateSingleTournamentStats = (player: Player) => {
    const avg = Math.min(100, (Number(player.avg) / 100) * 100);
    const powerScoring = Math.min(100, (Number(player.n180s) || 0) * 20);
    const finishing = Math.min(100, (Number(player.hiOut) || 0) / 1.7); 
    const legQuality = player.bestLeg > 0 ? (100 * 36) / (player.bestLeg - 9 + 36) : 0;

    return [
        { subject: 'AVG', value: avg, fullMark: 100 },
        { subject: '180', value: powerScoring, fullMark: 100 },
        { subject: 'ЛЕГ', value: legQuality, fullMark: 100 },
        { subject: 'ФИНИШ', value: finishing, fullMark: 100 },
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
        className="mx-auto aspect-square h-[320px] w-full"
      >
        <RadarChart
          data={radarData}
          outerRadius="75%"
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" className="glassmorphism border-primary/50" />}
          />
          <PolarGrid gridType="polygon" className="stroke-white/10" strokeWidth={1} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ 
                fill: 'rgba(255,255,255,0.6)', 
                fontSize: 10, 
                fontWeight: 900,
                letterSpacing: '0.1em'
            }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Skill"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            strokeWidth={3}
            fillOpacity={0.3}
            dot={{ 
                r: 5, 
                fill: 'hsl(var(--primary))', 
                stroke: '#000', 
                strokeWidth: 2,
                className: "drop-shadow-[0_0_10px_hsl(var(--primary))]"
            }}
            activeDot={{ r: 8, strokeWidth: 0 }}
          />
        </RadarChart>
      </ChartContainer>
  );
}
