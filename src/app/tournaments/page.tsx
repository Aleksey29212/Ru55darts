import { getTournaments } from '@/lib/tournaments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Trophy, Calendar, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

export default async function TournamentsPage() {
    const tournaments = await getTournaments();

    return (
        <main className="flex-1 container py-8 md:py-12">
            <Card className="glassmorphism rounded-[2.5rem] border-white/5 overflow-hidden">
                <CardHeader className="p-8 md:p-12 border-b border-white/5 bg-white/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="p-4 rounded-3xl bg-primary/10 text-primary shadow-inner">
                                <Trophy className="h-10 w-10" />
                            </div>
                            <div>
                                <CardTitle className="text-3xl md:text-4xl font-headline tracking-tight uppercase text-glow">Архив турниров</CardTitle>
                                <CardDescription className="text-base text-muted-foreground/80 mt-1 font-medium">История соревнований и официальные результаты.</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/5 w-fit">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Всего в базе:</span>
                            <span className="font-headline text-primary text-xl">{tournaments.length}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/5 bg-white/5 h-14">
                                    <TableHead className="pl-8 font-bold uppercase tracking-widest text-[11px]">Название турнира</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-[11px] hidden sm:table-cell">Дата проведения</TableHead>
                                    <TableHead className="text-right pr-8 font-bold uppercase tracking-widest text-[11px]">Действие</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tournaments.length > 0 ? (
                                    tournaments.sort((a,b) => {
                                        const dateA = a.date instanceof Timestamp ? a.date.toMillis() : new Date(a.date).getTime();
                                        const dateB = b.date instanceof Timestamp ? b.date.toMillis() : new Date(b.date).getTime();
                                        return dateB - dateA;
                                    }).map((tournament) => (
                                        <TableRow key={tournament.id} className="group border-white/5 hover:bg-white/5 h-20 transition-all">
                                            <TableCell className="pl-8 font-bold text-lg md:text-xl tracking-tight max-w-[300px] md:max-w-none truncate leading-tight group-hover:text-primary transition-colors">
                                                {tournament.name}
                                                <div className="sm:hidden text-xs font-medium text-muted-foreground mt-1 flex items-center gap-1.5">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(tournament.date as string)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                                    <Calendar className="h-4 w-4 opacity-50" />
                                                    {formatDate(tournament.date as string)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Button asChild variant="ghost" className="rounded-2xl interactive-scale font-bold gap-2 text-primary hover:bg-primary/10">
                                                    <Link href={`/tournaments/${tournament.id}`}>
                                                        <span className="hidden md:inline">Результаты</span>
                                                        <ChevronRight className="h-5 w-5" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-32">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <Trophy className="h-16 w-16" />
                                                <p className="text-xl font-headline uppercase tracking-widest">Турниры не найдены</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}