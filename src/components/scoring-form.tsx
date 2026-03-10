'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardFooter } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, Info } from 'lucide-react';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import type { ScoringSettings, LeagueId } from '@/lib/types';
import { useTransition } from 'react';
import { saveScoringSettings } from '@/app/actions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const scoringSchema = z.object({
  pointsFor1st: z.coerce.number().min(0, 'Должно быть положительным числом.'),
  pointsFor2nd: z.coerce.number().min(0, 'Должно быть положительным числом.'),
  pointsFor3rd_4th: z.coerce.number().min(0, 'Должно быть положительным числом.'),
  pointsFor5th_8th: z.coerce.number().min(0, 'Должно быть положительным числом.'),
  pointsFor9th_16th: z.coerce.number().min(0, 'Должно быть положительным числом.'),
  participationPoints: z.coerce.number().min(0, 'Должно быть положительным числом.'),

  enable180Bonus: z.boolean().default(false),
  bonusPer180: z.coerce.number().min(0, 'Должно быть положительным числом.'),

  enableHiOutBonus: z.boolean().default(false),
  hiOutThreshold: z.coerce.number().min(0, 'Должно быть положительным числом.'),
  hiOutBonus: z.coerce.number().min(0, 'Должно быть положительным числом.'),
  
  enableAvgBonus: z.boolean().default(false),
  avgThreshold: z.coerce.number().min(0, 'Должно быть положительным числом.').max(180, 'Не может быть больше 180.'),
  avgBonus: z.coerce.number().min(0, 'Должно быть положительным числом.'),

  enableShortLegBonus: z.boolean().default(false),
  shortLegThreshold: z.coerce.number().min(0, 'Должно быть положительным числом.'),
  shortLegBonus: z.coerce.number().min(0, 'Должно быть положительным числом.'),

  enable9DarterBonus: z.boolean().default(false),
  bonusFor9Darter: z.coerce.number().min(0, 'Должно быть положительным числом.'),
});

type ScoringFormValues = z.infer<typeof scoringSchema>;

interface ScoringFormProps {
  leagueId: LeagueId;
  defaultValues: ScoringFormValues;
}

const LabelWithTooltip = ({ label, tooltipText }: { label: string, tooltipText: string }) => (
    <div className="flex items-center gap-1.5">
        {label}
        <Tooltip>
            <TooltipTrigger asChild><Info className="h-3 w-3 cursor-help text-muted-foreground" /></TooltipTrigger>
            <TooltipContent><p>{tooltipText}</p></TooltipContent>
        </Tooltip>
    </div>
);


