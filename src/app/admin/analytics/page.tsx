import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Handshake, Users, Trash2 } from 'lucide-react';
import { getVisitStats, getSponsorClickStats } from '@/lib/analytics';
import { AnalyticsDashboard } from './analytics-dashboard';
import { SponsorAnalyticsDashboard } from './sponsor-analytics-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClearAnalyticsButton } from './clear-analytics-button';


export default async function AnalyticsPage() {
  const visitStats = await getVisitStats();
  const sponsorStats = await getSponsorClickStats();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="glassmorphism">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
                <BarChart className="text-primary" />
                Аналитика
            </CardTitle>
            <CardDescription>
                Статистика по посещениям сайта и кликам на спонсорские ссылки.
            </CardDescription>
          </div>
          <ClearAnalyticsButton />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="visits" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="visits" className="gap-2">
                <Users className="h-4 w-4" />
                Посещения
              </TabsTrigger>
              <TabsTrigger value="sponsors" className="gap-2">
                <Handshake className="h-4 w-4" />
                Спонсоры
              </TabsTrigger>
            </TabsList>
            <TabsContent value="visits">
              <AnalyticsDashboard initialStats={visitStats} />
            </TabsContent>
            <TabsContent value="sponsors">
              <SponsorAnalyticsDashboard initialStats={sponsorStats} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
