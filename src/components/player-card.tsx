'use client';

import type { Player, PlayerProfile, ScoringSettings, SponsorTemplateId } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Separator } from './ui/separator';
import { useAdmin } from '@/context/admin-context';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Save, Edit, X, Info, Zap, Trophy, Wallet, Award, Sunset, TrendingUp, ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { TemplateId } from './template-switcher';
import { cn } from '@/lib/utils';
import { useIsClient } from '@/hooks/use-is-client';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useFirestore } from '@/firebase';
import { updatePlayerProfile } from '@/firebase/players';
import { CardBackgrounds } from '@/lib/card-backgrounds';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScoringHelpDialog } from './scoring-help-dialog';

/**
 * @fileOverview Личная карточка игрока.
 * ГАРАНТИЯ: Полная читаемость цифр без обрезки и интерактивное раскрытие данных.
 */

const StatItem = ({ 
    label, 
    value, 
    name, 
    template = 'classic', 
    description,
    interactive = false,
    forcedReveal = false
}: { 
    label: string; 
    value: string | number; 
    name: string, 
    template?: TemplateId, 
    description?: string,
    interactive?: boolean,
    forcedReveal?: boolean
}) => {
    const [localReveal, setLocalReveal] = useState(false);
    const isRevealed = !interactive || forcedReveal || localReveal;
    
    const baseClasses = "flex flex-col items-center justify-center p-2 rounded-2xl gap-1 min-h-[90px] sm:min-h-[100px] md:min-h-[110px] transition-all border border-transparent interactive-scale overflow-hidden shadow-lg relative";
    const templateClasses = {
        classic: "glassmorphism bg-white/5 border-white/5 hover:border-primary/30",
        modern: "bg-background border-border shadow-inner",
        dynamic: "bg-black/70 text-white border-accent/40 shadow-[0_0_20px_rgba(var(--accent-rgb),0.15)]"
    };

    // Оптимизированные размеры шрифта: уменьшаем базу, чтобы 4+ значные числа влезали в рамки
    const valueClasses = cn(
        "text-base sm:text-lg md:text-xl lg:text-2xl font-headline tracking-tight leading-none mt-1 w-full text-center drop-shadow-md transition-all duration-500 whitespace-nowrap px-1",
        (name === 'avg' || name === 'n180s' || name === 'hiOut' || name === 'winRate' || name === 'points') ? 'text-primary text-glow' : 'text-foreground',
        template === 'dynamic' ? 'text-accent text-glow-accent' : '',
        !isRevealed && "blur-xl scale-90 opacity-0"
    );
    
    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <div 
                        onClick={() => interactive && !isRevealed && setLocalReveal(true)}
                        className={cn(
                            "cursor-help w-full group", 
                            baseClasses, 
                            templateClasses[template],
                            interactive && !isRevealed && "cursor-pointer hover:bg-primary/10"
                        )}
                    >
                        <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-muted-foreground/90 flex items-center justify-center gap-1 text-center uppercase tracking-widest font-body leading-none mb-0.5">
                            {label}
                            <Info className="h-2.5 sm:h-3 md:h-3.5 shrink-0 opacity-50 text-primary group-hover:opacity-100 transition-opacity" />
                        </p>
                        
                        <div className="relative w-full flex items-center justify-center min-h-[24px] md:min-h-[30px]">
                            <p className={valueClasses}>{value}</p>
                            
                            {interactive && !isRevealed && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in duration-500">
                                    <Lock className="h-3.5 w-3.5 text-primary/40 mb-0.5" />
                                    <span className="text-[7px] font-bold uppercase tracking-tighter text-primary/60">Открыть</span>
                                </div>
                            )}
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[240px] text-center p-4 glassmorphism border-primary/40 z-[100] shadow-2xl">
                    <p className="text-xs leading-relaxed font-semibold">{description || "Информация о достижении игрока."}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