export function ScoringForm({ leagueId, defaultValues }: ScoringFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ScoringFormValues>({
    resolver: zodResolver(scoringSchema),
    defaultValues,
  });
  
  const { setValue, watch } = form;

  async function onSubmit(data: ScoringFormValues) {
    startTransition(async () => {
        try {
            const result = await saveScoringSettings(leagueId, data);
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
                description: 'Не удалось сохранить настройки. Проверьте подключение к базе.',
                variant: 'destructive',
            });
        }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TooltipProvider>
        <div className="space-y-8">
            <div>
                <h3 className="text-lg mb-2 font-medium">Баллы за место</h3>
                <p className="mb-4 text-sm text-muted-foreground">Настройте очки за занятые места в турнире.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="pointsFor1st" render={({ field }) => (<FormItem><FormLabel><LabelWithTooltip label="1-е место" tooltipText="Очки за победу в турнире." /></FormLabel><FormControl><Input type="number" {...field} className="bg-black/20" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="pointsFor2nd" render={({ field }) => (<FormItem><FormLabel><LabelWithTooltip label="2-е место" tooltipText="Очки за второе место." /></FormLabel><FormControl><Input type="number" {...field} className="bg-black/20" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="pointsFor3rd_4th" render={({ field }) => (<FormItem><FormLabel><LabelWithTooltip label="3-4 места" tooltipText="Очки за выход в полуфинал." /></FormLabel><FormControl><Input type="number" {...field} className="bg-black/20" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="pointsFor5th_8th" render={({ field }) => (<FormItem><FormLabel><LabelWithTooltip label="5-8 места" tooltipText="Очки за выход в четвертьфинал." /></FormLabel><FormControl><Input type="number" {...field} className="bg-black/20" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="pointsFor9th_16th" render={({ field }) => (<FormItem><FormLabel><LabelWithTooltip label="9-16 места" tooltipText="Очки за выход в 1/8 финала." /></FormLabel><FormControl><Input type="number" {...field} className="bg-black/20" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="participationPoints" render={({ field }) => (<FormItem><FormLabel><LabelWithTooltip label="За участие (остальные)" tooltipText="Очки для всех игроков, не попавших в ТОП-16." /></FormLabel><FormControl><Input type="number" {...field} className="bg-black/20" /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>

            <Separator className="opacity-20" />

            <div>
                <h3 className="text-lg mb-2 font-medium">Бонусы за статистику</h3>
                <p className="mb-4 text-sm text-muted-foreground">Включите и настройте бонусы за статистические достижения.</p>
                <div className="space-y-6">
                    <div className="flex flex-col space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
                        <FormField
                            control={form.control}
                            name="enable180Bonus"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between">
                                    <FormLabel><LabelWithTooltip label="Бонус за 180" tooltipText="Включает или выключает начисление бонусных очков за каждый 'максимум'." /></FormLabel>
                                    <FormControl><Switch checked={field.value} onCheckedChange={checked => {
                                        field.onChange(checked);
                                        if (!checked) setValue('bonusPer180', 0);
                                    }} /></FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bonusPer180"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground"><LabelWithTooltip label="Очки за каждый 180" tooltipText="Количество бонусных очков, начисляемых за каждый 'максимум'." /></FormLabel>
                                    <FormControl><Input type="number" placeholder="Кол-во очков" {...field} disabled={!watch('enable180Bonus')} className="bg-black/20" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex flex-col space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
                        <FormField
                            control={form.control}
                            name="enableHiOutBonus"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between">
                                    <FormLabel><LabelWithTooltip label="Бонус за Hi-Out" tooltipText="Включает или выключает бонус за высокое закрытие лега." /></FormLabel>
                                    <FormControl><Switch checked={field.value} onCheckedChange={checked => {
                                        field.onChange(checked);
                                        if (!checked) {
                                            setValue('hiOutThreshold', 0);
                                            setValue('hiOutBonus', 0);
                                        }
                                    }} /></FormControl>
                                </FormItem>
                            )}
                        />
                         <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="hiOutThreshold" render={({ field }) => (<FormItem><FormLabel className="text-xs text-muted-foreground"><LabelWithTooltip label="Порог" tooltipText="Минимальное значение закрытия (Hi-Out)." /></FormLabel><FormControl><Input type="number" placeholder="Мин. Hi-Out" {...field} disabled={!watch('enableHiOutBonus')} className="bg-black/20" /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="hiOutBonus" render={({ field }) => (<FormItem><FormLabel className="text-xs text-muted-foreground"><LabelWithTooltip label="Бонус" tooltipText="Количество бонусных очков за достижение порога Hi-Out." /></FormLabel><FormControl><Input type="number" placeholder="Кол-во очков" {...field} disabled={!watch('enableHiOutBonus')} className="bg-black/20" /></FormControl><FormMessage /></FormItem>)} />
                         </div>
                    </div>
                     <div className="flex flex-col space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
                        <FormField
                            control={form.control}
                            name="enableAvgBonus"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between">
                                    <FormLabel><LabelWithTooltip label="Бонус за средний набор (AVG)" tooltipText="Включает или выключает бонус за высокий средний набор." /></FormLabel>
                                    <FormControl><Switch checked={field.value} onCheckedChange={checked => {
                                        field.onChange(checked);
                                        if (!checked) {
                                            setValue('avgThreshold', 0);
                                            setValue('avgBonus', 0);
                                        }
                                    }} /></FormControl>
                                </FormItem>
                            )}
                        />
                         <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="avgThreshold" render={({ field }) => (<FormItem><FormLabel className="text-xs text-muted-foreground"><LabelWithTooltip label="Порог" tooltipText="Минимальное значение AVG за турнир." /></FormLabel><FormControl><Input type="number" step="0.01" placeholder="Мин. AVG" {...field} disabled={!watch('enableAvgBonus')} className="bg-black/20" /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="avgBonus" render={({ field }) => (<FormItem><FormLabel className="text-xs text-muted-foreground"><LabelWithTooltip label="Бонус" tooltipText="Количество бонусных очков за достижение порога AVG." /></FormLabel><FormControl><Input type="number" placeholder="Кол-во очков" {...field} disabled={!watch('enableAvgBonus')} className="bg-black/20" /></FormControl><FormMessage /></FormItem>)} />
                         </div>
                    </div>
                </div>
            </div>
        </div>
        </TooltipProvider>
        <CardFooter className="mt-8 px-0">
          <Button type="submit" disabled={!form.formState.isDirty || isPending} className="ml-auto h-12 px-8 shadow-xl shadow-primary/30 active:scale-95 transition-all">
            {isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="mr-2" />
                Сохранить настройки
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}