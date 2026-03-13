
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, Info, PlusCircle, Trash2, ListOrdered, Sparkles, Zap, Target, TrendingUp, Trophy, Flame, Star, Crown, Activity, HelpCircle, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { ScoringSettings, LeagueId } from '@/lib/types';
import { useTransition, useEffect, useMemo, useState } from 'react';
import { saveScoringSettings } from '@/app/actions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const scoringSchema = z.object({
  pointsFor1st: z.coerce.number().min(0).default(0),
  pointsFor2nd: z.coerce.number().min(0).default(0),
  pointsFor3rd: z.coerce.number().min(0).default(0),
  pointsFor3rd_4th: z.coerce.number().min(0).default(0),
  
  pointsFor5th: z.coerce.number().min(0).default(0),
  pointsFor6th: z.coerce.number().min(0).default(0),
  pointsFor7th: z.coerce.number().min(0).default(0),
  pointsFor8th: z.coerce.number().min(0).default(0),
  pointsFor9th: z.coerce.number().min(0).default(0),
  pointsFor10th: z.coerce.number().min(0).default(0),

  pointsFor5th_8th: z.coerce.number().min(0).default(0),
  pointsFor9th_16th: z.coerce.number().min(0).default(0),
  participationPoints: z.coerce.number().min(0).default(0),

  enable180Bonus: z.boolean().default(false),
  bonusPer180: z.coerce.number().min(0).default(0),

  enableHiOutBonus: z.boolean().default(false),
  hiOutThreshold: z.coerce.number().min(0).default(0),
  hiOutBonus: z.coerce.number().min(0).default(0),
  
  enableAvgBonus: z.boolean().default(false),
  avgThreshold: z.coerce.number().min(0).max(180).default(0),
  avgBonus: z.coerce.number().min(0).default(0),

  enableShortLegBonus: z.boolean().default(false),
  shortLegThreshold: z.coerce.number().min(9).max(30).default(15),
  shortLegBonus: z.coerce.number().min(0).default(0),

  enable9DarterBonus: z.boolean().default(false),
  bonusFor9Darter: z.coerce.number().min(0).default(0),
  
  customPointsByPlace: z.record(z.string(), z.coerce.number()).optional(),
});

type ScoringFormValues = z.infer<typeof scoringSchema>;

