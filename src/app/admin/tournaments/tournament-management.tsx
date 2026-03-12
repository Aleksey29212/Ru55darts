'use client';

import type { Tournament, League, LeagueId } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Calendar, Trophy, Edit3, Settings2, Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransition, useMemo, useState } from "react";
import { deleteTournamentAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Timestamp } from 'firebase/firestore';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useIsClient } from '@/hooks/use-is-client';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function DeleteTournamentButton({ tournamentId, tournamentName }: { tournamentId: string, tournamentName: string }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteTournamentAction(tournamentId);
             if (result.success) {
                toast({ title: 'Успешно', description: result.message });
            } else {
                 toast({ title: 'Ошибка', description: result.message || 'Ошибка удаления.', variant: 'destructive' });
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto" size="sm">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Удалить
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glassmorphism">
                <AlertDialogHeader>
                    <AlertDialogTitle>Удалить турнир "{tournamentName}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Это действие необратимо. Рейтинги игроков будут автоматически пересчитаны.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                        {isPending ? 'Удаление...' : 'Да, очистить'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function TournamentManagement({ tournaments, leagues }: { tournaments: Tournament[], leagues: League[] }) {
    const isMobile = useIsMobile();
    const isClient = useIsClient();
    const [selectedLeague, setSelectedLeague] = useState<LeagueId | 'all'>('all');

    const filteredTournaments = useMemo(() => {
        let result = [...tournaments];
        if (selectedLeague !== 'all') {
            result = result.filter(t => t.league === selectedLeague);
        }
        return result.sort((a, b) => {
            const getTime = (dateSource: any) => {
                if (!dateSource) return 0;
                if (dateSource && typeof dateSource === 'object' && 'seconds' in dateSource) return dateSource.seconds * 1000;
                if (dateSource instanceof Timestamp) return dateSource.toMillis();
                if (typeof dateSource === 'string') return new Date(dateSource).getTime();
                if (dateSource instanceof Date) return dateSource.getTime();
                return 0;
            };
            return getTime(b.date) - getTime(a.date);
        });
    }, [tournaments, selectedLeague]);
    
    if (!isClient) {
        return (
            <Card className="glassmorphism">
                <CardHeader><Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-3/4" /></CardHeader>
                <CardContent className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent>
            </Card>
        );
    }

    return (
        <Card className="glassmorphism overflow-hidden">
            <CardHeader className="bg-muted/10 border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Trophy className="text-primary h-6 w-6" />
                            Архив турниров ({tournaments.length})
                        </CardTitle>
                        <CardDescription>Управление всеми загруженными данными и результатами.</CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/5">
                        <Filter className="h-4 w-4 text-muted-foreground ml-2" />
                        <select 
                            value={selectedLeague} 
                            onChange={(e) => setSelectedLeague(e.target.value as any)}
                            className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none cursor-pointer pr-4"
                        >
                            <option value="all">ВСЕ ЛИГИ</option>
                            {leagues.filter(l => l.enabled || l.id === 'general').map(l => (
                                <option key={l.id} value={l.id}>{l.name.toUpperCase()}</option>
                            ))}
                        </select>
                        {selectedLeague !== 'all' && (
                            <button onClick={() => setSelectedLeague('all')} className="p-1 hover:text-primary transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {filteredTournaments.length === 0 ? (
                    <div className="text-center py-24">
                        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-10" />
                        <p className="text-muted-foreground font-medium italic">Турниры в данной категории отсутствуют.</p>
                    </div>
                ) : isMobile ? (
                    <Accordion type="multiple" className="w-full">
                        {filteredTournaments.map((tournament) => (
                            <AccordionItem value={tournament.id} key={tournament.id} className="border-b border-border/50">
                                <AccordionTrigger className="p-4 hover:bg-muted/50 hover:no-underline">
                                    <div className="flex flex-col items-start text-left gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium break-words leading-tight">{tournament.name}</span>
                                            {tournament.isManuallyEdited && (
                                                <Badge variant="outline" className="text-[8px] h-4 bg-orange-500/10 text-orange-500 border-orange-500/20 px-1 font-black">РУЧНОЙ</Badge>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(tournament.date)}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="bg-secondary/30 p-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground text-xs uppercase font-bold">Лига:</span>
                                            <Badge variant="secondary">{leagues.find(l => l.id === tournament.league)?.name || tournament.league}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground text-xs uppercase font-bold">Участников:</span>
                                            <span className="font-mono">{tournament.players?.length || 0}</span>
                                        </div>
                                        <div className="pt-4 border-t border-border/50 flex flex-col gap-2">
                                            <Button asChild variant="outline" size="sm" className="w-full h-10 rounded-xl">
                                                <Link href={`/admin/tournaments/${tournament.id}/edit-results`}>
                                                    <Edit3 className="h-4 w-4 mr-2" />
                                                    Править результаты
                                                </Link>
                                            </Button>
                                            <DeleteTournamentButton tournamentId={tournament.id} tournamentName={tournament.name} />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                 <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead className="pl-6">Название турнира</TableHead>
                            <TableHead>Лига начисления</TableHead>
                            <TableHead>Дата проведения</TableHead>
                            <TableHead className="text-center">Игроки</TableHead>
                            <TableHead className="text-right pr-6">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTournaments.map((tournament) => (
                            <TableRow key={tournament.id} className="hover:bg-muted/20 transition-colors">
                                <TableCell className="font-medium max-w-[300px] truncate pl-6">
                                    <div className="flex items-center gap-3">
                                        {tournament.name}
                                        {tournament.isManuallyEdited && (
                                            <Badge variant="outline" className="text-[9px] bg-orange-500/10 text-orange-500 border-orange-500/20 font-black uppercase tracking-widest">Изменено вручную</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-black/40 border-white/5 uppercase text-[9px] font-black tracking-widest py-1">
                                        {leagues.find(l => l.id === tournament.league)?.name || tournament.league}
                                    </Badge>
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(tournament.date)}</TableCell>
                                <TableCell className="text-center font-mono">{tournament.players?.length || 0}</TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button asChild variant="outline" size="sm" className="h-9 rounded-xl px-4" title="Редактировать результаты вручную">
                                            <Link href={`/admin/tournaments/${tournament.id}/edit-results`}>
                                                <Settings2 className="h-4 w-4 mr-2" />
                                                Править
                                            </Link>
                                        </Button>
                                        <DeleteTournamentButton tournamentId={tournament.id} tournamentName={tournament.name} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                )}
            </CardContent>
        </Card>
    );
}
