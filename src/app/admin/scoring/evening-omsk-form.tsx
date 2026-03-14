'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, Info, Sparkles, Wallet } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import type { ScoringSettings } from '@/lib/types';
import { useTransition } from 'react';
import { saveScoringSettings } from '@/app/actions';
import { Separator } from '@/components/ui/separator';

const eveningOmskSchema = z.object({
  exchangeRate: z.coerce.number().min(5).max(15),
  isEveningOmsk: z.boolean().default(true),
});

type EveningOmskFormValues = z.infer<typeof eveningOmskSchema>;

interface EveningOmskFormProps {
  defaultValues: ScoringSettings;
  leagueName: string;
}

export function EveningOmskForm({ defaultValues, leagueName }: EveningOmskFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<EveningOmskFormValues>({
    resolver: zodResolver(eveningOmskSchema),
    defaultValues: {
        exchangeRate: defaultValues.exchangeRate || 7,
        isEveningOmsk: true
    },
  });

  async function onSubmit(data: EveningOmskFormValues) {
    startTransition(async () => {
        try {
            const fullData: ScoringSettings = {
                ...defaultValues,
                ...data,
                id: 'evening_omsk' as any
            };
            const result = await saveScoringSettings('evening_omsk', fullData);
            toast({
                title: result.success ? 'Успешно' : 'Ошибка',
                description: result.message,
                variant: result.success ? 'default' : 'destructive',
            });
            if (result.success) {
                form.reset(data);
            }
        } catch (e) {
            toast({
                title: 'Ошибка сервера',
                description: 'Не удалось сохранить настройки.',
                variant: 'destructive',
            });
        }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/20">
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-orange-500/20 text-orange-500">
                    <Info className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg md:text-xl font-headline uppercase tracking-tight text-orange-500">Автоматическая система ({leagueName})</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Для лиги «{leagueName}» правила начисления очков фиксированы согласно регламенту:
                    </p>
                    <ul className="text-xs space-y-1 pt-2 list-disc list-inside text-muted-foreground opacity-80">
                        <li>1/4 финала: <span className="text-foreground font-bold">AVG × 0.25</span></li>
                        <li>1/2 финала: <span className="text-foreground font-bold">AVG × 0.50</span></li>
                        <li>2-е место: <span className="text-foreground font-bold">AVG × 0.70</span></li>
                        <li>1-е место: <span className="text-foreground font-bold">AVG × 1.00</span></li>
                        <li>В зачет идут <span className="text-foreground font-bold">5 лучших туров</span> (если сыграно 6+)</li>
                    </ul>
                </div>
            </div>
        </div>

        <Separator />

        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Финансовые настройки ({leagueName})</h3>
            </div>
            
            <FormField
                control={form.control}
                name="exchangeRate"
                render={({ field }) => (
                    <FormItem className="space-y-4">
                        <div className="flex items-center justify-between">
                            <FormLabel className="text-base">Курс обмена баллов (₽)</FormLabel>
                            <span className="text-2xl font-headline text-primary">{field.value} ₽</span>
                        </div>
                        <FormControl>
                            <Slider
                                min={5}
                                max={15}
                                step={1}
                                value={[field.value]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                                className="py-4"
                            />
                        </FormControl>
                        <FormDescription>
                            Задайте стоимость 1 рейтингового балла в рублях для лиги «{leagueName}».
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <p className="text-xs text-muted-foreground italic">
                Рейтинг ТОП-16 финалистов и суммы выплат будут автоматически отображаться на главной странице {leagueName} в реальном времени.
            </p>
        </div>

        <CardFooter className="fixed bottom-0 left-0 right-0 md:left-[var(--sidebar-width)] bg-background/95 backdrop-blur-xl py-3 px-6 border-t border-white/10 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="max-w-4xl mx-auto w-full flex justify-end">
                <Button type="submit" disabled={!form.formState.isDirty || isPending} className="h-12 px-10 rounded-xl shadow-2xl shadow-primary/30 font-black text-sm uppercase tracking-widest transition-all active:scale-95">
                    {isPending ? <><Loader2 className="animate-spin mr-3 h-5 w-5" /> СОХРАНЕНИЕ...</> : <><Save className="mr-3 h-5 w-5" /> УТВЕРДИТЬ КУРС</>}
                </Button>
            </div>
        </CardFooter>
      </form>
    </Form>
  );
}
