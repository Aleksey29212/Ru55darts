'use client';

import type { Tournament, League } from '@/lib/types';
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
import { Trash2, Loader2, Calendar, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransition, useMemo } from "react";
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

    const sortedTournaments = useMemo(() => {
        return [...tournaments].sort((a, b) => {
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
    }, [tournaments]);
    
    if (!isClient) {
        return (
            <Card className="glassmorphism">
                <CardHeader><Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-3/4" /></CardHeader>
                <CardContent className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent>
            </Card>
        );
    }

    if (tournaments.length === 0) {
        return (
             <Card className="glassmorphism">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Trophy className="text-primary h-6 w-6" />
                        Список турниров
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground">Турниры еще не импортированы. Используйте раздел "Импорт", чтобы добавить данные.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glassmorphism">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Trophy className="text-primary h-6 w-6" />
                            Архив турниров ({tournaments.length})
                        </CardTitle>
                        <CardDescription>Управление всеми загруженными данными и результатами.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                { isMobile ? (
                    <Accordion type="multiple" className="w-full">
                        {sortedTournaments.map((tournament) => (
                            <AccordionItem value={tournament.id} key={tournament.id} className="border-b border-border/50">
                                <AccordionTrigger className="p-4 hover:bg-muted/50 hover:no-underline">
                                    <div className="flex flex-col items-start text-left gap-1">
                                        <span className="font-medium break-words leading-tight">{tournament.name}</span>
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
                                        <div className="pt-4 border-t border-border/50 flex justify-end">
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
                            <TableHead>Название турнира</TableHead>
                            <TableHead>Лига</TableHead>
                            <TableHead>Дата проведения</TableHead>
                            <TableHead className="text-center">Игроки</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedTournaments.map((tournament) => (
                            <TableRow key={tournament.id} className="hover:bg-muted/20 transition-colors">
                                <TableCell className="font-medium max-w-[300px] truncate">{tournament.name}</TableCell>
                                <TableCell><Badge variant="outline" className="bg-background">{leagues.find(l => l.id === tournament.league)?.name || tournament.league}</Badge></TableCell>
                                <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(tournament.date)}</TableCell>
                                <TableCell className="text-center font-mono">{tournament.players?.length || 0}</TableCell>
                                <TableCell className="text-right">
                                    <DeleteTournamentButton tournamentId={tournament.id} tournamentName={tournament.name} />
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