'use client';
import type { SponsorClickStat } from '@/lib/analytics';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SponsorAnalyticsDashboard({ initialStats }: { initialStats: SponsorClickStat[] }) {
    if (!initialStats || initialStats.length === 0) {
        return (
             <Card className="glassmorphism mt-4">
                <CardHeader>
                     <CardTitle>Статистика кликов</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                        Нет данных о кликах по спонсорским ссылкам.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="glassmorphism mt-4">
            <CardHeader>
                <CardTitle>Статистика кликов по спонсорам</CardTitle>
                <CardDescription>Количество переходов по спонсорским ссылкам в профилях игроков.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Игрок</TableHead>
                            <TableHead>Спонсор</TableHead>
                            <TableHead className="text-right">Клики</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialStats.map(stat => (
                            <TableRow key={`${stat.playerId}-${stat.sponsorName}`}>
                                <TableCell className="font-medium">{stat.playerName}</TableCell>
                                <TableCell>{stat.sponsorName}</TableCell>
                                <TableCell className="text-right font-bold font-mono">{stat.clicks}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
