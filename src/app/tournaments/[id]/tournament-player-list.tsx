'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Medal, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';
import type { TournamentPlayerResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';


const StatRow = ({ label, value, className }: { label: string; value: string | number; className?: string }) => (
    <div className={cn("flex justify-between items-center text-sm py-2 px-3 rounded-md", className)}>
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-bold text-foreground">{value}</span>
    </div>
);

export function TournamentPlayerList({ players, tournamentId }: { players: TournamentPlayerResult[], tournamentId: string }) {
    const isMobile = useIsMobile();

    return (
        <div className="animate-in fade-in duration-500">
            {/* Desktop Table View */}
            {!isMobile ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px] text-center px-2 sm:px-4">Место</TableHead>
                            <TableHead>Игрок</TableHead>
                            <TableHead className="text-right px-2 sm:px-4">Очки за место</TableHead>
                            <TableHead className="text-right px-2 sm:px-4">Бонусы</TableHead>
                            <TableHead className="text-right px-2 sm:px-4">AVG</TableHead>
                            <TableHead className="text-right px-2 sm:px-4">Hi-Out</TableHead>
                            <TableHead className="text-right px-2 sm:px-4">180</TableHead>
                            <TableHead className="text-right px-2 sm:px-4 font-bold">Всего</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {players.map((player) => (
                            <TableRow key={player.id} className="hover:bg-primary/5 transition-colors">
                                <TableCell className="font-headline text-xl text-center align-middle p-2 sm:p-4">
                                    <div className="flex items-center justify-center gap-2">
                                        {player.rank === 1 && <Medal className="text-gold"/>}
                                        {player.rank === 2 && <Medal className="text-silver"/>}
                                        {player.rank === 3 && <Medal className="text-bronze"/>}
                                        {player.rank}
                                    </div>
                                </TableCell>
                                <TableCell className="p-2 sm:p-4">
                                    <Link href={`/player/${player.id}?tournamentId=${tournamentId}`} className="flex items-center gap-4 group">
                                        <Avatar>
                                            <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint={player.imageHint} />
                                            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <p className="font-medium group-hover:text-primary transition-colors">{player.name}</p>
                                            <Badge variant="secondary" className="font-normal mt-1 w-fit text-[10px]">{player.nickname}</Badge>
                                        </div>
                                    </Link>
                                </TableCell>
                                <TableCell className="text-right font-mono p-2 sm:p-4 opacity-70">{player.basePoints}</TableCell>
                                <TableCell className="text-right font-mono text-success p-2 sm:p-4">
                                    {player.bonusPoints > 0 ? `+${player.bonusPoints}` : '0'}
                                </TableCell>
                                <TableCell className="text-right font-mono p-2 sm:p-4 opacity-70">{player.avg.toFixed(1)}</TableCell>
                                <TableCell className="text-right font-mono p-2 sm:p-4 opacity-70">{player.hiOut}</TableCell>
                                <TableCell className="text-right font-mono p-2 sm:p-4 opacity-70">{player.n180s}</TableCell>
                                <TableCell className="text-right font-headline text-primary text-xl p-2 sm:p-4 text-glow">
                                    {player.points}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                /* Mobile View Mode (Accordion) */
                <Accordion type="multiple" className="w-full">
                    {players.map((player) => (
                        <AccordionItem value={player.id} key={player.id} className="border-white/5">
                            <AccordionTrigger className="p-4 hover:bg-muted/50 hover:no-underline">
                                <div className="flex items-center gap-4 w-full">
                                    <div className="font-headline text-xl text-center align-middle w-10">
                                        <div className="flex items-center justify-center gap-1">
                                            {player.rank === 1 && <Medal className="h-5 w-5 text-gold"/>}
                                            {player.rank === 2 && <Medal className="h-5 w-5 text-silver"/>}
                                            {player.rank === 3 && <Medal className="h-5 w-5 text-bronze"/>}
                                            {player.rank}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-1">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint={player.imageHint} />
                                            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col items-start">
                                            <span className="font-bold text-left leading-tight">{player.name}</span>
                                            <Badge variant="secondary" className="font-normal w-fit mt-1 text-[9px]">{player.nickname}</Badge>
                                        </div>
                                    </div>
                                    <div className="text-right font-headline text-primary text-xl text-glow pr-2">{player.points}</div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="bg-secondary/30">
                                <div className="p-4 space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <StatRow label="За место" value={player.basePoints} />
                                        <StatRow label="Бонусы" value={`+${player.bonusPoints}`} className="text-success" />
                                        <StatRow label="AVG" value={player.avg.toFixed(2)} />
                                        <StatRow label="180-ки" value={player.n180s} />
                                        <StatRow label="Hi-Out" value={player.hiOut} />
                                        <StatRow label="Лучший лег" value={player.bestLeg > 0 ? player.bestLeg : 'N/A'} />
                                    </div>
                                    
                                    <div className="pt-4 mt-2">
                                        <Button asChild className="w-full rounded-xl font-bold h-12">
                                            <Link href={`/player/${player.id}?tournamentId=${tournamentId}`}>
                                                Перейти в профиль
                                                <ExternalLink className="h-4 w-4 ml-2" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    );
}
