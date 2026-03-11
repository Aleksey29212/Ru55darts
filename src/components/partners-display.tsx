'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import { Copy, Check, ExternalLink, Handshake, PlusCircle, ShoppingBag, Gamepad2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import type { Partner } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function PromoCode({ code }: { code: string }) {
    const { toast } = useToast();
    const [hasCopied, setHasCopied] = useState(false);

    const copyToClipboard = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        navigator.clipboard.writeText(code);
        setHasCopied(true);
        toast({
            title: 'Скопировано!',
            description: `Промокод "${code}" скопирован в буфер обмена.`,
        });
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-[10px] text-black/60 font-bold">ПРОМОКОД:</span>
            <Button size="sm" variant="ghost" className="h-auto px-2 py-1 text-black font-mono font-bold hover:bg-black/10" onClick={copyToClipboard}>
                {code}
                {hasCopied ? <Check className="ml-2 h-3 w-3" /> : <Copy className="ml-2 h-3 w-3" />}
            </Button>
        </div>
    );
}

function PartnerCard({ partner, variant }: { partner: Partner; variant: 'default' | 'compact' }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const isCompact = variant === 'compact';
    
    const containerClasses = isCompact ? 'h-20 w-40' : 'h-40 w-48';
    const padding = isCompact ? 'p-1.5' : 'p-4';
    
    const categoryDetails = {
        shop: { buttonText: 'В магазин', buttonIcon: ShoppingBag },
        platform: { buttonText: 'Играть', buttonIcon: Gamepad2 },
        media: { buttonText: 'Сайт', buttonIcon: ExternalLink },
        other: { buttonText: 'Инфо', buttonIcon: ExternalLink },
    };
    
    const details = categoryDetails[partner.category] || categoryDetails.other;
    const ButtonIcon = details.buttonIcon;

    return (
        <div 
            className="group [perspective:1000px] cursor-pointer shrink-0"
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={cn(
                "relative rounded-xl transition-all duration-700 [transform-style:preserve-3d] shadow-xl", 
                containerClasses, 
                isFlipped ? "[transform:rotateY(180deg)]" : ""
            )}>
                {/* Лицевая сторона: Логотип */}
                <div className={cn(
                    "absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center [backface-visibility:hidden] transition-all duration-300", 
                    padding,
                )}>
                    <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center p-2">
                        <Image
                            src={partner.logoUrl}
                            alt={partner.name}
                            fill
                            className="object-contain filter grayscale brightness-125 group-hover:grayscale-0 transition-all duration-500 scale-90 group-hover:scale-100"
                            unoptimized={partner.logoUrl.startsWith('data:image') ? true : undefined}
                        />
                    </div>
                </div>

                {/* Обратная сторона: Действия */}
                <div className="absolute inset-0 p-3 bg-primary backdrop-blur-lg border border-primary rounded-xl flex flex-col items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden] text-center shadow-2xl">
                    <p className={cn(
                        "font-black text-black uppercase tracking-tighter truncate w-full px-1",
                        isCompact ? 'text-[10px]' : 'text-xs'
                    )}>{partner.name}</p>
                    
                    {partner.promoCode && <PromoCode code={partner.promoCode} />}

                    {partner.linkUrl && (
                        <Button 
                            asChild 
                            variant="link" 
                            className="mt-2 text-black/80 hover:text-black p-0 h-auto"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                           <a href={partner.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-[9px] uppercase font-black tracking-widest">
                             {details.buttonText}
                             <ButtonIcon className="ml-1.5 h-3 w-3" />
                           </a>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function RecruitmentCard({ variant }: { variant: 'default' | 'compact' }) {
    const isCompact = variant === 'compact';
    const containerClasses = isCompact ? 'h-20 w-40' : 'h-40 w-48';

    return (
        <Link href="/partners" className="group block shrink-0">
            <div className={cn(
                "relative rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 transition-all duration-500 flex flex-col items-center justify-center text-center p-4 hover:border-primary hover:bg-primary/10 hover:scale-105 shadow-lg",
                containerClasses
            )}>
                <div className="absolute top-0 right-0 p-1">
                    <div className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </div>
                </div>
                <PlusCircle className="text-primary h-6 w-6 mb-2 animate-pulse" />
                <p className={cn(
                    "font-black text-primary uppercase tracking-tighter leading-none",
                    isCompact ? 'text-[10px]' : 'text-xs'
                )}>СТАТЬ ПАРТНЕРОМ</p>
                <p className="text-[7px] text-muted-foreground mt-1.5 uppercase font-bold tracking-widest opacity-60">ТВОЙ БРЕНД ЗДЕСЬ</p>
            </div>
        </Link>
    );
}

export function PartnersDisplay({ 
    partners, 
    variant = 'default',
    hideLabel = false 
}: { 
    partners: Partner[], 
    variant?: 'default' | 'compact',
    hideLabel?: boolean 
}) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    if (!isMounted) {
        const skeletonClasses = variant === 'compact' ? "h-20 w-40" : "h-40 w-48";
        return (
            <div className="w-full">
                {!hideLabel && (
                    <div className="flex items-center gap-2 mb-4">
                        <Handshake className="h-4 w-4 text-primary" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                )}
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className={cn("rounded-xl shrink-0", skeletonClasses)} />
                    ))}
                </div>
            </div>
        );
    }

    // Формируем набор элементов для бесконечного цикла
    // Включаем карточку рекрутинга в начало каждого цикла
    const items = partners.length > 0 ? partners : [];
    const tickerSequence = [<RecruitmentCard key="recruit-1" variant={variant} />, ...items.map((p, i) => <PartnerCard key={`p-${p.id}-${i}`} partner={p} variant={variant} />)];
    
    // Дублируем последовательность 4 раза для гарантии непрерывности
    const tickerItems = [...tickerSequence, ...tickerSequence, ...tickerSequence, ...tickerSequence];

    return (
        <div className={cn("w-full overflow-hidden select-none", !hideLabel && "space-y-4")}>
            {!hideLabel && (
                <div className="flex items-center gap-3 mb-2 px-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Партнерская сеть DartBrig Pro</span>
                </div>
            )}
            
            <div className="relative group/container">
                {/* Градиентные маски для мягких краев ленты */}
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

                <div 
                    className="flex gap-6 animate-ticker hover:[animation-play-state:paused] transition-[animation-play-state] w-max py-4"
                    style={{ animationDuration: '60s' }}
                >
                    {tickerItems.map((item, index) => (
                        <div key={index} className="transition-transform duration-500 hover:scale-105 active:scale-95">
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
