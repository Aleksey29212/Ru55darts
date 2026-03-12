'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, AlertTriangle, Image as ImageIcon, Upload } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { AllLeagueSettings, LeagueId } from '@/lib/types';
import { useTransition, useEffect, useRef } from 'react';
import { saveLeagueSettings } from '@/app/actions';
import Image from 'next/image';

const leagueSchema = z.object({
  name: z.string().min(1, 'Название не может быть пустым.'),
  enabled: z.boolean(),
  includeInGeneralRanking: z.boolean(),
  bannerUrl: z.string().optional(),
});

const allLeaguesSchema = z.object({
  general: leagueSchema,
  evening_omsk: leagueSchema,
  premier: leagueSchema,
  first: leagueSchema,
  cricket: leagueSchema,
  second: leagueSchema,
  third: leagueSchema,
  fourth: leagueSchema,
  senior: leagueSchema,
  youth: leagueSchema,
  women: leagueSchema,
});

type LeagueFormValues = z.infer<typeof allLeaguesSchema>;

interface LeagueSettingsFormProps {
  defaultValues: LeagueFormValues;
}

const leagueIds: LeagueId[] = ['general', 'evening_omsk', 'premier', 'first', 'cricket', 'second', 'third', 'fourth', 'senior', 'youth', 'women'];

export function LeagueSettingsForm({ defaultValues }: LeagueSettingsFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const form = useForm<LeagueFormValues>({
    resolver: zodResolver(allLeaguesSchema),
    defaultValues,
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  async function onSubmit(data: LeagueFormValues) {
    startTransition(async () => {
        try {
            const result = await saveLeagueSettings(data);
            if (result.success) {
                toast({
                    title: 'Успешно сохранено',
                    description: result.message,
                    variant: 'default',
                });
                form.reset(data);
            } else {
                toast({
                    title: 'Ошибка сохранения',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Ошибка сервера',
                description: 'Не удалось сохранить настройки. Проверьте соединение.',
                variant: 'destructive',
            });
        }
    });
  }

  const handleFileSelect = (leagueId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue(`${leagueId as any}.bannerUrl`, reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onInvalid = () => {
    toast({
        title: 'Ошибка заполнения',
        description: 'Пожалуйста, проверьте названия всех лиг. Поле не может быть пустым.',
        variant: 'destructive',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="pb-32">
        <CardContent className="space-y-6 pt-6 px-4 md:px-6">
          {isDirty && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-amber-500 text-sm animate-in fade-in slide-in-from-top-1">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span className="font-medium">У вас есть несохраненные изменения в настройках лиг.</span>
            </div>
          )}
          {leagueIds.map((leagueId) => (
            <div key={leagueId} className="flex flex-col space-y-6 rounded-2xl border bg-card/30 p-4 md:p-6 transition-all hover:border-primary/30">
              <FormField
                control={form.control}
                name={`${leagueId}.enabled`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0">
                    <FormLabel className="text-lg md:text-xl font-headline tracking-tight uppercase cursor-pointer">{defaultValues[leagueId].name}</FormLabel>
                    <FormControl>
                        <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange} 
                            className="data-[state=checked]:bg-primary"
                        />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name={`${leagueId}.name`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Название для вкладки</FormLabel>
                            <FormControl>
                                <Input 
                                    {...field} 
                                    value={field.value ?? ''}
                                    disabled={!form.watch(`${leagueId}.enabled`)} 
                                    className="bg-background/50 border-white/5 rounded-xl h-12"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={`${leagueId}.bannerUrl`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Обложка лиги (URL или загрузка)</FormLabel>
                            <div className="flex gap-2">
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        value={field.value ?? ''}
                                        disabled={!form.watch(`${leagueId}.enabled`)} 
                                        placeholder="https://images.unsplash.com/..."
                                        className="bg-background/50 border-white/5 rounded-xl h-12"
                                    />
                                </FormControl>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="rounded-xl h-12 px-4"
                                    disabled={!form.watch(`${leagueId}.enabled`)}
                                    onClick={() => fileInputRefs.current[leagueId]?.click()}
                                >
                                    <Upload className="h-4 w-4" />
                                </Button>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    ref={el => fileInputRefs.current[leagueId] = el}
                                    onChange={(e) => handleFileSelect(leagueId, e)}
                                />
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>

                <div className="relative aspect-[3/1] md:aspect-auto md:h-full rounded-xl overflow-hidden border border-white/10 bg-muted/20">
                    {form.watch(`${leagueId}.bannerUrl`) ? (
                        <Image 
                            src={form.watch(`${leagueId}.bannerUrl`)!} 
                            alt="Preview" 
                            fill 
                            className="object-cover"
                            unoptimized={form.watch(`${leagueId}.bannerUrl`)?.startsWith('data:')}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Preview Area</span>
                        </div>
                    )}
                </div>
              </div>

               {leagueId !== 'general' && (
                <FormField
                    control={form.control}
                    name={`${leagueId}.includeInGeneralRanking`}
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-white/5 bg-black/20 p-4 shadow-inner">
                        <div className="space-y-0.5 flex-1 pr-4">
                            <FormLabel className="text-sm font-bold">Учитывать в общем рейтинге</FormLabel>
                            <FormDescription className="text-xs text-muted-foreground">
                                Очки этой лиги будут суммироваться в глобальном зачете.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!form.watch(`${leagueId}.enabled`)}
                            />
                        </FormControl>
                    </FormItem>
                    )}
                />
               )}
            </div>
          ))}
        </CardContent>
        <CardFooter className="fixed bottom-0 left-0 right-0 md:left-[var(--sidebar-width)] bg-background/95 backdrop-blur-xl pt-4 pb-10 px-6 border-t border-white/10 z-[60] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-2xl mx-auto w-full flex justify-end">
            <Button 
                type="submit" 
                disabled={!isDirty || isPending} 
                className="w-full sm:w-auto h-14 px-10 rounded-2xl shadow-2xl shadow-primary/30 font-bold text-lg transition-all active:scale-95 disabled:opacity-50"
            >
                {isPending ? (
                <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Сохранение...
                </>
                ) : (
                <>
                    <Save className="h-5 w-5 mr-2" />
                    Сохранить настройки
                </>
                )}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Form>
  );
}
