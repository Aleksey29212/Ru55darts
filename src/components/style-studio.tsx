'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Wand2, Sparkles, RotateCcw, Palette, Leaf, Gem, Flame, Zap, Sunset, Snowflake, Cpu, Moon, Crown, LayoutGrid, CheckCircle2, Users } from 'lucide-react';
import { generatePlayerCardStyling, type GeneratePlayerCardStylingOutput } from '@/ai/flows/generate-player-card-styling';
import type { Player, TemplateId } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateThemeAction } from '@/app/themeActions';
import { updateAllPlayersTemplateAction, saveGlobalTemplateAction } from '@/app/actions';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

const templates: { id: TemplateId, name: string, desc: string }[] = [
    { id: 'classic', name: 'Классический', desc: 'Стеклянный эффект и фон' },
    { id: 'modern', name: 'Современный', desc: 'Минимализм и разделение' },
    { id: 'dynamic', name: 'Динамичный', desc: 'Неоновые акценты' },
    { id: 'elite', name: 'Элитный', desc: 'Золото и премиум' },
    { id: 'cyber', name: 'Киберпанк', desc: 'Цифровой стиль будущего' },
    { id: 'retro', name: 'Ретро', desc: 'Стиль игровых автоматов' },
    { id: 'impact', name: 'Импакт', desc: 'Акцент на фото и тени' },
    { id: 'minimal', name: 'Минимал', desc: 'Только важная информация' },
    { id: 'arena', name: 'Стадион', desc: 'Эффект арены и света' },
    { id: 'stealth', name: 'Стелс', desc: 'Глубокий черный и матовость' },
];

const predefinedThemes = {
  oceanic: {
    name: 'Глубокий Океан',
    icon: Palette,
    theme: {
      background: '220 20% 10%',
      foreground: '220 15% 95%',
      primary: '200 100% 50%',
      accent: '180 80% 45%',
      gold: '45 93% 48%',
      silver: '220 13% 75%',
      bronze: '28 65% 55%',
    },
  },
  forest: {
    name: 'Изумрудный Лес',
    icon: Leaf,
    theme: {
      background: '120 15% 8%',
      foreground: '120 10% 95%',
      primary: '140 70% 45%',
      accent: '90 60% 55%',
      gold: '45 93% 48%',
      silver: '220 13% 75%',
      bronze: '28 65% 55%',
    },
  },
  royal: {
    name: 'Королевский Аметист',
    icon: Gem,
    theme: {
      background: '260 20% 9%',
      foreground: '0 0% 98%',
      primary: '270 80% 65%',
      accent: '300 70% 60%',
      gold: '45 93% 48%',
      silver: '220 13% 75%',
      bronze: '28 65% 55%',
    },
  },
  fiery: {
    name: 'Вулканический Огонь',
    icon: Flame,
    theme: {
      background: '20 10% 10%',
      foreground: '20 5% 95%',
      primary: '15 80% 50%',
      accent: '35 90% 55%',
      gold: '45 93% 48%',
      silver: '220 13% 75%',
      bronze: '28 65% 55%',
    },
  },
  noir: {
    name: 'Неоновый Нуар',
    icon: Zap,
    theme: {
      background: '240 5% 5%',
      foreground: '0 0% 98%',
      primary: '180 100% 50%',
      accent: '90 100% 50%',
      gold: '45 93% 48%',
      silver: '220 13% 75%',
      bronze: '28 65% 55%',
    },
  },
  sunset: {
    name: 'Золотой Закат',
    icon: Sunset,
    theme: {
      background: '20 30% 8%',
      foreground: '30 20% 98%',
      primary: '35 90% 60%',
      accent: '340 70% 55%',
      gold: '45 93% 48%',
      silver: '220 13% 75%',
      bronze: '28 65% 55%',
    },
  },
  arctic: {
    name: 'Арктический Лед',
    icon: Snowflake,
    theme: {
      background: '210 25% 10%',
      foreground: '210 10% 98%',
      primary: '200 100% 75%',
      accent: '190 80% 60%',
      gold: '45 93% 48%',
      silver: '220 13% 75%',
      bronze: '28 65% 55%',
    },
  },
  cyber: {
    name: 'Киберпанк 2077',
    icon: Cpu,
    theme: {
      background: '260 40% 5%',
      foreground: '0 0% 100%',
      primary: '320 100% 60%',
      accent: '180 100% 50%',
      gold: '45 100% 50%',
      silver: '0 0% 80%',
      bronze: '28 70% 50%',
    },
  },
  midnight: {
    name: 'Глубокая Полночь',
    icon: Moon,
    theme: {
      background: '230 30% 5%',
      foreground: '210 20% 95%',
      primary: '215 90% 55%',
      accent: '260 70% 65%',
      gold: '45 93% 48%',
      silver: '220 13% 75%',
      bronze: '28 65% 55%',
    },
  },
  luxury: {
    name: 'Золотой Премиум',
    icon: Crown,
    theme: {
      background: '0 0% 5%',
      foreground: '45 20% 98%',
      primary: '45 100% 50%',
      accent: '45 30% 25%',
      gold: '45 100% 50%',
      silver: '0 0% 75%',
      bronze: '30 50% 45%',
    },
  },
};

