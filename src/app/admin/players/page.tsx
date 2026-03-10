'use client';

import { PlayerManagement } from "@/components/player-management";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportButton } from "./export-button";
import { ClearButton } from "./clear-button";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { PlayerProfile } from "@/lib/types";
import { collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlayersPage() {
    const db = useFirestore();
    const playersQuery = useMemoFirebase(() => db ? collection(db, 'players') : null, [db]);
    const { data: players, isLoading } = useCollection<PlayerProfile>(playersQuery);

    return (
        <Card className="glassmorphism">
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl">Управление игроками</CardTitle>
                    <CardDescription>
                        Просмотр и редактирование профилей всех зарегистрированных игроков.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <ExportButton />
                    <ClearButton />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <div className="space-y-4 pt-4">
                        <div className="flex justify-end mb-6">
                            <Skeleton className="h-10 w-[290px]" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </div>
                ) : (
                    <PlayerManagement players={players || []} />
                )}
            </CardContent>
        </Card>
    );
}
