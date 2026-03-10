'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image } from 'lucide-react';
import { BackgroundForm } from './background-form';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function BackgroundPage() {
  const db = useFirestore();
  const backgroundRef = useMemoFirebase(() => db ? doc(db, 'app_settings', 'background') : null, [db]);
  const { data: backgroundData, isLoading } = useDoc<{ url: string }>(backgroundRef);
  
  const backgroundUrl = backgroundData?.url || '';

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Image className="text-primary" />
            Управление фоном
          </CardTitle>
          <CardDescription>
            Задайте URL-адрес фонового изображения для всего сайта или загрузите свой файл. Оставьте поле пустым, чтобы убрать фон.
          </CardDescription>
        </CardHeader>
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="p-4 border rounded-lg bg-muted/50 mt-4">
                <Skeleton className="h-40 w-full" />
            </div>
             <div className="flex justify-end mt-6">
                <Skeleton className="h-10 w-48" />
             </div>
          </div>
        ) : (
          <BackgroundForm currentUrl={backgroundUrl} />
        )}
      </Card>
    </div>
  );
}
