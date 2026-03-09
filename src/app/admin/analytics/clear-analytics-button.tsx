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
import { clearAnalyticsAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";

export function ClearAnalyticsButton() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleClear = () => {
        startTransition(async () => {
            const result = await clearAnalyticsAction();
            if (result.success) {
                toast({
                    title: 'Успешно',
                    description: result.message,
                });
            } else {
                 toast({
                    title: 'Ошибка',
                    description: result.message || 'Не удалось очистить логи.',
                    variant: 'destructive',
                });
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Сбросить логи
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glassmorphism">
                <AlertDialogHeader>
                    <AlertDialogTitle>Очистить всю аналитику?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Это действие принудительно удалит все записи о посещениях сайта и кликах по спонсорам. Восстановить эти данные будет невозможно.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClear} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                        {isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                        Да, очистить принудительно
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
