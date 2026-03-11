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
import { Save, Edit, X, Info, Zap, Trophy, Wallet, Award, Sunset, TrendingUp, ShieldCheck, Eye, EyeOff, Lock, Handshake, ExternalLink } from 'lucide-react';
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
 * @fileOverview Личная карточка игрока (Дизайнерская версия v2.7).
 */

const StatItem = ({ 
    label, 
    value, 
    name, 
    template = 'classic', 
    description,
    caption,
    interactive = false,
    forcedReveal = false
}: { 
    label: string; 
    value: string | number; 
    name: string, 
    template?: TemplateId, 
    description?: string,
    caption?: string,
    interactive?: boolean,
    forcedReveal?: boolean
}) => {
    const [localReveal, setLocalReveal] = useState(false);
    const isRevealed = !interactive || forcedReveal || localReveal;
    
    const baseClasses = "flex flex-col items-center justify-center p-4 rounded-[2rem] gap-1 min-h-[120px] transition-all border border-transparent interactive-scale overflow-hidden shadow-2xl relative w-full";
    const templateClasses = {
        classic: "glassmorphism bg-white/5 border-white/10 hover:border-primary/40",
        modern: "bg-background/60 backdrop-blur-md border-white/5 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]",
        dynamic: "bg-black/80 text-white border-accent/50 shadow-[0_0_30px_rgba(var(--accent-rgb),0.2)]"
    };

    const valueClasses = cn(
        "text-2xl sm:text-3xl font-headline tracking-tight leading-none w-full text-center drop-shadow-2xl transition-all duration-700 whitespace-nowrap px-1",
        (name === 'avg' || name === 'n180s' || name === 'hiOut' || name === 'winRate' || name === 'points') ? 'text-primary text-glow' : 'text-white',
        template === 'dynamic' ? 'text-accent text-glow-accent' : '',
        !isRevealed && "blur-2xl scale-75 opacity-0"
    );
    
    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <div 
                        onClick={() => interactive && !isRevealed && setLocalReveal(true)}
                        className={cn(
                            "cursor-help group", 
                            baseClasses, 
                            templateClasses[template],
                            interactive && !isRevealed && "cursor-pointer hover:bg-primary/20 hover:border-primary/50"
                        )}
                    >
                        <p className="text-[10px] font-black text-muted-foreground/80 flex items-center justify-center gap-2 text-center uppercase tracking-[0.15em] font-body leading-none mb-2 px-2">
                            {label}
                            <Info className="h-3 shrink-0 opacity-40 text-primary group-hover:opacity-100 transition-opacity" />
                        </p>
                        
                        <div className="relative w-full flex flex-col items-center justify-center">
                            <p className={valueClasses}>{value}</p>
                            
                            {isRevealed && (
                                <p className="text-[9px] font-black uppercase text-primary/60 tracking-widest mt-2 text-center line-clamp-1 opacity-80 group-hover:text-primary transition-colors">
                                    {caption || "СТАТИСТИКА"}
                                </p>
                            )}

                            {interactive && !isRevealed && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in duration-700">
                                    <Lock className="h-5 w-5 text-primary/30 mb-1 animate-bounce" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/50">ОТКРЫТЬ</span>
                                </div>
                            )}
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[280px] text-center p-5 glassmorphism border-primary/50 z-[100] shadow-[0_20px_80px_rgba(0,0,0,0.8)] rounded-[1.5rem]">
                    <div className="space-y-3">
                        <p className="text-[11px] font-headline text-primary uppercase tracking-[0.2em] mb-1">{label}</p>
                        <p className="text-sm leading-relaxed font-bold text-white/90">{description || "Профессиональные метрики игрока."}</p>
                    </div>
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

