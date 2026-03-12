import { getRankings } from "@/lib/leagues";
import { StyleStudioClient } from "@/components/style-studio";
import { getAppearanceSettings } from "@/lib/settings";

export default async function StyleStudioPage() {
    const [players, appearance] = await Promise.all([
        getRankings('general'),
        getAppearanceSettings()
    ]);

    return (
        <StyleStudioClient 
            players={players} 
            initialDefaultTemplate={appearance.globalDefaultTemplate || 'classic'} 
        />
    );
}
