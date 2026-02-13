import Card from '../ui/Card';
import { Leaf } from 'lucide-react';

const pct = (n) => Math.round((n || 0) * 10) / 10;

const EnergySavingTipsCard = ({ stats }) => {
    const bySource = stats?.bySource || [];
    const total = bySource.reduce((sum, s) => sum + (s.amount || 0), 0);
    const rete = bySource.find((s) => s.source === 'rete')?.amount || 0;
    const retePct = total > 0 ? (rete / total) * 100 : 0;

    const tips = [];

    if (total === 0) {
        tips.push('Aggiungi registrazioni per ricevere consigli personalizzati.');
    } else {
        if (retePct >= 60) tips.push(`Stai usando molto la rete (${pct(retePct)}%). Valuta fonti rinnovabili o fasce orarie più economiche.`);
        else if (retePct >= 35) tips.push(`Buon mix! Riducendo la rete (${pct(retePct)}%) aumenti il risparmio CO₂.`);
        else tips.push('Ottimo: rete sotto controllo. Continua a privilegiare le rinnovabili.');

        const avg = stats?.avgDailyKWh || 0;
        if (avg > 0) tips.push(`Media giornaliera: ~${pct(avg)} kWh. Riduci standby (TV/decoder/console) e luci inutili.`);

        const cost = stats?.totalCost || 0;
        if (cost > 0) tips.push(`Spesa stimata: ${pct(cost)} €. Confronta tariffa e fascia oraria: spesso è il risparmio più rapido.`);
    }

    return (
        <Card variant="glass" delay={0.2} className="overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-cyan-400" />
                    Consigli Risparmio
                </h3>
            </div>

            <ul className="space-y-2">
                {tips.slice(0, 4).map((t, i) => (
                    <li key={i} className="text-sm text-dark-300 leading-relaxed">
                        • {t}
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default EnergySavingTipsCard;
