'use client';

import type { VisitStats } from '@/lib/analytics';
import { CardContent } from '@/components/ui/card';
import { Users, Calendar, CalendarDays, CalendarClock } from 'lucide-react';
import { Card } from '@/components/ui/card';

function StatCard({ title, value, icon: Icon, description }: { title: string, value: number, icon: React.ElementType, description: string }) {
  return (
    <div className="p-6 rounded-lg border bg-card/50 flex items-start gap-4 hover:border-primary/50 transition-colors">
      <div className="bg-primary/20 text-primary p-3 rounded-lg">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold">{value.toLocaleString('ru-RU')}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  )
}

export function AnalyticsDashboard({ initialStats }: { initialStats: VisitStats }) {
  // For now, this component just displays the stats passed from the server component.
  // It could be extended in the future to fetch real-time updates.
  const stats = initialStats;

  return (
    <Card className="glassmorphism mt-4">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <StatCard title="Сегодня" value={stats.day} icon={CalendarClock} description="Сессий за последние 24 часа" />
            <StatCard title="Неделя" value={stats.week} icon={Calendar} description="Сессий за последние 7 дней" />
            <StatCard title="Год" value={stats.year} icon={CalendarDays} description="Сессий за последние 365 дней" />
            <StatCard title="Всего" value={stats.total} icon={Users} description="Всего сессий за все время" />
        </CardContent>
    </Card>
  );
}
