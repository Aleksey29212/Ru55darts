
'use client';

import type { Player, PlayerProfile, ScoringSettings, SponsorTemplateId, PlayerSponsor } from '@/lib/types';
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
import { Save, Edit, X, Zap, Trophy, Wallet, Award, Sunset, TrendingUp, ShieldCheck, Handshake, ExternalLink, Lock, Eye, Copy, Check, AlertCircle, Sparkles, Target, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { TemplateId } from './template-switcher';
import { cn } from '@/lib/utils';
import { useIsClient } from '@/hooks/use-is-client';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useFirestore } from '@/firebase';
import { updatePlayerProfile } from '@/firebase/players';
import { CardBackgrounds } from '@/lib/card-backgrounds';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScoringHelpDialog } from './scoring-help-dialog';

const StatItem = ({ 
    label, 
    value, 
    name, 
    template = 'classic', 
    description,
    caption,
}: { 
    label: string; 
    value: string | number; 
    name: string, 
    template?: TemplateId, 
    description?: string,
    caption?: string,
}) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const valueString = String(value);
    const len = valueString.length;
    
    // Единый базовый размер как в AVG, с адаптацией под длинные числа
    let fontSizeClass = "text-3xl sm:text-4xl lg:text-5xl"; 
    
    if (len >= 6) {
        fontSizeClass = "text-xl sm:text-2xl lg:text-3xl"; 
    } else if (len >= 4) {
        fontSizeClass = "text-2xl sm:text-3xl lg:text-4xl"; 
    }
    
    const baseClasses = "flex flex-col items-center justify-between p-2 sm:p-4 rounded-[2rem] transition-all border shadow-2xl relative w-full h-full min-h-[150px] sm:min-h-[180px] cursor-pointer active:scale-95 select-none overflow-hidden";
    
    const templateClasses = {
        classic: "glassmorphism bg-white/5 border-white/10 hover:border-primary/40",
        modern: "bg-background/60 backdrop-blur-md border-white/5",
        dynamic: "bg-black/80 text-white border-accent/50 shadow-[0_0_30px_rgba(var(--accent-rgb),0.2)]",
        elite: "bg-gradient-to-br from-neutral-900 to-black border-gold/30 shadow-[0_0_40px_rgba(255,215,0,0.1)]",
        cyber: "bg-[#0a0a0f] border-cyan-500/40 border-l-4 rounded-none skew-x-[-2deg]",
        retro: "bg-[#1a1a1a] border-4 border-pink-500 rounded-none shadow-[4px_4px_0_0_rgba(236,72,153,1)]",
        impact: "bg-black/40 backdrop-blur-xl border-white/20",
        minimal: "bg-white/[0.02] border-white/10 rounded-xl",
        arena: "bg-gradient-to-t from-primary/20 to-transparent border-white/5 rounded-t-[3rem]",
        stealth: "bg-neutral-950 border-white/[0.03] shadow-none"
    };

    const valueClasses = cn(
        "font-headline tracking-tighter leading-none w-full text-center drop-shadow-2xl transition-all duration-700 animate-in fade-in zoom-in-95 px-0.5",
        fontSizeClass,
        (name === 'avg' || name === 'n180s' || name === 'hiOut' || name === 'winRate' || name === 'points') ? 'text-primary text-glow' : 'text-white',
        template === 'dynamic' ? 'text-accent text-glow-accent' : '',
        template === 'elite' ? 'text-gold text-glow' : '',
        template === 'cyber' ? 'text-cyan-400 font-mono italic' : '',
        template === 'retro' ? 'text-yellow-400' : ''
    );
    
    return (
        <div 
            className={cn(
                "relative group", 
                baseClasses, 
                templateClasses[template]
            )}
            onClick={() => setIsRevealed(!isRevealed)}
        >
            <div className="w-full flex items-center justify-center gap-1 mb-1">
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-tight text-muted-foreground/80 leading-tight text-center break-words max-w-[85%]">
                    {label}
                </span>
                
                {/* Popover для гарантированной работы на мобильных (Touch Friendly) */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button 
                            className="p-1 -m-1 hover:text-primary transition-all active:scale-90 shrink-0 outline-none"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary/60 hover:text-primary animate-pulse" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent 
                        side="top" 
                        className="max-w-[280px] bg-black/95 backdrop-blur-3xl border-primary/50 z-[100] p-5 rounded-2xl shadow-2xl"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                                <AlertCircle className="h-4 w-4 text-primary" />
                                <p className="text-[10px] font-headline text-white uppercase tracking-widest">{label}</p>
                            </div>
                            <p className="text-xs leading-relaxed font-bold text-white/95 italic">
                                {description || "Профессиональная метрика игрока."}
                            </p>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            
            <div className="flex-1 flex items-center justify-center w-full my-1 sm:my-2 overflow-visible">
                {isRevealed ? (
                    <span className={valueClasses}>{value}</span>
                ) : (
                    <div className="flex flex-col items-center gap-2 animate-in fade-in duration-500">
                        <div className="p-2.5 sm:p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                            <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-primary opacity-60 group-hover:opacity-100" />
                        </div>
                        <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-widest text-primary/40 group-hover:text-primary/60">ОТКРЫТЬ</span>
                    </div>
                )}
            </div>

            <div className="w-full mt-auto">
                <div className="h-px w-full bg-white/10 mb-1 sm:mb-1.5" />
                <p className="text-[7px] sm:text-[9px] font-black uppercase text-primary/70 tracking-tight text-center leading-tight break-words px-0.5">
                    {caption || "СТАТ"}
                </p>
            </div>
        </div>
    );
}

