'use client';

import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Handshake, Settings } from 'lucide-react';
import { PartnerList } from './partner-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SponsorshipSettingsForm } from './sponsorship-settings-form';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { SponsorshipSettings } from '@/lib/types';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ClearPartnersButton } from './clear-partners-button';

const defaultSponsorshipSettings: SponsorshipSettings = {
    adminTelegramLink: 'https://t.me/+guTrCGUrh4gxNGZi',
    groupTelegramLink: 'https://t.me/+guTrCGUrh4gxNGZi',
    adminVkLink: 'https://vk.ru/dartbrig',
    groupVkLink: 'https://vk.ru/dartbrig',
    showSponsorsInProfile: true,
    showSponsorshipCallToAction: true,
    sponsorTemplate: 'default',
};

export default function PartnersPage() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => db ? doc(db, 'app_settings', 'sponsorship') : null, [db]);
  const { data: settingsFromDb, isLoading } = useDoc<SponsorshipSettings>(settingsRef);
  
  const mergedSettings = useMemo(() => {
      return { ...defaultSponsorshipSettings, ...settingsFromDb };
  }, [settingsFromDb]);

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="glassmorphism">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
                <Handshake className="text-primary" />
                Управление партнерами и спонсорством
            </CardTitle>
            <CardDescription>
                Добавляйте партнеров и настраивайте ссылки для привлечения новых спонсоров.
            </CardDescription>
          </div>
          <ClearPartnersButton />
        </CardHeader>
        
        <Tabs defaultValue="list" className="w-full">
            <div className="px-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="list" className="gap-2">
                        <Handshake className="h-4 w-4" />
                        Список партнеров
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Настройки связи
                    </TabsTrigger>
                </TabsList>
            </div>
            
            <TabsContent value="list" className="mt-4">
                <PartnerList />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-4">
                <CardContent>
                    {isLoading ? (
                         <div className="space-y-6 py-4">
                            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-1">
                                    <Skeleton className="h-6 w-52" />
                                    <Skeleton className="h-4 w-64" />
                                </div>
                                <Skeleton className="h-6 w-12" />
                            </div>
                             <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-1">
                                    <Skeleton className="h-6 w-56" />
                                    <Skeleton className="h-4 w-72" />
                                </div>
                                <Skeleton className="h-6 w-12" />
                            </div>
                            <div className="grid md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-6"><Skeleton className="h-6 w-24" /><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
                                <div className="space-y-6"><Skeleton className="h-6 w-24" /><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
                            </div>
                         </div>
                    ) : (
                        <SponsorshipSettingsForm initialSettings={mergedSettings} />
                    )}
                </CardContent>
            </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
