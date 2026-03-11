import { getTournamentById } from '@/lib/tournaments';
import { notFound } from 'next/navigation';
import { TournamentResultsEditor } from '@/components/tournament-results-editor';

export default async function EditTournamentResultsPage(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params;
    const tournament = await getTournamentById(params.id);

    if (!tournament) {
        notFound();
    }

    return (
        <div className="max-w-6xl mx-auto py-8">
            <TournamentResultsEditor tournament={tournament} />
        </div>
    );
}
