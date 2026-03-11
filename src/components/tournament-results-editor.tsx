'use client';

import { useState, useTransition } from 'react';
import type { Tournament, TournamentPlayerResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Save, Loader2, RefreshCw, AlertTriangle, User, Hash, Zap, Target, Star, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateTournamentResultsAction } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TournamentResultsEditorProps {
    tournament: Tournament;
}

export function TournamentResultsEditor({ tournament }: TournamentResultsEditorProps) {
    const [players, setPlayers] = useState<TournamentPlayerResult[]>(tournament.players || []);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleUpdatePlayer = (index: number, field: keyof TournamentPlayerResult, value: any) => {
        const newPlayers = [...players];
        const player = { ...newPlayers[index] };
        
        // Update the field
        (player as any)[field] = value;

        // Auto-calculate total points if base or bonus points changed
        if (field === 'basePoints' || field === 'bonusPoints') {
            player.points = (Number(player.basePoints) || 0) + (Number(player.bonusPoints) || 0);
        }

        newPlayers[index] = player;
        setPlayers(newPlayers);
    };

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateTournamentResultsAction(tournament.id, players);
            if (result.success) {
                toast({ title: 'Успешно', description: result.message });
            } else {
                toast({ title: 'Ошибка', description: result.message, variant: 'destructive' });
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-2">
                <Button asChild variant="ghost" className="gap-2 rounded-xl text-muted-foreground hover:text-foreground">
                    <Link href="/admin/tournaments">
                        <ChevronLeft className="h-4 w-4" />
                        Назад к списку
                    </Link>
                </Button>
                {tournament.isManuallyEdited && (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-black uppercase tracking-widest gap-2">
                        <AlertTriangle className="h-3 w-3" />
                        Этот турнир уже содержит правки
                    </Badge>
                )}
            </div>

            <Card className="glassmorphism overflow-hidden border-primary/20 shadow-4xl">
                <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <CardTitle className="text-3xl font-headline uppercase tracking-tighter text-white">Редактор результатов</CardTitle>
                            <CardDescription className="text-base text-primary/60 font-medium">{tournament.name}</CardDescription>
                        </div>
                        <Button 
                            onClick={handleSave} 
                            disabled={isPending} 
                            size="lg" 
                            className="h-14 px-10 rounded-2xl shadow-2xl shadow-primary/30 font-black uppercase tracking-widest text-sm"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <Save className="mr-3 h-5 w-5" />}
                            Сохранить изменения
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 border-b border-white/5 h-16">
                                    <TableHead className="pl-8 w-[100px]"><div className="flex items-center gap-2"><Hash className="h-3 w-3" /> МЕСТО</div></TableHead>
                                    <TableHead className="min-w-[250px]"><div className="flex items-center gap-2"><User className="h-3 w-3" /> ПРО-ИГРОК</div></TableHead>
                                    <TableHead className="w-[120px] text-center">БАЗОВЫЕ</TableHead>
                                    <TableHead className="w-[120px] text-center text-success">БОНУСЫ</TableHead>
                                    <TableHead className="w-[120px] text-center text-primary font-bold">ИТОГО</TableHead>
                                    <TableHead className="w-[100px] text-center"><div className="flex items-center justify-center gap-1"><Zap className="h-3 w-3 text-yellow-400" /> AVG</div></TableHead>
                                    <TableHead className="w-[100px] text-center"><div className="flex items-center justify-center gap-1"><Star className="h-3 w-3 text-orange-500" /> 180</div></TableHead>
                                    <TableHead className="w-[100px] text-center pr-8"><div className="flex items-center justify-center gap-1"><Target className="h-3 w-3 text-pink-500" /> MAX</div></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {players.map((player, idx) => (
                                    <TableRow key={player.id} className="hover:bg-white/[0.02] transition-colors h-20 border-white/5">
                                        <TableCell className="pl-8">
                                            <Input 
                                                type="number" 
                                                value={player.rank} 
                                                onChange={(e) => handleUpdatePlayer(idx, 'rank', Number(e.target.value))}
                                                className="w-16 h-10 bg-black/40 border-white/10 rounded-lg text-center font-headline text-lg"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10 border border-white/10">
                                                    <AvatarImage src={player.avatarUrl} />
                                                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-white truncate max-w-[180px]">{player.name}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{player.nickname}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                value={player.basePoints} 
                                                onChange={(e) => handleUpdatePlayer(idx, 'basePoints', Number(e.target.value))}
                                                className="w-20 mx-auto h-10 bg-black/40 border-white/10 rounded-lg text-center font-bold"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                value={player.bonusPoints} 
                                                onChange={(e) => handleUpdatePlayer(idx, 'bonusPoints', Number(e.target.value))}
                                                className="w-20 mx-auto h-10 bg-success/10 border-success/30 text-success rounded-lg text-center font-bold"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="font-headline text-2xl text-primary text-glow-white drop-shadow-lg">
                                                {player.points}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                step="0.01"
                                                value={player.avg} 
                                                onChange={(e) => handleUpdatePlayer(idx, 'avg', Number(e.target.value))}
                                                className="w-20 mx-auto h-10 bg-black/40 border-white/10 rounded-lg text-center font-mono"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                value={player.n180s} 
                                                onChange={(e) => handleUpdatePlayer(idx, 'n180s', Number(e.target.value))}
                                                className="w-16 mx-auto h-10 bg-black/40 border-white/10 rounded-lg text-center font-mono"
                                            />
                                        </TableCell>
                                        <TableCell className="pr-8">
                                            <Input 
                                                type="number" 
                                                value={player.hiOut} 
                                                onChange={(e) => handleUpdatePlayer(idx, 'hiOut', Number(e.target.value))}
                                                className="w-16 mx-auto h-10 bg-black/40 border-white/10 rounded-lg text-center font-mono"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="p-6 rounded-[2rem] bg-orange-500/5 border border-orange-500/20 flex items-start gap-4">
                <AlertTriangle className="text-orange-500 h-6 w-6 mt-1 shrink-0" />
                <div className="space-y-1">
                    <h4 className="font-headline text-orange-500 uppercase tracking-tight">Важное предупреждение</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        После нажатия кнопки «Сохранить» все изменения вступят в силу мгновенно. 
                        Рейтинги игроков во всех лигах будут пересчитаны автоматически. 
                        Этот турнир будет помечен в базе как <strong>«Измененный вручную»</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
}
