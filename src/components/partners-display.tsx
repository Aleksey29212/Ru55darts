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
    
    const containerClasses = isCompact ? 'h-24 w-40' : 'h-40 w-40';
    const padding = isCompact ? 'p-2' : 'p-4';
    
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
                    "absolute inset-0 bg-card/75 backdrop-blur-lg border border-border rounded-lg flex items-center justify-center [backface-visibility:hidden] transition-all duration-300 shadow-[0_0_15px_hsl(var(--primary)/0.15)] group-hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)]", 
                    padding,
                )}>
                    <div className="relative w-full h-full bg-primary/5 rounded-md shadow-inner">
                        <Image
                            src={partner.logoUrl}
                            alt={partner.name}
                            fill
                            className="object-contain p-2"
                            unoptimized={partner.logoUrl.startsWith('data:image') ? true : undefined}
                        />
                    </div>
                </div>
                <div className="absolute inset-0 p-4 bg-card/75 backdrop-blur-lg border border-primary rounded-lg flex flex-col items-center justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] text-center">
                    <div className="w-full">
                        <p className={cn(
                            "font-bold text-primary truncate px-1",
                            isCompact ? 'text-xs' : 'text-sm'
                        )}>{partner.name}</p>
                        {partner.promoCode && <PromoCode code={partner.promoCode} />}
                    </div>

                    {partner.linkUrl && (
                        <Button 
                            asChild 
                            variant="link" 
                            className="text-accent-foreground p-0 h-auto"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                           <a href={partner.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-[10px] uppercase font-bold">
                             {details.buttonText}
                             <ButtonIcon className="ml-1 h-3 w-3" />
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
    const containerClasses = isCompact ? 'h-24 w-40' : 'h-40 w-40';

    return (
        <Link href="/partners" className="group block shrink-0">
            <div className={cn(
                "relative rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all duration-300 flex flex-col items-center justify-center text-center p-2 group-hover:border-primary group-hover:scale-105",
                containerClasses
            )}>
                <PlusCircle className="text-primary h-6 w-6 mb-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                <p className={cn(
                    "font-bold text-primary opacity-70 group-hover:opacity-100",
                    isCompact ? 'text-[10px]' : 'text-xs'
                )}>СТАТЬ ПАРТНЕРОМ</p>
                <p className="text-[8px] text-muted-foreground mt-1 uppercase tracking-tighter">Ваш логотип здесь</p>
            </div>
        </Link>
    );
}

export function PartnersDisplay({ partners, variant = 'default' }: { partners: Partner[], variant?: 'default' | 'compact' }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    if (!isMounted) {
        const skeletonClasses = variant === 'compact' ? "h-24 w-40" : "h-40 w-40";
        return (
            <div className="w-full">
                <div className="flex items-center gap-2 mb-4">
                    <Handshake className="h-4 w-4 text-primary" />
                    <Skeleton className="h-3 w-48" />
                </div>
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className={cn("rounded-lg shrink-0", skeletonClasses)} />
                    ))}
                </div>
            </div>
        );
    }

    // Combine partners and recruitment card for the ticker
    const items = [...partners];
    // Duplicate items to ensure seamless loop
    const tickerItems = [...items, ...items, ...items, ...items];

    return (
        <div className="w-full space-y-4 overflow-hidden">
            <div className="flex items-center gap-2 mb-2 px-1">
                <Handshake className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground">Наши партнеры и спонсоры</span>
            </div>
            
            <div className="relative group/ticker">
                {/* Edge Masks for Smooth Entry/Exit */}
                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                <div 
                    className="flex gap-6 animate-ticker hover:[animation-play-state:paused] transition-[animation-play-state]"
                    style={{ animationDuration: '60s' }}
                >
                    {tickerItems.map((partner, index) => (
                        <PartnerCard 
                            key={`${partner.id}-${index}`} 
                            partner={partner} 
                            variant={variant} 
                        />
                    ))}
                    <RecruitmentCard variant={variant} />
                </div>
            </div>
        </div>
    );
}