export function PlayerCard({ 
    player, 
    template = 'classic', 
    viewMode, 
    scoringSettings, 
    leagueNames,
    showSponsors,
    showSponsorshipCallToActionGlobal
}: PlayerCardProps) {
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
    toast({ title: 'Система обновлена', description: `Профиль игрока успешно сохранен.` });
    setIsFormDirty(false);
    setIsEditing(false);
  }

  const currentPlayerData = isEditing ? editablePlayer : player;
  const backgroundImageUrl = currentPlayerData.backgroundUrl || `https://picsum.photos/seed/bg-fallback/800/400`;
  const winRate = player.matchesPlayed > 0 ? `${((player.wins / player.matchesPlayed) * 100).toFixed(0)}%` : '0%';
  const hasOmskStats = player.cashValue && player.cashValue > 0;

  const hasSponsors = player.sponsors && player.sponsors.length > 0;
  const showCTA = !hasSponsors && showSponsorshipCallToActionGlobal && player.showSponsorshipCallToAction !== false;

  return (
    <div className="space-y-10 md:space-y-16 animate-in fade-in duration-1000">
    <Card className={cn(
        "glassmorphism overflow-hidden transition-all duration-1000 shadow-[0_40px_120px_rgba(0,0,0,0.7)] border-white/10 rounded-[3.5rem]",
        template === 'modern' && 'flex flex-col md:flex-row',
        template === 'dynamic' && 'border-accent/60 shadow-[0_0_80px_rgba(var(--accent-rgb),0.3)] border-2'
    )}>
        {/* Hero Section */}
        <div className={cn(
            "relative overflow-hidden",
            template === 'classic' && "h-[450px] md:h-[550px]",
            template === 'modern' && "p-12 md:w-1/3 flex flex-col items-center justify-center bg-gradient-to-br from-black/80 to-transparent border-r border-white/10",
            template === 'dynamic' && "h-[400px]"
        )}>
            <Image 
                src={backgroundImageUrl}
                alt=""
                fill
                className={cn(
                    "object-cover transition-all duration-[3000ms]",
                    template === 'classic' && "opacity-40 scale-110",
                    template === 'modern' && "opacity-0",
                    template === 'dynamic' && "opacity-50"
                )}
                unoptimized={backgroundImageUrl.startsWith('data:image')}
                priority
            />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            <div className={cn(
                "absolute transition-all duration-1000 z-10 w-full",
                template === 'classic' && "bottom-0 left-0 p-10 md:p-16 flex flex-col md:flex-row items-center md:items-end gap-10 md:gap-14",
                template === 'modern' && "relative flex flex-col items-center gap-12",
                template === 'dynamic' && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
            )}>
                <div className="relative shrink-0">
                    <Avatar className={cn(
                        "border-4 transition-all duration-1000 shadow-[0_0_80px_rgba(0,0,0,0.8)]",
                        template === 'classic' && "h-44 w-44 md:h-64 md:w-64 border-primary ring-[12px] ring-primary/10",
                        template === 'modern' && "h-52 w-52 md:h-72 md:w-72 border-primary ring-[12px] ring-primary/5",
                        template === 'dynamic' && "h-48 w-48 md:h-64 md:w-64 border-accent ring-[12px] ring-accent/15"
                    )}>
                        <AvatarImage src={currentPlayerData.avatarUrl} alt={currentPlayerData.name} className="object-cover" />
                        <AvatarFallback className="text-6xl md:text-8xl font-headline bg-muted text-muted-foreground">{currentPlayerData.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-4 -right-4 p-4 rounded-[1.5rem] bg-background border-4 border-primary/40 shadow-3xl animate-bounce duration-[4s]">
                        <Trophy className="h-8 w-8 md:h-10 md:w-10 text-gold drop-shadow-[0_0_15px_currentColor]" />
                    </div>
                </div>
                 <div className={cn(template === 'modern' ? 'text-center' : 'flex flex-col items-center md:items-start gap-5 text-center md:text-left')}>
                    <h1 className={cn("font-headline tracking-tighter text-white text-glow-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.9)] leading-none", template === 'classic' ? "text-5xl md:text-9xl" : "text-5xl md:text-8xl")}>{currentPlayerData.name}</h1>
                    <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
                        <Badge variant="secondary" className="font-black uppercase tracking-[0.4em] text-[11px] md:text-[14px] py-2.5 px-8 backdrop-blur-3xl bg-white/10 text-white border-2 border-white/20 shadow-3xl">{currentPlayerData.nickname}</Badge>
                        {player.isQualifiedForFinal && (
                            <Badge className="bg-orange-600 text-white font-black uppercase tracking-[0.3em] animate-pulse shadow-[0_0_40px_rgba(234,88,12,0.5)] py-2.5 px-8 text-[11px] md:text-[14px] border-2 border-orange-400/50">
                                <Award className="h-5 w-5 mr-3" />
                                В ФИНАЛЕ
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="absolute top-8 right-8 md:top-14 md:right-14 z-10 flex flex-col gap-6">
                <div className={cn(
                    "flex flex-col items-center justify-center min-w-[110px] md:min-w-[150px] p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] backdrop-blur-3xl border-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all hover:scale-110 duration-500",
                    template === 'dynamic' ? 'bg-accent/50 border-accent/60 text-accent' : 'bg-primary/50 border-primary/60 text-primary-foreground'
                )}>
                    <span className="text-[11px] md:text-[14px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">МЕСТО</span>
                    <span className="text-4xl md:text-7xl font-headline leading-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                        {currentPlayerData.rank > 0 ? `#${currentPlayerData.rank}` : '—'}
                    </span>
                </div>
            </div>
        </div>

        <CardContent className={cn(
            "p-8 md:p-16 lg:p-24 transition-all duration-1000",
            template === 'modern' && 'md:w-2/3',
            template === 'dynamic' && "pt-40"
        )}>
             {isClient && isAdmin && (
                <div className="mb-14 md:mb-20 p-8 md:p-12 rounded-[3rem] border-2 border-primary/40 bg-primary/10 flex flex-col sm:flex-row items-center justify-between gap-10 shadow-3xl">
                    <div className="text-center sm:text-left">
                        <h4 className="font-headline text-2xl md:text-4xl text-primary tracking-tighter uppercase">АДМИН-СТУДИЯ</h4>
                        <p className="text-[12px] text-muted-foreground uppercase tracking-[0.4em] font-black opacity-60 mt-2">НАСТРОЙКА ПРОФИЛЯ И БИОГРАФИИ</p>
                    </div>
                    <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "destructive" : "default"} size="lg" className="w-full sm:w-auto rounded-[1.5rem] h-16 px-10 shadow-[0_20px_50px_rgba(var(--primary-rgb),0.4)] font-black text-lg uppercase tracking-widest transition-all">
                        {isEditing ? <><X className="mr-3 h-7 w-7" /> ОТМЕНА</> : <><Edit className="mr-3 h-7 w-7" /> ИЗМЕНИТЬ</>}
                    </Button>
                </div>
             )}

             {isEditing && (
                <div className="mb-20 space-y-10 md:space-y-14 p-10 md:p-16 border-2 border-primary/50 rounded-[3.5rem] glassmorphism shadow-4xl animate-in zoom-in-95 duration-700">
                    <div className="grid md:grid-cols-2 gap-10 md:gap-16">
                        <div className="space-y-5">
                            <Label className="text-[12px] md:text-[14px] uppercase font-black tracking-[0.3em] text-primary ml-2">ПРО-НИКНЕЙМ</Label>
                            <Input name="nickname" value={editablePlayer.nickname} onChange={handleInputChange} className="rounded-2xl bg-black/50 h-16 text-xl border-white/10 px-6 font-bold" />
                        </div>
                        <div className="space-y-5">
                            <Label className="text-[12px] md:text-[14px] uppercase font-black tracking-[0.3em] text-primary ml-2">ФОН КАРТОЧКИ</Label>
                            <Select
                                value={editablePlayer.backgroundUrl || ''}
                                onValueChange={(value) => { setEditablePlayer(prev => ({ ...prev, backgroundUrl: value })); setIsFormDirty(true); }}
                            >
                                <SelectTrigger className="h-16 rounded-2xl bg-black/50 border-white/10 px-6 text-xl font-bold">
                                    <SelectValue placeholder="Выберите фон..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-[500px] rounded-3xl glassmorphism border-white/20 p-2">
                                    <SelectItem value=" " className="rounded-xl h-12">Темная тема (стандарт)</SelectItem>
                                    {CardBackgrounds.map(bg => (
                                        <SelectItem key={bg.id} value={bg.url} className="rounded-xl h-16">
                                            <div className="flex items-center gap-6">
                                                <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-white/20"><Image src={bg.url} alt="" fill className="object-cover" unoptimized /></div>
                                                <span className="capitalize text-lg font-black tracking-tight">{bg.hint}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="space-y-5">
                        <Label className="text-[12px] md:text-[14px] uppercase font-black tracking-[0.3em] text-primary ml-2">ЛЕГЕНДА ИГРОКА (БИОГРАФИЯ)</Label>
                        <Textarea name="bio" value={editablePlayer.bio} onChange={handleInputChange} rows={6} className="rounded-[2.5rem] bg-black/50 resize-none p-8 md:p-12 text-lg border-white/10 leading-relaxed font-medium" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-8 pt-8">
                        <Button onClick={handleSave} className='flex-1 h-20 rounded-3xl shadow-[0_30px_80px_rgba(var(--primary-rgb),0.5)] font-black text-xl text-primary-foreground uppercase tracking-[0.2em]' disabled={!isFormDirty}><Save className="mr-3 h-7 w-7" />СОХРАНИТЬ</Button>
                        <Button onClick={() => { setIsEditing(false); setEditablePlayer(player); }} className='flex-1 h-20 rounded-3xl text-xl font-black uppercase tracking-[0.2em]' variant="ghost"><X className="mr-3 h-7 w-7" />СБРОСИТЬ</Button>
                    </div>
                </div>
             )}
            
            <div className="grid grid-cols-1 gap-12 md:gap-20">
                {/* Sponsorship Block - HIGHER VISIBILITY */}
                {showCTA && (
                    <div className="p-8 md:p-12 rounded-[3rem] bg-primary/5 border-2 border-dashed border-primary/30 flex flex-col md:flex-row items-center justify-between gap-8 shadow-inner group/sponsorship transition-all hover:bg-primary/10 animate-shimmer">
                        <div className="flex items-center gap-6">
                            <div className="p-4 rounded-2xl bg-primary/20 text-primary shadow-xl group-hover/sponsorship:rotate-12 transition-transform">
                                <Handshake className="h-10 w-10" />
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="font-headline text-xl md:text-2xl text-primary uppercase tracking-tight">{player.sponsorshipCallToAction || "Станьте спонсором легенды!"}</h3>
                                <p className="text-[10px] md:text-[12px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1">ПОДДЕРЖИТЕ ИГРОКА И ПОЛУЧИТЕ ОХВАТ</p>
                            </div>
                        </div>
                        <Button asChild className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/20 interactive-scale shrink-0 bg-primary text-primary-foreground">
                            <a href="/partners" className="flex items-center gap-3">
                                УЗНАТЬ УСЛОВИЯ
                                <ExternalLink className="h-5 w-5" />
                            </a>
                        </Button>
                    </div>
                )}

                <div className="space-y-10 md:space-y-14">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 md:gap-10">
                        <div className="flex items-center gap-6 md:gap-8">
                            <div className="p-4 rounded-2xl bg-primary/20 text-primary shrink-0 shadow-2xl border border-primary/30">
                                <Info className="h-7 w-7 md:h-9 md:w-9" />
                            </div>
                            <h3 className="text-[12px] md:text-lg font-headline uppercase tracking-[0.4em] text-white/60">БИОГРАФИЯ</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => setAreAllStatsRevealed(!revealAll)}
                                variant="outline" 
                                size="sm" 
                                className="rounded-2xl h-12 px-6 gap-3 border-primary/30 text-primary hover:bg-primary/20 text-[11px] font-black uppercase tracking-widest"
                            >
                                {revealAll ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                {revealAll ? 'СКРЫТЬ ДАННЫЕ' : 'ПОКАЗАТЬ ВСЁ'}
                            </Button>
                            <ScoringHelpDialog settings={scoringSettings} leagueName={leagueNames} sponsorshipSettings={{ groupVkLink: 'https://vk.com/dartbrig' } as any}>
                                <Button variant="ghost" size="sm" className="hidden sm:flex gap-4 rounded-2xl h-12 px-6 text-[11px] md:text-sm uppercase font-black tracking-widest hover:bg-primary/20 text-primary border-2 border-primary/20">
                                    <ShieldCheck className="h-6 w-6" />
                                    ПРАВИЛА
                                </Button>
                            </ScoringHelpDialog>
                        </div>
                    </div>
                    <div className="relative group/bio">
                        <div className="absolute -left-4 top-0 bottom-0 w-2 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] group-hover/bio:scale-y-110 transition-transform duration-700" />
                        <p className="text-lg md:text-2xl lg:text-3xl text-white/95 font-body leading-relaxed italic pl-8 md:pl-12 lg:pl-16 py-6 font-medium bg-white/[0.03] rounded-r-[3rem] shadow-inner border-l border-white/5">
                            {currentPlayerData.bio || "История этой легенды все еще пишется на рубеже. Каждый матч добавляет новую главу в их профессиональную карьеру."}
                        </p>
                    </div>
                </div>

                {hasOmskStats && (
                    <div className="p-10 md:p-16 lg:p-20 rounded-[3rem] md:rounded-[4.5rem] bg-orange-600/15 border-2 border-orange-500/40 relative overflow-hidden group/omsk shadow-4xl transition-all hover:bg-orange-600/20">
                        <div className="absolute -top-20 -right-20 p-4 opacity-10 group-hover/omsk:scale-110 transition-all duration-[3000ms]">
                            <Sunset className="h-64 w-64 md:h-[500px] md:w-[500px] text-orange-500" />
                        </div>
                        <div className="flex items-center gap-6 md:gap-10 mb-8 md:mb-12 relative z-10">
                            <div className="p-4 rounded-3xl bg-orange-500/30 text-orange-400 border-2 border-orange-500/40 shadow-3xl">
                                <Wallet className="h-8 w-8 md:h-12 md:w-12" />
                            </div>
                            <div>
                                <h3 className="text-[12px] md:text-lg font-headline uppercase tracking-[0.4em] text-orange-300">ВЕЧЕРНИЙ ОМСК</h3>
                                <p className="text-[10px] md:text-[13px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60 mt-1">ТЕКУЩИЙ ФИНАНСОВЫЙ БАЛАНС</p>
                            </div>
                        </div>
                        <div className="flex relative z-10">
                            <span className="text-5xl md:text-8xl lg:text-9xl font-headline text-orange-400 text-glow-accent drop-shadow-[0_10px_40px_rgba(0,0,0,0.7)]">{(player.cashValue || 0).toLocaleString('ru-RU')} ₽</span>
                        </div>
                    </div>
                )}

                <Separator className="opacity-10" />
                
                <div className="space-y-16 md:space-y-24 lg:space-y-32">
                    <div>
                        <div className="flex items-center gap-6 md:gap-8 mb-10 md:mb-16 lg:mb-20">
                            <div className="p-4 rounded-2xl bg-primary/20 text-primary shadow-2xl border border-primary/30">
                                <TrendingUp className="h-7 w-7 md:h-9 md:w-9" />
                            </div>
                            <h3 className="text-[12px] md:text-lg font-headline uppercase tracking-[0.4em] text-white/60">КАРЬЕРНЫЙ ДАШБОРД</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-8 lg:gap-10">
                            <StatItem 
                                template={template} 
                                label="ОЧКИ" 
                                name="points" 
                                value={player.points} 
                                caption="ВСЕГО В СЕЗОНЕ"
                                description="Общее количество рейтинговых очков, заработанных во всех активных лигах." 
                            />
                            <StatItem 
                                template={template} 
                                label="ТУРЫ" 
                                name="matchesPlayed" 
                                value={player.matchesPlayed} 
                                caption="УЧАСТИЕ"
                                description="Общее количество официальных турниров, которые посетил игрок." 
                            />
                            <StatItem 
                                template={template} 
                                label="ТОП-8" 
                                name="wins" 
                                value={player.wins} 
                                caption="ПЛЕЙ-ОФФ"
                                description="Сколько раз игрок выходил в четвертьфинал или выше." 
                            />
                            <StatItem 
                                template={template} 
                                label="ГРУППА" 
                                name="losses" 
                                value={player.losses} 
                                caption="ВЫЛЕТЫ"
                                description="Турниры, в которых игрок завершил выступление на групповой стадии." 
                            />
                            <StatItem 
                                template={template} 
                                label="ЭФФ." 
                                name="winRate" 
                                value={winRate} 
                                caption="КОЭФФИЦИЕНТ"
                                description="Процент попадания в плей-офф от общего количества сыгранных турниров." 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 lg:gap-20">
                        <div className="glassmorphism p-8 md:p-12 lg:p-16 rounded-[3.5rem] border-white/10 relative overflow-hidden shadow-4xl flex flex-col group/box h-full min-h-[350px] hover:border-primary/30 transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover/box:opacity-100 transition-opacity duration-1000" />
                            <h3 className="text-[11px] md:text-[14px] font-headline uppercase tracking-[0.4em] text-white/40 mb-10 md:mb-14 flex items-center gap-4 relative z-10">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                АНАЛИЗ РЕЗУЛЬТАТОВ
                            </h3>
                            <div className="grid grid-cols-2 gap-6 md:gap-10 relative z-10 mt-auto">
                                <StatItem 
                                    template={template} 
                                    label="БАЗОВЫЕ" 
                                    name="basePoints" 
                                    value={player.basePoints} 
                                    caption="ЗА МЕСТА"
                                    interactive={!revealAll} 
                                    forcedReveal={revealAll} 
                                    description="Очки, начисленные строго за итоговую позицию в турнирах." 
                                />
                                <StatItem 
                                    template={template} 
                                    label="БОНУСЫ" 
                                    name="bonusPoints" 
                                    value={`+${player.bonusPoints}`} 
                                    caption="ЗА СТАТИСТИКУ"
                                    interactive={!revealAll} 
                                    forcedReveal={revealAll} 
                                    description="Дополнительные очки за 180, высокие чекауты и средний набор." 
                                />
                            </div>
                        </div>

                        <div className="glassmorphism p-8 md:p-12 lg:p-16 rounded-[3.5rem] border-white/10 relative overflow-hidden shadow-4xl flex flex-col group/box h-full min-h-[350px] hover:border-accent/30 transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover/box:opacity-100 transition-opacity duration-1000" />
                            <h3 className="text-[11px] md:text-[14px] font-headline uppercase tracking-[0.4em] text-white/40 mb-10 md:mb-14 flex items-center gap-4 relative z-10">
                                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                                ЛИЧНЫЕ РЕКОРДЫ
                            </h3>
                            <div className="grid grid-cols-3 gap-4 md:gap-6 relative z-10 mt-auto">
                                <StatItem 
                                    template={template} 
                                    label="СРЕДНИЙ" 
                                    name="avg" 
                                    value={(Number(player.avg) || 0).toFixed(1)} 
                                    caption="НАБОР"
                                    interactive={!revealAll} 
                                    forcedReveal={revealAll} 
                                    description="Средний балл за 3 дротика на протяжении карьеры." 
                                />
                                <StatItem 
                                    template={template} 
                                    label="180-ки" 
                                    name="n180s" 
                                    value={player.n180s} 
                                    caption="МАКСИМУМЫ"
                                    interactive={!revealAll} 
                                    forcedReveal={revealAll} 
                                    description="Общее количество идеальных подходов по 180 очков." 
                                />
                                <StatItem 
                                    template={template} 
                                    label="ЧЕКАУТ" 
                                    name="hiOut" 
                                    value={Number(player.hiOut) || 0} 
                                    caption="ФИНИШ"
                                    interactive={!revealAll} 
                                    forcedReveal={revealAll} 
                                    description="Самое высокое закрытие лега в официальных матчах." 
                                />
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