'use client';

import type { Player } from '@/lib/types';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardHeroProps {
  players: Player[];
}

const rankClasses = {
  1: {
    card: 'border-gold shadow-[0_0_20px_theme(colors.gold/0.4)] scale-110 z-10',
    icon: 'text-gold',
    animation: 'transform md:-translate-y-4',
    size: 'md:w-[35%]',
    avatar: 'h-28 w-28',
    avatarBorder: 'border-gold',
    name: 'text-3xl',
    pointsPlaque: 'bg-gold/10 text-gold font-bold px-6 py-2 rounded-lg shadow-inner border border-gold/50',
  },
  2: {
    card: 'glassmorphism border-silver shadow-[0_0_15px_theme(colors.silver/0.4)]',
    icon: 'text-silver',
    animation: 'transform hover:-translate-y-2',
    size: 'md:w-1/4',
    avatar: 'h-24 w-24',
    avatarBorder: 'border-silver',
    name: 'text-2xl',
    pointsPlaque: 'bg-muted/50 font-bold px-4 py-1 rounded-lg shadow-inner',
  },
  3: {
    card: 'glassmorphism border-bronze shadow-[0_0_15px_theme(colors.bronze/0.4)]',
    icon: 'text-bronze',
    animation: 'transform hover:-translate-y-2',
    size: 'md:w-1/4',
    avatar: 'h-24 w-24',
    avatarBorder: 'border-bronze',
    name: 'text-2xl',
    pointsPlaque: 'bg-muted/50 font-bold px-4 py-1 rounded-lg shadow-inner',
  },
};

function TopPlayerCard({ player }: { player: Player }) {
    const rankStyle = rankClasses[player.rank as keyof typeof rankClasses] || rankClasses[3];

    return (
        <Link href={`/player/${player.id}`} className={cn("w-full transition-transform duration-300", rankStyle.size, rankStyle.animation)}>
            <Card className={cn("text-center h-full flex flex-col justify-between", rankStyle.card)}>
                 <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                        <Avatar className={cn('border-4', rankStyle.avatar, rankStyle.avatarBorder)}>
                            <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint={player.imageHint} />
                            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                         {player.rank === 1 && <Crown className={cn("absolute -top-2 -right-2 h-8 w-8 transform rotate-12", rankStyle.icon)} strokeWidth={2.5}/>}
                    </div>
                    <div className="space-y-1">
                        <h3 className={cn("font-headline", rankStyle.name)}>{player.name}</h3>
                        <p className="text-sm text-muted-foreground">&quot;{player.nickname}&quot;</p>
                    </div>
                     <div className={cn("text-2xl font-headline", rankStyle.pointsPlaque)}>
                        {player.points}
                     </div>
                 </CardContent>
            </Card>
        </Link>
    )
}

export function LeaderboardHero({ players }: LeaderboardHeroProps) {
  if (!players || players.length === 0) {
    return null;
  }
  
  const [p1, p2, p3] = players;
  
  return (
    <Card className="glassmorphism w-full">
      <CardContent className="p-6">
        <h2 className="text-center text-3xl font-headline mb-2 text-primary text-glow drop-shadow-lg">ТОП-3 ЧЕМПИОНОВ</h2>
        <p className="text-center text-muted-foreground mb-8">Лучшие из лучших, лидеры текущей лиги.</p>
        <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:-space-x-4">
            {p2 && <TopPlayerCard player={p2}/>}
            {p1 && <TopPlayerCard player={p1}/>}
            {p3 && <TopPlayerCard player={p3}/>}
        </div>
      </CardContent>
    </Card>
  );
}
