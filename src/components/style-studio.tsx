'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Wand2, Sparkles, RotateCcw, Palette, Leaf, Gem, Flame, Zap, Sunset, Snowflake, Cpu, Moon, Crown } from 'lucide-react';
import { generatePlayerCardStyling, type GeneratePlayerCardStylingOutput } from '@/ai/flows/generate-player-card-styling';
import type { Player } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateThemeAction } from '@/app/themeActions';

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

export function StyleStudioClient({ players }: { players: Player[] }) {
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
    const [generation, setGeneration] = useState<GeneratePlayerCardStylingOutput | null>(null);
    const [isGenerating, startGenerationTransition] = useTransition();
    const [isApplying, startApplyingTransition] = useTransition();

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

    return (
        <div className="grid gap-8 max-w-4xl mx-auto">
            <Card className="glassmorphism">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Wand2 className="text-primary"/>
                        Студия стилей
                    </CardTitle>
                    <CardDescription>
                        Здесь вы можете изменить визуальный стиль всего приложения, используя готовые темы или генерируя уникальные с помощью ИИ.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card className="glassmorphism">
                 <CardHeader>
                    <CardTitle>Предустановленные темы (Обложки)</CardTitle>
                    <CardDescription>Выберите одну из 10 дизайнерских цветовых схем.</CardDescription>
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
                    <Button variant="outline" onClick={() => handleThemeUpdate(null)} disabled={isApplying} className="h-14 font-bold border-dashed">
                        {isApplying ? <Loader2 className="animate-spin" /> : <RotateCcw />}
                        Сбросить по умолчанию
                    </Button>
                </CardContent>
            </Card>

            <Card className="glassmorphism">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="text-accent"/>
                        Генератор тем ИИ
                    </CardTitle>
                    <CardDescription>
                        Выберите игрока для создания персональной темы или сгенерируйте общую тему.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Select onValueChange={(value) => setSelectedPlayerId(value === 'general' ? '' : value)} value={selectedPlayerId || 'general'}>
                            <SelectTrigger className="flex-grow h-12">
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
                        <Button onClick={handleGenerateStyle} disabled={isGenerating} className="w-48 h-12 shadow-lg shadow-primary/20">
                            {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />}
                            {isGenerating ? 'Генерация...' : 'Создать'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isGenerating && (
                <div className="flex justify-center items-center p-12 glassmorphism rounded-3xl animate-pulse">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="ml-4 font-headline uppercase tracking-widest text-primary">ИИ подбирает идеальные цвета...</p>
                </div>
            )}

            {generation && (
                <Card className="glassmorphism animate-in fade-in zoom-in-95 duration-500 overflow-hidden border-primary/30">
                    <CardHeader className="bg-primary/10">
                        <CardTitle className="text-xl">Сгенерированная тема {selectedPlayer ? `для ${selectedPlayer.name}`: ' (общая)'}</CardTitle>
                        <CardDescription className="text-foreground/80 font-medium italic">
                            &ldquo;{generation.description}&rdquo;
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-muted-foreground">Палитра интерфейса</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                {Object.entries(generation.theme).map(([key, value]) => (
                                    <div key={key} className="space-y-2">
                                        <div 
                                            className="h-16 w-full rounded-2xl border-2 border-white/10 shadow-xl" 
                                            style={{ backgroundColor: `hsl(${value})` }}
                                        />
                                        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{key}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button className="w-full h-14 text-lg font-bold shadow-2xl shadow-primary/30" onClick={() => handleThemeUpdate(generation.theme)} disabled={isApplying}>
                                {isApplying && <Loader2 className="animate-spin mr-2" />}
                                Применить эту тему ко всему приложению
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