interface PlayerCardProps {
  player: Player;
  template?: TemplateId;
  viewMode: 'aggregate' | 'single';
  showSponsors: boolean;
  showSponsorshipCallToActionGlobal: boolean;
  sponsorTemplate: SponsorTemplateId;
  callToActionSlogans?: string[];
  scoringSettings: ScoringSettings[];
  leagueNames: string[];
}

export function PlayerCard({ player, template = 'classic', viewMode, scoringSettings, leagueNames }: PlayerCardProps) {
  const { isAdmin } = useAdmin();
  const db = useFirestore();
  const [isEditing, setIsEditing] = useState(false);
  const [editablePlayer, setEditablePlayer] = useState<PlayerProfile>(player);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [revealAll, setAreAllStatsRevealed] = useState(false);
  const { toast } = useToast();
  const isClient = useIsClient();

  useEffect(() => {
    setEditablePlayer(player);
  }, [player]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditablePlayer(prev => ({ ...prev, [name]: value }));
    setIsFormDirty(true);
  };
  
  const handleSave = async () => {
    if (!db) return;
    updatePlayerProfile(db, editablePlayer);
    toast({ title: 'Обновление', description: `Изменения сохраняются...` });
    setIsFormDirty(false);
    setIsEditing(false);
  }

  const currentPlayerData = isEditing ? editablePlayer : player;
  const backgroundImageUrl = currentPlayerData.backgroundUrl || `https://picsum.photos/seed/bg-fallback/800/400`;
  const winRate = player.matchesPlayed > 0 ? `${((player.wins / player.matchesPlayed) * 100).toFixed(0)}%` : '0%';
  const hasOmskStats = player.cashValue && player.cashValue > 0;

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
    <Card className={cn(
        "glassmorphism overflow-hidden transition-all duration-700 shadow-2xl border-white/10 rounded-[2.5rem]",
        template === 'modern' && 'flex flex-col md:flex-row',
        template === 'dynamic' && 'border-accent/50 shadow-accent/20 border-2'
    )}>
        {/* Hero Section */}
        <div className={cn(
            "relative overflow-hidden",
            template === 'classic' && "h-72 md:h-96",
            template === 'modern' && "p-10 md:w-1/3 flex flex-col items-center justify-center bg-gradient-to-br from-muted/40 to-transparent border-r border-white/10",
            template === 'dynamic' && "h-80"
        )}>
            <Image 
                src={backgroundImageUrl}
                alt=""
                fill
                className={cn(
                    "object-cover transition-all duration-1000",
                    template === 'classic' && "opacity-50",
                    template === 'modern' && "opacity-0",
                    template === 'dynamic' && "opacity-60"
                )}
                unoptimized={backgroundImageUrl.startsWith('data:image')}
                priority
            />
             <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

            <div className={cn(
                "absolute transition-all duration-700 z-10 w-full",
                template === 'classic' && "bottom-0 left-0 p-8 md:p-12 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10",
                template === 'modern' && "relative flex flex-col items-center gap-10",
                template === 'dynamic' && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
            )}>
                <div className="relative shrink-0">
                    <Avatar className={cn(
                        "border-4 transition-all shadow-2xl",
                        template === 'classic' && "h-36 w-36 md:h-48 md:w-48 border-primary ring-8 ring-primary/15",
                        template === 'modern' && "h-44 w-44 md:h-52 md:w-52 border-primary ring-8 ring-primary/10",
                        template === 'dynamic' && "h-40 w-40 md:h-48 md:w-48 border-accent ring-8 ring-accent/20"
                    )}>
                        <AvatarImage src={currentPlayerData.avatarUrl} alt={currentPlayerData.name} />
                        <AvatarFallback className="text-5xl md:text-6xl font-headline bg-muted text-muted-foreground">{currentPlayerData.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-background border-2 border-primary/30 shadow-2xl">
                        <Trophy className="h-5 w-5 md:h-6 md:w-6 text-gold" />
                    </div>
                </div>
                 <div className={cn(template === 'modern' ? 'text-center' : 'flex flex-col items-center md:items-start gap-3 text-center md:text-left')}>
                    <h1 className={cn("font-headline tracking-tighter text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.8)] leading-tight", template === 'classic' ? "text-4xl md:text-7xl" : "text-4xl md:text-6xl")}>{currentPlayerData.name}</h1>
                    <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
                        <Badge variant="secondary" className="font-bold uppercase tracking-[0.25em] text-[10px] md:text-[12px] py-1.5 px-4 md:py-2 md:px-6 backdrop-blur-2xl bg-white/10 text-white border-white/20 shadow-xl">{currentPlayerData.nickname}</Badge>
                        {player.isQualifiedForFinal && (
                            <Badge className="bg-orange-500 text-white font-bold uppercase tracking-widest animate-pulse shadow-2xl shadow-orange-500/30 py-1.5 px-4 text-[10px] md:text-[12px]">
                                <Award className="h-4 w-4 mr-1.5" />
                                Qualified
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="absolute top-6 right-6 md:top-10 md:right-10 z-10 flex flex-col gap-4">
                <div className={cn(
                    "flex flex-col items-center justify-center min-w-[90px] md:min-w-[120px] p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-3xl border-2 shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition-transform hover:scale-110",
                    template === 'dynamic' ? 'bg-accent/40 border-accent/50 text-accent' : 'bg-primary/40 border-primary/50 text-primary-foreground'
                )}>
                    <span className="text-[10px] md:text-[12px] font-bold uppercase tracking-[0.2em] opacity-90 mb-1">Rank</span>
                    <span className="text-3xl md:text-5xl font-headline leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                        {currentPlayerData.rank > 0 ? `#${currentPlayerData.rank}` : 'N/A'}
                    </span>
                </div>
            </div>
        </div>

        <CardContent className={cn(
            "p-6 md:p-12 lg:p-16 transition-all",
            template === 'modern' && 'md:w-2/3',
            template === 'dynamic' && "pt-32"
        )}>
             {isClient && isAdmin && (
                <div className="mb-10 md:mb-14 p-6 md:p-8 rounded-[2rem] border-2 border-primary/30 bg-primary/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-center sm:text-left">
                        <h4 className="font-headline text-lg md:text-2xl text-primary tracking-tight">Режим администратора</h4>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold opacity-80">Настройка профиля и данных</p>
                    </div>
                    <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "destructive" : "default"} size="lg" className="w-full sm:w-auto rounded-2xl h-14 px-8 shadow-2xl shadow-primary/30 font-bold text-primary-foreground">
                        {isEditing ? <><X className="mr-2 h-6 w-6" /> Закрыть</> : <><Edit className="mr-2 h-6 w-6" /> Редактировать</>}
                    </Button>
                </div>
             )}

             {isEditing && (
                <div className="mb-14 space-y-8 md:space-y-10 p-8 md:p-10 border-2 border-primary/40 rounded-[2.5rem] glassmorphism shadow-2xl animate-in zoom-in-95 duration-500">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-10">
                        <div className="space-y-4">
                            <Label className="text-[11px] md:text-[13px] uppercase font-bold tracking-widest text-primary ml-1">Никнейм игрока</Label>
                            <Input name="nickname" value={editablePlayer.nickname} onChange={handleInputChange} className="rounded-2xl bg-black/30 h-14 text-lg border-white/10" />
                        </div>
                        <div className="space-y-4">
                            <Label className="text-[11px] md:text-[13px] uppercase font-bold tracking-widest text-primary ml-1">Фон карточки</Label>
                            <Select
                                value={editablePlayer.backgroundUrl || ''}
                                onValueChange={(value) => { setEditablePlayer(prev => ({ ...prev, backgroundUrl: value })); setIsFormDirty(true); }}
                            >
                                <SelectTrigger className="h-14 rounded-2xl bg-black/30 border-white/10">
                                    <SelectValue placeholder="Выберите фон..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-96 rounded-2xl glassmorphism border-white/20">
                                    <SelectItem value=" ">Стандартный аметист</SelectItem>
                                    {CardBackgrounds.map(bg => (
                                        <SelectItem key={bg.id} value={bg.url}>
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-6 rounded-md overflow-hidden border border-white/10"><Image src={bg.url} alt="" fill className="object-cover" unoptimized /></div>
                                                <span className="capitalize text-sm font-bold">{bg.hint}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <Label className="text-[11px] md:text-[13px] uppercase font-bold tracking-widest text-primary ml-1">Биография (Story)</Label>
                        <Textarea name="bio" value={editablePlayer.bio} onChange={handleInputChange} rows={5} className="rounded-[2rem] bg-black/30 resize-none p-6 md:p-8 text-base border-white/10" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 pt-6">
                        <Button onClick={handleSave} className='flex-1 h-16 rounded-2xl shadow-2xl shadow-primary/40 font-bold text-lg text-primary-foreground' disabled={!isFormDirty}><Save className="mr-2 h-6 w-6" />Сохранить</Button>
                        <Button onClick={() => { setIsEditing(false); setEditablePlayer(player); }} className='flex-1 h-16 rounded-2xl text-lg' variant="ghost"><X className="mr-2 h-6 w-6" />Отмена</Button>
                    </div>
                </div>
             )}
            
            <div className="grid grid-cols-1 gap-10 md:gap-16">
                <div className="space-y-6 md:space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
                        <div className="flex items-center gap-4 md:gap-5">
                            <div className="p-2.5 rounded-xl bg-primary/15 text-primary shrink-0">
                                <Info className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <h3 className="text-[10px] md:text-sm font-headline uppercase tracking-[0.25em] text-muted-foreground/90">О про-игроке</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button 
                                onClick={() => setAreAllStatsRevealed(!revealAll)}
                                variant="outline" 
                                size="sm" 
                                className="rounded-xl h-10 px-4 gap-2 border-primary/20 text-primary hover:bg-primary/10 text-[10px] md:text-xs"
                            >
                                {revealAll ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                {revealAll ? 'Скрыть' : 'Раскрыть всё'}
                            </Button>
                            <ScoringHelpDialog settings={scoringSettings} leagueName={leagueNames} sponsorshipSettings={{ groupVkLink: 'https://vk.com/dartbrig' } as any}>
                                <Button variant="ghost" size="sm" className="hidden sm:flex gap-3 rounded-xl h-10 px-4 text-[10px] md:text-sm uppercase font-bold tracking-tight hover:bg-primary/15 text-primary border border-primary/20">
                                    <ShieldCheck className="h-5 w-5" />
                                    Регламент
                                </Button>
                            </ScoringHelpDialog>
                        </div>
                    </div>
                    <p className="text-sm md:text-xl lg:text-2xl text-foreground/95 font-body leading-relaxed italic border-l-4 border-primary/50 pl-4 md:pl-8 lg:pl-12 py-2 md:py-3 font-medium bg-white/5 rounded-r-[1.5rem] md:rounded-r-[2rem]">
                        {currentPlayerData.bio || "История этого мастера дартса в настоящее время дополняется новыми главами."}
                    </p>
                </div>

                {hasOmskStats && (
                    <div className="p-6 md:p-10 lg:p-12 rounded-[2rem] md:rounded-[2.5rem] bg-orange-500/10 border-2 border-orange-500/30 relative overflow-hidden group/omsk shadow-2xl">
                        <div className="absolute -top-10 -right-10 p-4 opacity-[0.08] group-hover/omsk:scale-110 transition-transform duration-1000">
                            <Sunset className="h-40 w-40 md:h-64 md:w-64 text-orange-500" />
                        </div>
                        <div className="flex items-center gap-4 md:gap-5 mb-4 md:mb-8 lg:mb-10 relative z-10">
                            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-500 border border-orange-500/30">
                                <Wallet className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <div>
                                <h3 className="text-[10px] md:text-sm font-headline uppercase tracking-[0.25em] text-orange-300">Лига «Вечерний Омск»</h3>
                                <p className="text-[8px] md:text-[11px] text-muted-foreground font-bold uppercase tracking-widest opacity-70">Текущий финансовый баланс</p>
                            </div>
                        </div>
                        <div className="flex relative z-10">
                            <span className="text-3xl md:text-6xl lg:text-7xl font-headline text-orange-400 drop-shadow-[0_4px_15px_rgba(0,0,0,0.5)]">{(player.cashValue || 0).toLocaleString('ru-RU')} ₽</span>
                        </div>
                    </div>
                )}

                <Separator className="opacity-20" />
                
                <div className="space-y-10 md:space-y-16 lg:space-y-20">
                    <div>
                        <div className="flex items-center gap-4 md:gap-5 mb-6 md:mb-8 lg:mb-12">
                            <div className="p-2.5 rounded-xl bg-primary/15 text-primary">
                                <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <h3 className="text-[10px] md:text-sm font-headline uppercase tracking-[0.25em] text-muted-foreground/90">Карьерный Дашборд</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
                            <StatItem template={template} label="Очки" name="points" value={player.points} description="Суммарный рейтинг из всех лиг или текущего сезона." />
                            <StatItem template={template} label="Турниры" name="matchesPlayed" value={player.matchesPlayed} description="Количество официальных участий в текущей активной лиге." />
                            <StatItem template={template} label="ТОП-8" name="wins" value={player.wins} description="Количество выходов в плей-офф." />
                            <StatItem template={template} label="Провалы" name="losses" value={player.losses} description="Выступления без выхода из группы." />
                            <StatItem template={template} label="Eff." name="winRate" value={winRate} description="Процент успешных выступлений." />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-12">
                        <div className="glassmorphism p-6 md:p-8 lg:p-10 rounded-[2rem] md:rounded-[2.5rem] border-white/10 relative overflow-hidden shadow-2xl flex flex-col h-full">
                            <h3 className="text-[9px] md:text-[11px] font-headline uppercase tracking-[0.25em] text-muted-foreground/70 mb-6 md:mb-8 flex items-center gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Анализ рейтинга
                            </h3>
                            <div className="grid grid-cols-2 gap-3 md:gap-6 lg:gap-8 mt-auto">
                                <StatItem template={template} label="Основные" name="basePoints" value={player.basePoints} interactive={!revealAll} forcedReveal={revealAll} description="Очки только за занятые места." />
                                <StatItem template={template} label="Бонусы" name="bonusPoints" value={`+${player.bonusPoints}`} interactive={!revealAll} forcedReveal={revealAll} description="Дополнительные баллы за статистику." />
                            </div>
                        </div>

                        <div className="glassmorphism p-6 md:p-8 lg:p-10 rounded-[2rem] md:rounded-[2.5rem] border-white/10 relative overflow-hidden shadow-2xl flex flex-col h-full">
                            <h3 className="text-[9px] md:text-[11px] font-headline uppercase tracking-[0.25em] text-muted-foreground/70 mb-6 md:mb-8 flex items-center gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                                Личные рекорды
                            </h3>
                            <div className="grid grid-cols-3 gap-3 md:gap-4 lg:gap-6 mt-auto">
                                <StatItem template={template} label="AVG" name="avg" value={(Number(player.avg) || 0).toFixed(1)} interactive={!revealAll} forcedReveal={revealAll} description="Средний набор очков." />
                                <StatItem template={template} label="180" name="n180s" value={player.n180s} interactive={!revealAll} forcedReveal={revealAll} description="Максимумы за карьеру." />
                                <StatItem template={template} label="Hi-Out" name="hiOut" value={Number(player.hiOut) || 0} interactive={!revealAll} forcedReveal={revealAll} description="Абсолютный рекорд чекаута." />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
    </div>
  );
}