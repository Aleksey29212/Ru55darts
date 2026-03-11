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
            <span className="text-xs text-muted-foreground">Промокод:</span>
            <Button size="sm" variant="ghost" className="h-auto px-2 py-1 text-primary font-mono" onClick={copyToClipboard}>
                {code}
                {hasCopied ? <Check className="ml-2 text-success" /> : <Copy className="ml-2" />}
            </Button>
        </div>
    );
}

function PartnerCard({ partner, variant }: { partner: Partner; variant: 'default' | 'compact' }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const isCompact = variant === 'compact';
    
    const containerClasses = isCompact ? 'h-20 w-36' : 'h-40 w-40';
    const padding = isCompact ? 'p-1.5' : 'p-4';
    
    const categoryDetails = {
        shop: { buttonText: 'В магазин', buttonIcon: ShoppingBag },
        platform: { buttonText: 'На платформу', buttonIcon: Gamepad2 },
        media: { buttonText: 'На сайт', buttonIcon: ExternalLink },
        other: { buttonText: 'Подробнее', buttonIcon: ExternalLink },
    };
    
    const details = categoryDetails[partner.category] || categoryDetails.other;
    const ButtonIcon = details.buttonIcon;

    return (
        <div 
            className="group [perspective:1000px] cursor-pointer shrink-0"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={cn(
                "relative rounded-lg transition-all duration-500 [transform-style:preserve-3d]", 
                containerClasses, 
                isFlipped ? "[transform:rotateY(180deg)] scale-105" : "group-hover:scale-105"
            )}>
                <div className={cn(
                    "absolute inset-0 bg-card/75 backdrop-blur-lg border border-white/5 rounded-lg flex items-center justify-center [backface-visibility:hidden] transition-all duration-300 shadow-[0_0_15px_hsl(var(--primary)/0.1)] group-hover:shadow-[0_0_25px_hsl(var(--primary)/0.2)]", 
                    padding,
                )}>
                    <div className="relative w-full h-full bg-white/5 rounded-md shadow-inner flex items-center justify-center overflow-hidden">
                        <Image
                            src={partner.logoUrl}
                            alt={partner.name}
                            fill
                            className="object-contain p-2 filter grayscale brightness-125 group-hover:grayscale-0 transition-all duration-500"
                            unoptimized={partner.logoUrl.startsWith('data:image') ? true : undefined}
                        />
                    </div>
                </div>
                <div className="absolute inset-0 p-3 bg-primary/95 backdrop-blur-lg border border-primary rounded-lg flex flex-col items-center justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] text-center shadow-2xl">
                    <div className="w-full">
                        <p className={cn(
                            "font-bold text-black truncate px-1",
                            isCompact ? 'text-[10px]' : 'text-sm'
                        )}>{partner.name}</p>
                        {partner.promoCode && <PromoCode code={partner.promoCode} />}
                    </div>

                    {partner.linkUrl && (
                        <Button 
                            asChild 
                            variant="link" 
                            className="text-black/80 hover:text-black p-0 h-auto"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                           <a href={partner.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-[9px] uppercase font-black tracking-tighter">
                             {details.buttonText}
                             <ButtonIcon className="ml-1 h-2.5 w-2.5" />
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
    const containerClasses = isCompact ? 'h-20 w-36' : 'h-40 w-40';

    return (
        <Link href="/partners" className="group block shrink-0">
            <div className={cn(
                "relative rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all duration-300 flex flex-col items-center justify-center text-center p-2 group-hover:border-primary group-hover:scale-105",
                containerClasses
            )}>
                <PlusCircle className="text-primary h-5 w-5 mb-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                <p className={cn(
                    "font-bold text-primary opacity-70 group-hover:opacity-100",
                    isCompact ? 'text-[9px]' : 'text-xs'
                )}>СТАТЬ ПАРТНЕРОМ</p>
                <p className="text-[7px] text-muted-foreground mt-0.5 uppercase tracking-tighter">Ваш логотип здесь</p>
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
        const skeletonClasses = variant === 'compact' ? "h-20 w-36" : "h-40 w-40";
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
                        <Skeleton key={i} className={cn("rounded-lg shrink-0", skeletonClasses)} />
                    ))}
                </div>
            </div>
        );
    }

    // Дублируем партнеров для бесконечного цикла, даже если их мало
    const items = [...partners];
    const tickerItems = items.length > 0 
        ? [...items, ...items, ...items, ...items, ...items, ...items] 
        : [];

    return (
        <div className={cn("w-full overflow-hidden", !hideLabel && "space-y-4")}>
            {!hideLabel && (
                <div className="flex items-center gap-2 mb-2 px-1">
                    <Handshake className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground">Наши партнеры и спонсоры</span>
                </div>
            )}
            
            <div className="relative group/ticker w-full">
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

                <div 
                    className="flex gap-6 animate-ticker hover:[animation-play-state:paused] transition-[animation-play-state] w-max"
                    style={{ animationDuration: '40s' }}
                >
                    {tickerItems.map((partner, index) => (
                        <PartnerCard 
                            key={`${partner.id}-${index}`} 
                            partner={partner} 
                            variant={variant} 
                        />
                    ))}
                    <RecruitmentCard variant={variant} />
                    {/* Добавляем еще одну карточку рекрутинга для баланса в начале/конце */}
                    {tickerItems.length > 0 && <RecruitmentCard variant={variant} />}
                </div>
            </div>
        </div>
    );
}