export function StyleStudioClient({ players, initialDefaultTemplate }: { players: Player[], initialDefaultTemplate: TemplateId }) {
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(initialDefaultTemplate);
    const [generation, setGeneration] = useState<GeneratePlayerCardStylingOutput | null>(null);
    const [isGenerating, startGenerationTransition] = useTransition();
    const [isApplying, startApplyingTransition] = useTransition();
    const [isTemplatePending, startTemplateTransition] = useTransition();

    const { toast } = useToast();

    const selectedPlayer = players.find(p => p.id === selectedPlayerId);

    const handleGenerateStyle = async () => {
        const input = selectedPlayer
            ? {
                playerName: selectedPlayer.name,
                playerRanking: selectedPlayer.rank,
                playerStats: `Wins: ${selectedPlayer.wins}, Points: ${selectedPlayer.points}`,
            }
            : {};

        startGenerationTransition(async () => {
            setGeneration(null);
            try {
                const result = await generatePlayerCardStyling(input);
                setGeneration(result);
            } catch (error) {
                console.error('Failed to generate style theme:', error);
                toast({ title: 'Ошибка генерации', description: 'Не удалось сгенерировать тему. Попробуйте снова.', variant: 'destructive' });
            }
        });
    };

    const handleThemeUpdate = async (theme: GeneratePlayerCardStylingOutput['theme'] | null) => {
        startApplyingTransition(async () => {
            const result = await updateThemeAction(theme);
            toast({
                title: result.success ? 'Успешно' : 'Ошибка',
                description: result.message,
                variant: result.success ? 'default' : 'destructive',
            });
        });
    }

    const handleApplyTemplateToAll = () => {
        startTemplateTransition(async () => {
            const result = await updateAllPlayersTemplateAction(selectedTemplate);
            toast({
                title: result.success ? 'Успешно' : 'Ошибка',
                description: result.message,
                variant: result.success ? 'default' : 'destructive',
            });
        });
    }

    const handleSetGlobalTemplate = () => {
        startTemplateTransition(async () => {
            const result = await saveGlobalTemplateAction(selectedTemplate);
            toast({
                title: result.success ? 'Успешно' : 'Ошибка',
                description: result.message,
                variant: result.success ? 'default' : 'destructive',
            });
        });
    }

    return (
        <div className="grid gap-8 max-w-4xl mx-auto pb-20">
            <Card className="glassmorphism">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2 uppercase tracking-tighter">
                        <Wand2 className="text-primary h-7 w-7"/>
                        Студия стилей DartBrig Pro
                    </CardTitle>
                    <CardDescription className="text-base">
                        Центральный узел управления визуальной идентичностью вашей системы. Все изменения вступают в силу мгновенно и сохраняются навсегда.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card className="glassmorphism border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <LayoutGrid className="h-48 w-48 -mr-12 -mt-12" />
                </div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LayoutGrid className="text-primary"/>
                        Управление шаблонами карточек
                    </CardTitle>
                    <CardDescription>Выберите визуальный мастер-шаблон для оформления профилей.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {templates.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTemplate(t.id)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 gap-2 hover:scale-105 active:scale-95",
                                    selectedTemplate === t.id 
                                        ? "bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]" 
                                        : "bg-black/20 border-white/5 text-muted-foreground hover:bg-white/5"
                                )}
                            >
                                <span className="font-headline text-[10px] uppercase tracking-tighter leading-none">{t.name}</span>
                                {selectedTemplate === t.id && <CheckCircle2 className="h-4 w-4 animate-in zoom-in-50" />}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-inner">
                        <div className="text-center sm:text-left">
                            <h4 className="font-headline text-lg text-white uppercase tracking-tight">Действие для шаблона: {templates.find(t => t.id === selectedTemplate)?.name}</h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Выберите масштаб применения изменений</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <Button 
                                onClick={handleSetGlobalTemplate} 
                                disabled={isTemplatePending} 
                                variant="outline" 
                                className="rounded-xl font-black uppercase tracking-widest text-[9px] h-12"
                            >
                                {isTemplatePending ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2 h-4 w-4" />}
                                Стандарт для новых
                            </Button>
                            <Button 
                                onClick={handleApplyTemplateToAll} 
                                disabled={isTemplatePending} 
                                className="rounded-xl font-black uppercase tracking-widest text-[9px] h-12 shadow-xl shadow-primary/20"
                            >
                                {isTemplatePending ? <Loader2 className="animate-spin mr-2" /> : <Users className="mr-2 h-4 w-4" />}
                                Применить ко всем
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="glassmorphism border-accent/20">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="text-accent"/>
                        Глобальные цветовые темы (Обложки)
                    </CardTitle>
                    <CardDescription>Изменяйте цветовую палитру интерфейса всего сайта.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.values(predefinedThemes).map((pTheme) => (
                        <Button 
                            key={pTheme.name} 
                            onClick={() => handleThemeUpdate(pTheme.theme)} 
                            disabled={isApplying}
                            variant="secondary"
                            className="h-14 justify-start gap-3 px-4 font-bold transition-all hover:scale-105 active:scale-95"
                            style={{ 
                                borderLeft: `4px solid hsl(${pTheme.theme.primary})`,
                                backgroundColor: `hsl(${pTheme.theme.background} / 0.8)` 
                            }}
                        >
                            {isApplying ? <Loader2 className="animate-spin h-5 w-5" /> : <pTheme.icon className="h-5 w-5" style={{ color: `hsl(${pTheme.theme.primary})` }} />} 
                            <span className="truncate">{pTheme.name}</span>
                        </Button>
                    ))}
                    <Button variant="outline" onClick={() => handleThemeUpdate(null)} disabled={isApplying} className="h-14 font-bold border-dashed rounded-xl">
                        {isApplying ? <Loader2 className="animate-spin h-5 w-5" /> : <RotateCcw className="h-5 w-5 mr-2" />}
                        Сбросить цвета
                    </Button>
                </CardContent>
            </Card>

            <Card className="glassmorphism border-primary/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="text-primary"/>
                        Интеллектуальный генератор стилей
                    </CardTitle>
                    <CardDescription>
                        Создайте уникальную тему на основе данных конкретного игрока с помощью ИИ.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Select onValueChange={(value) => setSelectedPlayerId(value === 'general' ? '' : value)} value={selectedPlayerId || 'general'}>
                            <SelectTrigger className="flex-grow h-14 rounded-xl bg-black/40 border-white/10">
                                <SelectValue placeholder="Выберите опцию..." />
                            </SelectTrigger>
                            <SelectContent className="glassmorphism">
                                <SelectItem value="general">Общая тема для приложения</SelectItem>
                                {players.sort((a,b) => a.rank - b.rank).map((player) => (
                                <SelectItem key={player.id} value={player.id}>
                                    #{player.rank} - {player.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleGenerateStyle} disabled={isGenerating} className="w-full sm:w-48 h-14 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                            {isGenerating ? <Loader2 className="animate-spin h-5 w-5" /> : <Wand2 className="h-5 w-5 mr-2" />}
                            {isGenerating ? 'Думаю...' : 'Создать'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isGenerating && (
                <div className="flex flex-col justify-center items-center p-20 glassmorphism rounded-[3rem] animate-pulse gap-6 border-2 border-primary/20">
                    <div className="relative">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-accent animate-bounce" />
                    </div>
                    <div className="text-center">
                        <p className="font-headline text-2xl uppercase tracking-tighter text-white">ИИ подбирает идеальные цвета...</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] mt-2">Анализ палитры и контрастности</p>
                    </div>
                </div>
            )}

            {generation && (
                <Card className="glassmorphism animate-in fade-in zoom-in-95 duration-700 overflow-hidden border-primary/40 rounded-[3rem] shadow-4xl">
                    <CardHeader className="bg-primary/10 p-10 border-b border-primary/20">
                        <CardTitle className="text-2xl font-headline uppercase tracking-tight">Результат генерации {selectedPlayer ? `для ${selectedPlayer.name}`: ' (общая)'}</CardTitle>
                        <CardDescription className="text-foreground/90 font-medium italic text-lg leading-relaxed mt-4">
                            &ldquo;{generation.description}&rdquo;
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-10 p-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {Object.entries(generation.theme).map(([key, value]) => (
                                <div key={key} className="space-y-3 group/color">
                                    <div 
                                        className="h-20 w-full rounded-2xl border-2 border-white/10 shadow-2xl transition-transform group-hover/color:scale-110" 
                                        style={{ backgroundColor: `hsl(${value})` }}
                                    />
                                    <p className="text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover/color:text-white transition-colors">{key}</p>
                                </div>
                            ))}
                        </div>

                        <Button className="w-full h-20 text-xl font-black uppercase tracking-[0.1em] shadow-4xl shadow-primary/30 rounded-2xl transition-all hover:brightness-110 active:scale-[0.98]" onClick={() => handleThemeUpdate(generation.theme)} disabled={isApplying}>
                            {isApplying ? <Loader2 className="animate-spin mr-3 h-6 w-6" /> : <CheckCircle2 className="mr-3 h-6 w-6" />}
                            Применить палитру ко всему приложению
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
