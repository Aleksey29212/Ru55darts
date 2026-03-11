'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { importTournament } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2, CloudDownload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import type { League, LeagueId } from '@/lib/types';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="self-end h-12 px-8 shadow-lg shadow-primary/20 transition-all active:scale-95">
      {pending ? (
        <>
            <Loader2 className="animate-spin mr-2" />
            Загрузка...
        </>
      ) : (
        <>
            <CloudDownload className="mr-2" />
            Импорт
        </>
      )}
    </Button>
  );
}

export function ImportForm({ leagues }: { leagues: League[] }) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(importTournament, null);

  useEffect(() => {
    // Показываем тост только если состояние реально изменилось и содержит сообщение
    // Это предотвращает появление тоста при первой загрузке страницы
    if (state && state.message) {
      toast({
        title: state.success ? 'Успешно' : 'Внимание',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <Card className="glassmorphism border-primary/20 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline uppercase tracking-tight">Импорт турнира</CardTitle>
        <CardDescription>
            Введите ID или полную ссылку на турнир с dartsbase.ru. Система автоматически рассчитает баллы.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid md:grid-cols-[1fr_auto_auto] gap-6 items-end">
            <div className="grid gap-2">
                <Label htmlFor="tournamentId" className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">ID или ссылка на турнир</Label>
                <Input
                    id="tournamentId"
                    name="tournamentId"
                    placeholder="12001, 10428, https://dartsbase.ru/tournaments/9940"
                    required
                    className="bg-black/20 border-white/10 h-12 rounded-xl focus:ring-primary"
                />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="league" className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">Лига начисления</Label>
                <Select name="league" defaultValue="general" required>
                    <SelectTrigger id="league" className="w-[200px] h-12 bg-black/20 border-white/10 rounded-xl">
                        <SelectValue placeholder="Выберите лигу" />
                    </SelectTrigger>
                    <SelectContent className="glassmorphism border-white/10">
                        {leagues.map(league => (
                            <SelectItem key={league.id} value={league.id}>{league.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