function SponsorWidget({ sponsor, template }: { sponsor: PlayerSponsor, template: TemplateId }) {
    const [showPromo, setShowPromo] = useState(false);
    const [hasCopied, setHasCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (sponsor.promoCode) {
            navigator.clipboard.writeText(sponsor.promoCode);
            setHasCopied(true);
            toast({ title: 'Скопировано', description: `Промокод ${sponsor.promoCode} готов к использованию.` });
            setTimeout(() => setHasCopied(false), 2000);
        }
    };

    return (
        <div className={cn(
            "group/sponsor relative h-24 w-full overflow-hidden shadow-xl transition-all active:scale-95",
            template === 'retro' ? "border-2 border-cyan-400 rounded-none bg-black" : "glassmorphism rounded-2xl border border-white/10 hover:border-primary/40"
        )}>
            <div className={cn(
                "absolute inset-0 flex items-center justify-center p-4 transition-all duration-500",
                showPromo ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
            )}>
                <Image src={sponsor.logoUrl} alt={sponsor.name} fill className="object-contain p-4 filter brightness-125 group-hover/sponsor:brightness-150 transition-all" unoptimized={sponsor.logoUrl.startsWith('data:')} />
            </div>

            <div className={cn(
                "absolute inset-0 bg-primary/95 flex flex-col items-center justify-center p-2 text-center transition-all duration-500",
                showPromo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
            )}>
                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">ВАШ ПРОМОКОД</p>
                <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg mb-2">
                    <span className="font-headline text-lg text-black">{sponsor.promoCode}</span>
                    <button onClick={handleCopy} className="p-1 hover:bg-black/10 rounded transition-colors">
                        {hasCopied ? <Check className="h-4 w-4 text-black" /> : <Copy className="h-4 w-4 text-black" />}
                    </button>
                </div>
                <button onClick={() => setShowPromo(false)} className="text-[8px] font-bold text-black/60 uppercase hover:text-black">Скрыть</button>
            </div>

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/sponsor:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                {!showPromo && (
                    <>
                        <Button asChild variant="secondary" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest w-[80%] bg-white text-black hover:bg-white/90">
                            <a href={sponsor.linkUrl} target="_blank" rel="noopener noreferrer">
                                ПЕРЕЙТИ <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                        </Button>
                        {sponsor.promoCode && (
                            <Button onClick={() => setShowPromo(true)} variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest w-[80%] text-white border border-white/20 hover:bg-white/10">
                                ПРОМОКОД <Eye className="ml-1 h-3 w-3" />
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
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

  const containerClasses = {
    classic: "glassmorphism rounded-[3rem] border-white/10",
    modern: "flex flex-col md:flex-row bg-black/40 border-white/10 rounded-[2rem]",
    dynamic: "border-accent/60 shadow-[0_0_80px_rgba(var(--accent-rgb),0.3)] border-2 rounded-[3rem]",
    elite: "bg-black border-gold/40 border-[3px] rounded-[4rem] shadow-[0_0_100px_rgba(255,215,0,0.15)]",
    cyber: "bg-[#0a0a0f] border-cyan-500 rounded-none skew-x-[-1deg]",
    retro: "bg-black border-8 border-pink-500 rounded-none shadow-[12px_12px_0_0_rgba(59,130,246,1)]",
    impact: "bg-black/80 backdrop-blur-3xl border-white/20 rounded-[2.5rem]",
    minimal: "bg-neutral-900/50 border-white/5 rounded-3xl",
    arena: "bg-[#050505] border-primary/30 rounded-t-[5rem] shadow-4xl",
    stealth: "bg-black border-neutral-800 rounded-none"
  };

  const headerHeight = {
    classic: "h-[400px] md:h-[550px]",
    modern: "md:w-1/3 p-10 flex flex-col items-center justify-center bg-gradient-to-br from-black/80 to-transparent border-r border-white/10",
    dynamic: "h-[350px]",
    elite: "h-[450px] md:h-[600px] bg-gradient-to-b from-neutral-800/20 to-transparent",
    cyber: "h-[300px] overflow-visible border-b border-cyan-500/20",
    retro: "h-[300px] bg-black p-4",
    impact: "h-[600px] relative overflow-hidden",
    minimal: "h-[250px] md:h-[300px] bg-white/[0.02]",
    arena: "h-[500px] md:h-[650px] relative",
    stealth: "h-[300px] md:h-[400px]"
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-1000">
    <Card className={cn(
        "overflow-hidden transition-all duration-1000 shadow-[0_40px_120px_rgba(0,0,0,0.7)]",
        containerClasses[template]
    )}>
        <div className={cn(
            "relative overflow-hidden",
            headerHeight[template]
        )}>
            {/* Background Image Logic */}
            {(template !== 'modern' && template !== 'minimal' && template !== 'retro') && (
                <Image 
                    src={backgroundImageUrl}
                    alt=""
                    fill
                    className={cn(
                        "object-cover transition-all duration-[3000ms]",
                        template === 'impact' ? 'opacity-80' : 'opacity-40',
                        template === 'arena' ? 'opacity-20 scale-125 brightness-50' : '',
                        template === 'elite' ? 'opacity-10 grayscale' : '',
                        template === 'cyber' ? 'opacity-30 blur-sm' : ''
                    )}
                    unoptimized={backgroundImageUrl.startsWith('data:image')}
                    priority
                />
            )}
            
            {template === 'arena' && (
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-0" />
            )}

            <div className={cn(
                "absolute transition-all duration-1000 z-10 w-full px-6",
                template === 'classic' && "bottom-0 left-0 p-8 md:p-12 flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12",
                template === 'modern' && "relative flex flex-col items-center gap-10",
                template === 'dynamic' && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
                template === 'elite' && "bottom-0 left-0 p-12 flex flex-col items-center w-full",
                template === 'cyber' && "bottom-4 left-10 flex flex-row items-center gap-10",
                template === 'retro' && "relative flex flex-row items-center gap-8",
                template === 'impact' && "inset-0 flex flex-col items-center justify-center gap-8",
                template === 'minimal' && "inset-0 flex flex-col items-center justify-center",
                template === 'arena' && "bottom-0 p-16 flex flex-col items-center gap-10",
                template === 'stealth' && "bottom-0 left-0 p-10 flex flex-row items-center gap-10"
            )}>
                <div className="relative shrink-0">
                    <Avatar className={cn(
                        "border-4 transition-all duration-1000 shadow-[0_0_60px_rgba(0,0,0,0.8)]",
                        template === 'classic' && "h-40 w-40 md:h-64 md:w-64 border-primary ring-[10px] ring-primary/10",
                        template === 'modern' && "h-48 w-48 md:h-64 md:w-64 border-primary ring-[10px] ring-primary/5",
                        template === 'dynamic' && "h-44 w-44 md:h-60 md:w-60 border-accent ring-[10px] ring-accent/15",
                        template === 'elite' && "h-56 w-56 md:h-80 md:w-80 border-gold ring-[15px] ring-gold/10",
                        template === 'cyber' && "h-32 w-32 md:h-48 md:w-48 border-cyan-400 rounded-none skew-x-[-10deg]",
                        template === 'retro' && "h-32 w-32 md:h-48 md:w-48 border-4 border-yellow-400 rounded-none",
                        template === 'impact' && "h-64 w-64 md:h-96 md:w-96 border-white/40 ring-[20px] ring-black/40",
                        template === 'minimal' && "h-32 w-32 md:h-48 md:w-48 border-white/10",
                        template === 'arena' && "h-56 w-56 md:h-[28rem] md:w-[28rem] border-primary/40 ring-[20px] ring-primary/5",
                        template === 'stealth' && "h-40 w-40 md:h-56 md:w-56 border-neutral-800"
                    )}>
                        <AvatarImage src={currentPlayerData.avatarUrl} alt={currentPlayerData.name} className="object-cover" />
                        <AvatarFallback className="text-5xl md:text-7xl font-headline bg-muted text-muted-foreground">{currentPlayerData.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    {/* Badge Trophy */}
                    <div className={cn(
                        "absolute p-3 rounded-[1.25rem] bg-background border-4 shadow-3xl animate-bounce duration-[4s]",
                        template === 'elite' ? 'border-gold -top-4 -left-4' : '-bottom-2 -right-2 border-primary/40'
                    )}>
                        <Trophy className={cn("h-6 w-6 md:h-8 md:w-8 drop-shadow-[0_0_12px_currentColor]", template === 'elite' ? 'text-gold' : 'text-primary')} />
                    </div>
                </div>

                 <div className={cn(
                    template === 'modern' || template === 'elite' || template === 'impact' || template === 'minimal' || template === 'arena' 
                        ? 'text-center' 
                        : 'flex flex-col items-center md:items-start gap-4 text-center md:text-left'
                 )}>
                    <h1 className={cn(
                        "font-headline tracking-tighter text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.9)] leading-none", 
                        template === 'classic' ? "text-4xl md:text-8xl" : "text-4xl md:text-7xl",
                        template === 'elite' ? "text-gold text-glow-white md:text-9xl mb-4" : "",
                        template === 'cyber' ? "italic text-cyan-400" : "",
                        template === 'retro' ? "text-yellow-400 font-black italic" : "",
                        template === 'arena' ? "md:text-[10rem] text-glow-white opacity-90" : ""
                    )}>{currentPlayerData.name}</h1>
                    
                    <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
                        <Badge variant="secondary" className={cn(
                            "font-black uppercase tracking-[0.3em] text-[10px] md:text-[12px] py-2 px-6 backdrop-blur-3xl shadow-3xl",
                            template === 'retro' ? "bg-cyan-500 rounded-none border-black border-2" : "bg-white/10 text-white border-2 border-white/20",
                            template === 'elite' ? "bg-gold text-black border-black" : ""
                        )}>{currentPlayerData.nickname}</Badge>
                        {player.isQualifiedForFinal && (
                            <Badge className="bg-orange-600 text-white font-black uppercase tracking-[0.2em] animate-pulse shadow-[0_0_30px_rgba(234,88,12,0.5)] py-2 px-6 text-[10px] md:text-[12px] border-2 border-orange-400/50">
                                <Award className="h-4 w-4 mr-2" />
                                В ФИНАЛЕ
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Rank Plaque */}
            <div className={cn(
                "absolute z-10 flex flex-col gap-4",
                template === 'cyber' ? 'top-0 right-0' : 'top-6 right-6 md:top-10 md:right-10'
            )}>
                <div className={cn(
                    "flex flex-col items-center justify-center min-w-[100px] md:min-w-[130px] p-5 md:p-7 backdrop-blur-3xl border-2 shadow-[0_15px_50px_rgba(0,0,0,0.6)] transition-all hover:scale-110 duration-500",
                    template === 'dynamic' ? 'bg-accent/50 border-accent/60 text-accent' : 'bg-primary/50 border-primary/60 text-primary-foreground',
                    template === 'elite' ? 'bg-black/80 border-gold rounded-full h-32 w-32 md:h-48 md:w-48' : 'rounded-[2rem] md:rounded-[3rem]',
                    template === 'cyber' ? 'bg-[#0a0a0f] border-cyan-500 rounded-none' : '',
                    template === 'retro' ? 'bg-pink-500 border-black rounded-none h-24 w-24' : ''
                )}>
                    <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">МЕСТО</span>
                    <span className={cn("text-3xl md:text-6xl font-headline leading-none drop-shadow-[0_4px_15px_rgba(0,0,0,0.6)]", template === 'elite' ? 'text-gold' : '')}>
                        {currentPlayerData.rank > 0 ? `#${currentPlayerData.rank}` : '—'}
                    </span>
                </div>
            </div>
        </div>

        <CardContent className={cn(
            "p-6 md:p-12 transition-all duration-1000",
            template === 'modern' && 'md:w-2/3',
            template === 'dynamic' && "pt-32",
            template === 'elite' && "pt-24",
            template === 'retro' && "bg-[#1a1a1a]"
        )}>
             {isClient && isAdmin && (
                <div className="mb-10 md:mb-16 p-6 md:p-10 rounded-[2.5rem] border-2 border-primary/40 bg-primary/10 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-3xl">
                    <div className="text-center sm:text-left">
                        <h4 className="font-headline text-xl md:text-3xl text-primary tracking-tighter uppercase">АДМИН-СТУДИЯ</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60 mt-1">НАСТРОЙКА ПРОФИЛЯ</p>
                    </div>
                    <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "destructive" : "default"} size="lg" className="w-full sm:w-auto rounded-[1.25rem] h-14 px-8 shadow-xl font-black text-base uppercase tracking-widest transition-all">
                        {isEditing ? <><X className="mr-2 h-6 w-6" /> ОТМЕНА</> : <><Edit className="mr-2 h-6 w-6" /> ИЗМЕНИТЬ</>}
                    </Button>
                </div>
             )}

             {isEditing && (
                <div className="mb-16 space-y-8 md:space-y-12 p-8 md:p-12 border-2 border-primary/50 rounded-[3rem] glassmorphism shadow-4xl animate-in zoom-in-95 duration-700">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                        <div className="space-y-4">
                            <Label className="text-[11px] md:text-[13px] uppercase font-black tracking-[0.2em] text-primary ml-2">ПРО-НИКНЕЙМ</Label>
                            <Input name="nickname" value={editablePlayer.nickname} onChange={handleInputChange} className="rounded-xl bg-black/50 h-14 text-lg border-white/10 px-5 font-bold" />
                        </div>
                        <div className="space-y-4">
                            <Label className="text-[11px] md:text-[13px] uppercase font-black tracking-[0.2em] text-primary ml-2">ФОН КАРТОЧКИ</Label>
                            <Select
                                value={editablePlayer.backgroundUrl || ''}
                                onValueChange={(value) => { setEditablePlayer(prev => ({ ...prev, backgroundUrl: value })); setIsFormDirty(true); }}
                            >
                                <SelectTrigger className="h-14 rounded-xl bg-black/50 border-white/10 px-5 text-lg font-bold">
                                    <SelectValue placeholder="Выберите фон..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-[400px] rounded-2xl glassmorphism border-white/20 p-2">
                                    <SelectItem value=" " className="rounded-lg h-10">Темная тема (стандарт)</SelectItem>
                                    {CardBackgrounds.map(bg => (
                                        <SelectItem key={bg.id} value={bg.url} className="rounded-lg h-14">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-8 rounded border border-white/20"><Image src={bg.url} alt="" fill className="object-cover" unoptimized /></div>
                                                <span className="capitalize text-base font-black tracking-tight">{bg.hint}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <Label className="text-[11px] md:text-[13px] uppercase font-black tracking-[0.2em] text-primary ml-2">ЛЕГЕНДА ИГРОКА (БИОГРАФИЯ)</Label>
                        <Textarea name="bio" value={editablePlayer.bio} onChange={handleInputChange} rows={5} className="rounded-[2rem] bg-black/50 resize-none p-6 md:p-10 text-base border-white/10 leading-relaxed font-medium" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 pt-6">
                        <Button onClick={handleSave} className='flex-1 h-16 rounded-2xl shadow-xl font-black text-lg text-primary-foreground uppercase tracking-[0.1em]' disabled={!isFormDirty}><Save className="mr-2 h-6 w-6" />СОХРАНИТЬ</Button>
                        <Button onClick={() => { setIsEditing(false); setEditablePlayer(player); }} className='flex-1 h-16 rounded-2xl text-lg font-black uppercase tracking-[0.1em]' variant="ghost"><X className="mr-2 h-6 w-6" />СБРОСИТЬ</Button>
                    </div>
                </div>
             )}
            
            <div className="grid grid-cols-1 gap-10 md:gap-16">
                {showSponsors && hasSponsors && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className="h-1 w-8 rounded-full bg-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">ПАРТНЕРЫ ИГРОКА</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {player.sponsors?.map((sponsor, idx) => (
                                <SponsorWidget key={idx} sponsor={sponsor} template={template} />
                            ))}
                        </div>
                    </div>
                )}

                {showCTA && (
                    <div className={cn(
                        "p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner group/sponsorship transition-all",
                        template === 'retro' ? "border-4 border-dashed border-cyan-400 bg-black rounded-none" : "rounded-[2.5rem] bg-primary/5 border-2 border-dashed border-primary/30 hover:bg-primary/10"
                    )}>
                        <div className="flex items-center gap-5">
                            <div className="p-3 rounded-xl bg-primary/20 text-primary shadow-lg group-hover/sponsorship:rotate-12 transition-transform">
                                <Handshake className="h-8 w-8" />
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="font-headline text-lg md:text-xl text-primary uppercase tracking-tight">{player.sponsorshipCallToAction || "Станьте спонсором легенды!"}</h3>
                                <p className="text-[9px] md:text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-0.5">ПОДДЕРЖИТЕ ИГРОКА И ПОЛУЧИТЕ ОХВАТ</p>
                            </div>
                        </div>
                        <Button asChild className="h-14 px-8 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 interactive-scale shrink-0 bg-primary text-primary-foreground">
                            <a href="/partners" className="flex items-center gap-2">
                                УЗНАТЬ УСЛОВИЯ
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                )}

                <div className="space-y-8 md:space-y-12">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-8">
                        <div className="flex items-center gap-5 md:gap-6">
                            <div className="p-3 rounded-xl bg-primary/20 text-primary shrink-0 shadow-xl border border-primary/30">
                                <Zap className="h-6 w-6 md:h-8 md:w-8" />
                            </div>
                            <h3 className="text-[11px] md:text-base font-headline uppercase tracking-[0.3em] text-white/60">БИОГРАФИЯ</h3>
                        </div>
                        <ScoringHelpDialog settings={scoringSettings} leagueName={leagueNames} sponsorshipSettings={{ groupVkLink: 'https://vk.com/dartbrig' } as any}>
                            <Button variant="ghost" size="sm" className="flex gap-3 rounded-xl h-10 px-5 text-[10px] md:text-xs uppercase font-black tracking-widest hover:bg-primary/20 text-primary border-2 border-primary/20">
                                <Trophy className="h-5 w-5 animate-pulse" />
                                РЕГЛАМЕНТ
                            </Button>
                        </ScoringHelpDialog>
                    </div>
                    <div className="relative group/bio">
                        <div className={cn(
                            "absolute -left-3 top-0 bottom-0 w-1.5 rounded-full transition-transform duration-700 group-hover/bio:scale-y-110",
                            template === 'elite' ? 'bg-gold shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 'bg-gradient-to-b from-primary via-primary/50 to-transparent shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]'
                        )} />
                        <p className={cn(
                            "text-base md:text-xl lg:text-2xl font-body leading-relaxed italic pl-6 md:pl-10 lg:pl-14 py-4 font-medium",
                            template === 'retro' ? "text-cyan-400 bg-black border-2 border-cyan-400" : "text-white/95 bg-white/[0.02] rounded-r-[2.5rem] shadow-inner border-l border-white/5"
                        )}>
                            {currentPlayerData.bio || "История этой легенды все еще пишется на рубеже. Каждый матч добавляет новую главу в их профессиональную карьеру."}
                        </p>
                    </div>
                </div>

                {hasOmskStats && (
                    <div className={cn(
                        "p-8 md:p-14 border-2 relative overflow-hidden group/omsk shadow-4xl transition-all",
                        template === 'elite' ? 'bg-gold/5 border-gold/40 rounded-full' : 'rounded-[2.5rem] md:rounded-[4rem] bg-orange-600/15 border-orange-500/40 hover:bg-orange-600/20'
                    )}>
                        <div className="absolute -top-16 -right-16 p-4 opacity-10 group-hover/omsk:scale-110 transition-all duration-[3000ms]">
                            <Sunset className="h-56 w-56 md:h-[400px] md:w-[400px] text-orange-500" />
                        </div>
                        <div className="flex items-center gap-5 md:gap-8 mb-6 md:mb-10 relative z-10">
                            <div className="p-3 rounded-2xl bg-orange-500/30 text-orange-400 border-2 border-orange-500/40 shadow-2xl">
                                <Wallet className="h-7 w-7 md:h-10 md:w-10" />
                            </div>
                            <div>
                                <h3 className="text-[11px] md:text-base font-headline uppercase tracking-[0.3em] text-orange-300">ВЕЧЕРНИЙ ОМСК</h3>
                                <p className="text-[9px] md:text-[12px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60 mt-0.5">ТЕКУЩИЙ БАЛАНС</p>
                            </div>
                        </div>
                        <div className="flex relative z-10">
                            <span className="text-4xl md:text-7xl lg:text-8xl font-headline text-orange-400 text-glow-accent drop-shadow-[0_8px_30px_rgba(0,0,0,0.7)]">{(player.cashValue || 0).toLocaleString('ru-RU')} ₽</span>
                        </div>
                    </div>
                )}

                <Separator className="opacity-10" />
                
                <div className="space-y-12 md:space-y-20 lg:space-y-24">
                    <div>
                        <div className="flex items-center gap-5 md:gap-6 mb-8 md:mb-12">
                            <div className="p-3 rounded-xl bg-primary/20 text-primary shadow-xl border border-primary/30">
                                <TrendingUp className="h-6 w-6 md:h-8 md:w-8" />
                            </div>
                            <h3 className="text-[11px] md:text-base font-headline uppercase tracking-[0.3em] text-white/60">КАРЬЕРНЫЙ ДАШБОРД</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-5 lg:gap-6">
                            <StatItem 
                                template={template} 
                                label="ОЧК" 
                                name="points" 
                                value={player.points} 
                                caption="ИТГ"
                                description="Суммарный рейтинг игрока в этой лиге. Складывается из базовых очков за занятые места и всех заработанных бонусов (180, чекауты и др.) за текущий сезон." 
                            />
                            <StatItem 
                                template={template} 
                                label="ТУР" 
                                name="matchesPlayed" 
                                value={player.matchesPlayed} 
                                caption="МТЧ"
                                description="Общий стаж игрока в системе DartBrig Pro. Показывает количество официальных турниров, в которых спортсмен принял участие." 
                            />
                            <StatItem 
                                template={template} 
                                label="Т-8" 
                                name="wins" 
                                value={player.wins} 
                                caption="П-ОФ"
                                description="Показатель мастерства прохождения сетки. Учитывает все выходы в 1/4 финала, полуфиналы и финалы (плей-офф стадию)." 
                            />
                            <StatItem 
                                template={template} 
                                label="ГРП" 
                                name="losses" 
                                value={player.losses} 
                                caption="ВЫЛ"
                                description="Количество турниров, в которых игрок завершил выступление на групповой стадии, не сумев пробиться в сетку на выбывание." 
                            />
                            <StatItem 
                                template={template} 
                                label="ЭФФ" 
                                name="winRate" 
                                value={winRate} 
                                caption="ПЦТ"
                                description="Коэффициент результативности. Показывает процент выходов в стадию плей-офф относительно общего количества сыгранных турниров." 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
                        <div className={cn(
                            "p-6 md:p-10 border-white/10 relative shadow-4xl flex flex-col group/box h-full transition-all duration-500",
                            template === 'retro' ? "border-4 border-yellow-400 bg-black rounded-none" : "glassmorphism rounded-[3rem] hover:border-primary/30"
                        )}>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover/box:opacity-100 transition-opacity duration-1000 rounded-[3rem]" />
                            <h3 className="text-[10px] md:text-[13px] font-headline uppercase tracking-[0.3em] text-white/40 mb-8 flex items-center gap-3 relative z-10">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                АНАЛИЗ РЕЗУЛЬТАТОВ
                            </h3>
                            <div className="grid grid-cols-2 gap-4 sm:gap-6 relative z-10 mt-auto">
                                <StatItem 
                                    template={template} 
                                    label="БАЗОВЫЕ" 
                                    name="basePoints" 
                                    value={player.basePoints} 
                                    caption="ЗА МЕСТА"
                                    description="Очки за чисто спортивный результат. Начисляются согласно официальной таблице рангов лиги в зависимости от итогового места в туре." 
                            />
                                <StatItem 
                                    template={template} 
                                    label="БОНУСЫ" 
                                    name="bonusPoints" 
                                    value={`+${player.bonusPoints}`} 
                                    caption="БОНУСЫ"
                                    description="Баллы за профессиональные достижения в матчах: заходы в 180, высокие закрытия (Hi-Out) и высокий средний набор за турнир." 
                                />
                            </div>
                        </div>

                        <div className={cn(
                            "p-6 md:p-10 border-white/10 relative shadow-4xl flex flex-col group/box h-full transition-all duration-500",
                            template === 'retro' ? "border-4 border-cyan-400 bg-black rounded-none" : "glassmorphism rounded-[3rem] hover:border-accent/30"
                        )}>
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover/box:opacity-100 transition-opacity duration-1000 rounded-[3rem]" />
                            <h3 className="text-[10px] md:text-[13px] font-headline uppercase tracking-[0.3em] text-white/40 mb-8 flex items-center gap-3 relative z-10">
                                <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                                ЛИЧНЫЕ РЕКОРДЫ
                            </h3>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3 relative z-10 mt-auto">
                                <StatItem 
                                    template={template} 
                                    label="СР-Й" 
                                    name="avg" 
                                    value={(Number(player.avg) || 0).toFixed(1)} 
                                    caption="НАБОР"
                                    description="Average (Средний набор). Ключевой индикатор класса дартсмена: среднее количество очков, набираемое за один подход из 3 дротиков." 
                                />
                                <StatItem 
                                    template={template} 
                                    label="180-КИ" 
                                    name="n180s" 
                                    value={player.n180s} 
                                    caption="МАКСИМУМЫ"
                                    description="Количество 'максимумов'. Регистрируется каждый раз, когда игрок попадает всеми тремя дротиками в сектор 'утроение 20' за один подход." 
                                />
                                <StatItem 
                                    template={template} 
                                    label="ЧЕКАУТ" 
                                    name="hiOut" 
                                    value={Number(player.hiOut) || 0} 
                                    caption="ФИНИШ"
                                    description="Max Out (Максимальный чекаут). Лучший результат закрытия лега одним подходом. Демонстрирует хладнокровие игрока на финише матча." 
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
