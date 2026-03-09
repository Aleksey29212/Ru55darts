'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, CartesianGrid, XAxis, YAxis, Line, ComposedChart } from 'recharts';
import type { PlayerTournamentHistory } from '@/lib/types';
import { Activity } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const chartConfig = {
  points: {
    label: 'Результат',
    color: 'hsl(var(--primary))',
  },
  projection: {
    label: 'Цель',
    color: 'hsl(var(--accent))',
  }
};

export function PlayerRatingChart({ tournaments, hideHeader = false }: { tournaments: PlayerTournamentHistory[], hideHeader?: boolean }) {
  const chartData = useMemo(() => {
    // Вспомогательная функция для получения времени в мс из разных типов дат
    const getTime = (dateSource: any) => {
        if (!dateSource) return 0;
        if (typeof dateSource === 'object' && 'seconds' in dateSource) return dateSource.seconds * 1000;
        return new Date(dateSource).getTime();
    };

    // 1. Нулевая точка (Старт)
    const startData = {
        date: 'Старт',
        points: 0,
        name: 'Начало карьеры',
        isProjection: false,
    };

    if (tournaments.length === 0) return [startData];

    // 2. Сортировка по реальным датам турниров (восхождение)
    const sortedTournaments = [...tournaments].sort((a, b) => {
        return getTime(a.tournamentDate) - getTime(b.tournamentDate);
    });

    const actualData = sortedTournaments.map(t => ({
        date: formatDate(t.tournamentDate),
        points: t.playerPoints,
        name: t.tournamentName,
        isProjection: false,
    }));

    // 3. Расчет прогноза (Пунктирная линия)
    const lastPointValue = actualData[actualData.length - 1].points;
    const projectionValue = Math.round(lastPointValue * 1.15 + 5); 

    // Соединяем реальные данные с линией прогноза в последней точке
    (actualData[actualData.length - 1] as any).projection = lastPointValue;

    const projectionData = {
        date: 'Цель',
        projection: projectionValue,
        name: 'Прогноз на след. турнир',
        isProjection: true,
    };

    return [startData, ...actualData, projectionData];
  }, [tournaments]);

  const chart = (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ComposedChart
        data={chartData}
        margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={10}
        />
        <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={10}
            domain={[0, 'auto']} 
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, name, props) => {
                // Предотвращаем дублирование турнира в подсказке, 
                // если точка общая для Area и Line
                if (name === 'projection' && !props.payload.isProjection) {
                    return null;
                }

                return (
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-[10px] md:text-xs leading-tight max-w-[200px] break-words">
                        {props.payload.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {props.payload.isProjection 
                          ? `Цель: ${value} баллов` 
                          : `${value} баллов`}
                    </p>
                  </div>
                );
              }}
              labelClassName="hidden"
              indicator="dot"
            />
          }
        />
        <defs>
            <linearGradient id="fillPoints" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
            </linearGradient>
        </defs>
        
        <Area
          type="monotone"
          dataKey="points"
          stroke="hsl(var(--primary))"
          fill="url(#fillPoints)"
          strokeWidth={3}
          connectNulls
          activeDot={{ r: 6, strokeWidth: 0 }}
        />

        <Line
            type="monotone"
            dataKey="projection"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            strokeDasharray="6 4" 
            dot={{ r: 4, fill: 'hsl(var(--accent))', strokeWidth: 2 }}
            connectNulls
        />
      </ComposedChart>
    </ChartContainer>
  );

  if (hideHeader) return chart;

  return (
    <Card className="glassmorphism">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="text-primary"/>
            Динамика результатов
        </CardTitle>
        <CardDescription>
            История выступлений с прогнозом роста.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chart}
      </CardContent>
    </Card>
  );
}