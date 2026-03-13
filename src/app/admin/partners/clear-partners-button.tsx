
'use client';

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
import { Trash2, Loader2 } from "lucide-react";
import { clearPartnersAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useTransition, useState, useEffect } from "react";

export function ClearPartnersButton() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleClear = () => {
        startTransition(async () => {
            const result = await clearPartnersAction();
            if (result.success) {
                toast({
                    title: 'Успешно',
                    description: result.message,
                });
            } else {
                 toast({
                    title: 'Ошибка',
                    description: result.message || 'Не удалось удалить партнеров.',
                    variant: 'destructive',
                });
            }
        });
    };

    if (!isMounted) {
        return (
            <Button variant="destructive" size="sm" disabled className="opacity-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить всех партнеров
            </Button>
        );
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="shadow-lg shadow-destructive/20">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить всех партнеров
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glassmorphism">
                <AlertDialogHeader>
                    <AlertDialogTitle>Принудительное удаление партнеров</AlertDialogTitle>
                    <AlertDialogDescription>
                        Вы уверены? Весь список партнеров и магазинов будет полностью удален из базы данных.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClear} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                        {isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                        Да, удалить принудительно
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
