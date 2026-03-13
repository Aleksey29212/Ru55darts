import { ScoringClientPage } from './scoring-client-page';
import { getAllScoringSettings, getLeagueSettings } from '@/lib/settings';

export default async function ScoringPage() {
  // Получаем данные на сервере, чтобы они были доступны даже в Demo-режиме (из глобальной памяти)
  const [scoringSettings, leagueSettings] = await Promise.all([
    getAllScoringSettings(),
    getLeagueSettings()
  ]);

  return (
    <ScoringClientPage 
      initialScoringSettings={scoringSettings} 
      initialLeagueSettings={leagueSettings} 
    />
  );
}