const LabelWithTooltip = ({ label, tooltipText, icon: Icon = Info }: { label: string, tooltipText: string, icon?: any }) => (
    <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-primary/60" />
        <span className="font-bold text-xs">{label}</span>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild><HelpCircle className="h-2.5 w-2.5 cursor-help text-muted-foreground opacity-50 hover:text-primary transition-colors" /></TooltipTrigger>
                <TooltipContent className="max-w-[250px] p-4 bg-black/95 backdrop-blur-3xl border-primary/20 rounded-xl shadow-2xl">
                    <p className="text-xs leading-relaxed font-medium">{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
);

export function ScoringForm({ leagueId, defaultValues }: { leagueId: LeagueId, defaultValues: ScoringSettings }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [customPlaces, setCustomPlaces] = useState<{place: string, points: number}[]>([]);

  const safeDefaultValues = useMemo(() => ({
    pointsFor1st: defaultValues?.pointsFor1st ?? 0,
    pointsFor2nd: defaultValues?.pointsFor2nd ?? 0,
    pointsFor3rd: defaultValues?.pointsFor3rd ?? 0,
    pointsFor3rd_4th: defaultValues?.pointsFor3rd_4th ?? 0,
    
    pointsFor5th: defaultValues?.pointsFor5th ?? 0,
    pointsFor6th: defaultValues?.pointsFor6th ?? 0,
    pointsFor7th: defaultValues?.pointsFor7th ?? 0,
    pointsFor8th: defaultValues?.pointsFor8th ?? 0,
    pointsFor9th: defaultValues?.pointsFor9th ?? 0,
    pointsFor10th: defaultValues?.pointsFor10th ?? 0,

    pointsFor5th_8th: defaultValues?.pointsFor5th_8th ?? 0,
    pointsFor9th_16th: defaultValues?.pointsFor9th_16th ?? 0,
    participationPoints: defaultValues?.participationPoints ?? 0,
    enable180Bonus: defaultValues?.enable180Bonus ?? false,
    bonusPer180: defaultValues?.bonusPer180 ?? 0,
    enableHiOutBonus: defaultValues?.enableHiOutBonus ?? false,
    hiOutThreshold: defaultValues?.hiOutThreshold ?? 0,
    hiOutBonus: defaultValues?.hiOutBonus ?? 0,
    enableAvgBonus: defaultValues?.enableAvgBonus ?? false,
    avgThreshold: defaultValues?.avgThreshold ?? 0,
    avgBonus: defaultValues?.avgBonus ?? 0,
    enableShortLegBonus: defaultValues?.enableShortLegBonus ?? false,
    shortLegThreshold: defaultValues?.shortLegThreshold ?? 15,
    shortLegBonus: defaultValues?.shortLegBonus ?? 0,
    enable9DarterBonus: defaultValues?.enable9DarterBonus ?? false,
    bonusFor9Darter: defaultValues?.bonusFor9Darter ?? 0,
  }), [defaultValues]);

  const form = useForm<ScoringFormValues>({
    resolver: zodResolver(scoringSchema),
    defaultValues: safeDefaultValues as any,
  });

  useEffect(() => {
    if (defaultValues.customPointsByPlace) {
        const initial = Object.entries(defaultValues.customPointsByPlace)
            .map(([place, points]) => ({ place, points }))
            .sort((a, b) => Number(a.place) - Number(b.place));
        setCustomPlaces(initial);
    } else {
        setCustomPlaces([]);
    }
    form.reset(safeDefaultValues as any);
  }, [defaultValues, safeDefaultValues, form]);

  const handleAddCustomPlace = () => setCustomPlaces([...customPlaces, { place: '', points: 0 }]);
  const handleRemoveCustomPlace = (index: number) => setCustomPlaces(customPlaces.filter((_, i) => i !== index));
  const handleCustomPlaceChange = (index: number, field: 'place' | 'points', value: any) => {
      const updated = [...customPlaces];
      updated[index] = { ...updated[index], [field]: value };
      setCustomPlaces(updated);
  };

  async function onSubmit(data: ScoringFormValues) {
    startTransition(async () => {
        const customRecord: Record<string, number> = {};
        customPlaces.forEach(item => {
            if (item.place) customRecord[item.place] = Number(item.points);
        });

        const result = await saveScoringSettings(leagueId, { ...data, customPointsByPlace: customRecord } as any);
        if (result.success) {
            toast({ title: 'Успешно', description: result.message });
            form.reset(data); // Сбрасываем состояние "грязной" формы
        } else {
            toast({ title: 'Ошибка', description: result.message, variant: 'destructive' });
        }
    });
  }

  const onInvalid = () => {
    toast({
        title: 'Ошибка заполнения',
        description: 'Проверьте все поля. Все значения баллов должны быть числами больше или равными 0.',
        variant: 'destructive',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-10 pb-20">
        
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shadow-inner"><ListOrdered className="h-5 w-5" /></div>
                <div>
                    <h3 className="text-xl font-headline uppercase tracking-tight">Основные позиции</h3>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest opacity-60">Базовое распределение (1-16)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField control={form.control} name="pointsFor1st" render={({ field }) => (<FormItem><FormLabel><LabelWithTooltip label="Победитель (1)" tooltipText="Баллы за первое место." /></FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} className="bg-black/20 rounded-xl h-12" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="pointsFor2nd" render={({ field }) => (<FormItem><FormLabel><LabelWithTooltip label="Финалист (2)" tooltipText="Баллы за второе место." /></FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} className="bg-black/20 rounded-xl h-12" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="pointsFor3rd" render={({ field }) => (<FormItem><FormLabel><LabelWithTooltip label="3-е место" tooltipText="Индивидуальный балл для 3-го места. Если 0 — используется балл полуфинала." icon={Trophy} /></FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} className="bg-black/20 rounded-xl h-12 border-primary/20" /></FormControl></FormItem>)} />
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-white/80">Детализация ТОП-10</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <FormField control={form.control} name="pointsFor5th" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold opacity-60">5 МЕСТО</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} className="bg-black/40 h-10" /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="pointsFor6th" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold opacity-60">6 МЕСТО</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} className="bg-black/40 h-10" /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="pointsFor7th" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold opacity-60">7 МЕСТО</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} className="bg-black/40 h-10" /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="pointsFor8th" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold opacity-60">8 МЕСТО</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} className="bg-black/40 h-10" /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="pointsFor9th" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold opacity-60">9 МЕСТО</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} className="bg-black/40 h-10" /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="pointsFor10th" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold opacity-60">10 МЕСТО</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} className="bg-black/40 h-10" /></FormControl></FormItem>)} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                <FormField control={form.control} name="pointsFor3rd_4th" render={({ field }) => (<FormItem><FormLabel><LabelWithTooltip label="Группа 1/2 (3-4)" tooltipText="Базовый балл для полуфиналистов." /></FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} className="bg-black/20 rounded-lg h-10" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="pointsFor5th_8th" render={({ field }) => (<FormItem><FormLabel><LabelWithTooltip label="Группа 1/4 (5-8)" tooltipText="Базовый балл для четвертьфиналистов." /></FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} className="bg-black/20 rounded-lg h-10" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="pointsFor9th_16th" render={({ field }) => (<FormItem><FormLabel><LabelWithTooltip label="Группа 1/8 (9-16)" tooltipText="Базовый балл для 1/8 финала." /></FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} className="bg-black/20 rounded-lg h-10" /></FormControl></FormItem>)} />
            </div>

            <div className="pt-4 border-t border-white/5">
                <FormField control={form.control} name="participationPoints" render={({ field }) => (<FormItem className="max-w-xs"><FormLabel><LabelWithTooltip label="Баллы за участие" tooltipText="Начисляются всем игрокам турнира." icon={Sparkles} /></FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} className="bg-primary/5 border-primary/20 rounded-xl h-12" /></FormControl></FormItem>)} />
            </div>
        </div>

        <div className="space-y-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 shadow-inner">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent"><Trophy className="h-5 w-5" /></div>
                    <h3 className="text-lg font-bold">Расширенная сетка (17+)</h3>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleAddCustomPlace} className="rounded-xl gap-2">
                    <PlusCircle className="h-4 w-4" /> Добавить место
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customPlaces.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-black/40 rounded-2xl border border-white/5 animate-in slide-in-from-left-2">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[9px] uppercase font-black text-muted-foreground ml-1">Место</Label>
                                <Input type="number" min="1" placeholder="Место" value={item.place} onChange={(e) => handleCustomPlaceChange(index, 'place', e.target.value)} className="h-10 bg-transparent border-white/10" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[9px] uppercase font-black text-muted-foreground ml-1">Баллы</Label>
                                <Input type="number" placeholder="Очки" value={item.points} onChange={(e) => handleCustomPlaceChange(index, 'points', e.target.value)} className="h-10 bg-transparent border-white/10" />
                            </div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveCustomPlace(index)} className="mt-4 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                ))}
            </div>
        </div>

        <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 shadow-inner"><Zap className="h-5 w-5" /></div>
                <div>
                    <h3 className="text-xl font-headline uppercase tracking-tight">Про-Бонусы</h3>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest opacity-60">Технические достижения</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-4 shadow-xl">
                    <FormField control={form.control} name="enable180Bonus" render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-base font-headline uppercase text-orange-400">Максимумы 180</FormLabel>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="bonusPer180" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs opacity-60">Баллов за КАЖДЫЙ заход в 180</FormLabel>
                            <FormControl><Input type="number" {...field} value={field.value ?? 0} disabled={!form.watch('enable180Bonus')} className="h-12 bg-black/40" /></FormControl>
                        </FormItem>
                    )} />
                </div>

                <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-4 shadow-xl">
                    <FormField control={form.control} name="enableHiOutBonus" render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-base font-headline uppercase text-pink-500">Высокое закрытие</FormLabel>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="hiOutThreshold" render={({ field }) => (<FormItem><FormLabel className="text-[10px]">Порог HF</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} disabled={!form.watch('enableHiOutBonus')} className="bg-black/40" /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="hiOutBonus" render={({ field }) => (<FormItem><FormLabel className="text-[10px]">Баллы</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} disabled={!form.watch('enableHiOutBonus')} className="bg-black/40" /></FormControl></FormItem>)} />
                    </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-4 shadow-xl">
                    <FormField control={form.control} name="enableAvgBonus" render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-base font-headline uppercase text-yellow-400">Средний набор (AVG)</FormLabel>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="avgThreshold" render={({ field }) => (<FormItem><FormLabel className="text-[10px]">Порог AVG</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? 0} disabled={!form.watch('enableAvgBonus')} className="bg-black/40" /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="avgBonus" render={({ field }) => (<FormItem><FormLabel className="text-[10px]">Баллы</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} disabled={!form.watch('enableAvgBonus')} className="bg-black/40" /></FormControl></FormItem>)} />
                    </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-4 shadow-xl">
                    <FormField control={form.control} name="enableShortLegBonus" render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-base font-headline uppercase text-cyan-400">Короткий лег (SL)</FormLabel>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="shortLegThreshold" render={({ field }) => (<FormItem><FormLabel className="text-[10px]">Порог дротиков (≤)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} disabled={!form.watch('enableShortLegBonus')} className="bg-black/40" /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="shortLegBonus" render={({ field }) => (<FormItem><FormLabel className="text-[10px]">Баллы</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} disabled={!form.watch('enableShortLegBonus')} className="bg-black/40" /></FormControl></FormItem>)} />
                    </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 space-y-4 md:col-span-2 shadow-2xl">
                    <FormField control={form.control} name="enable9DarterBonus" render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Crown className="h-6 w-6 text-primary animate-pulse" />
                                <FormLabel className="text-lg font-headline uppercase text-white">Идеальный лег (9-Darter)</FormLabel>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="bonusFor9Darter" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs opacity-60">Бонус за идеальный лег</FormLabel>
                            <FormControl><Input type="number" {...field} value={field.value ?? 0} disabled={!form.watch('enable9DarterBonus')} className="h-12 bg-black/40 border-primary/30" /></FormControl>
                        </FormItem>
                    )} />
                </div>
            </div>
        </div>

        <CardFooter className="fixed bottom-0 left-0 right-0 md:left-[var(--sidebar-width)] bg-background/95 backdrop-blur-xl py-3 px-6 border-t border-white/10 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="max-w-4xl mx-auto w-full flex justify-end">
                <Button type="submit" disabled={isPending} className="h-12 px-10 rounded-xl shadow-2xl shadow-primary/30 font-black text-sm uppercase tracking-widest transition-all active:scale-95">
                    {isPending ? <><Loader2 className="animate-spin mr-3 h-5 w-5" /> СОХРАНЕНИЕ...</> : <><Save className="mr-3 h-5 w-5" /> УТВЕРДИТЬ РЕГЛАМЕНТ</>}
                </Button>
            </div>
        </CardFooter>
      </form>
    </Form>
  );
}
