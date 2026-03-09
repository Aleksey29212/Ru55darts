import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AdminProvider } from '@/context/admin-context';
import { Inter } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase';
import {
  getBackgroundUrl,
  getSponsorshipSettings,
  getAllScoringSettings,
  getLeagueSettings,
} from '@/lib/settings';
import { AdminLoginTrigger } from '@/components/admin-login';
import { VisitLogger } from '@/components/visit-logger';
import { MainLayout } from '@/components/main-layout';
import type { LeagueId } from '@/lib/types';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'DartBrig Pro',
  description: 'Professional Darts Tournament Management',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let backgroundUrl = '';
  let sponsorshipSettings: any = { groupVkLink: 'https://vk.ru/dartbrig' };
  let allScoringSettings: any = {};
  let leagueSettings: any = { general: { name: 'Глобальный рейтинг', enabled: true } };

  try {
    const results = await Promise.all([
      getBackgroundUrl(),
      getSponsorshipSettings(),
      getAllScoringSettings(),
      getLeagueSettings(),
    ]);
    backgroundUrl = results[0];
    sponsorshipSettings = results[1];
    allScoringSettings = results[2];
    leagueSettings = results[3];
  } catch (error) {
    console.error('Failed to fetch initial settings in RootLayout:', error);
  }

  // Подготовка данных для справки (все включенные лиги)
  const enabledLeagues = (Object.keys(leagueSettings) as LeagueId[]).filter(
    (id) => leagueSettings[id]?.enabled || id === 'general'
  );
  
  const helpSettings = enabledLeagues.map(id => ({
    ...allScoringSettings[id],
    id
  }));
  
  const helpLeagueNames = enabledLeagues.map(id => leagueSettings[id]?.name || id);
  const generalLeagueName = leagueSettings.general?.name || 'Глобальный рейтинг';

  return (
    <html
      lang="ru"
      className={cn('dark', inter.variable)}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Russo+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn('font-body antialiased min-h-screen bg-background relative')}
        suppressHydrationWarning
      >
        <FirebaseClientProvider>
          <AdminProvider>
            <MainLayout
              backgroundUrl={backgroundUrl}
              sponsorshipSettings={sponsorshipSettings}
              scoringSettings={helpSettings}
              leagueName={helpLeagueNames}
            >
              {children}
            </MainLayout>
            <Toaster />
            <AdminLoginTrigger />
          </AdminProvider>
        </FirebaseClientProvider>
        <VisitLogger />
      </body>
    </html>
  );
}
