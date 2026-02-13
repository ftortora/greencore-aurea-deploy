import Card from '../ui/Card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { formatNumber, SOURCE_COLORS } from '../../utils/helpers';

const ToolTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-strong rounded-xl px-3 py-2 shadow-lg border border-dark-700/50">
            <p className="text-xs text-dark-400 mb-1">{label}</p>
            {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center justify-between gap-6">
                    <span className="text-xs text-dark-300">{p.name}</span>
                    <span className="text-xs font-semibold text-dark-100">{formatNumber(p.value)} kg</span>
                </div>
            ))}
        </div>
    );
};

const CO2BySourceChart = ({ bySource = [], title = 'CO₂ per Fonte Energetica', delay = 0 }) => {
    const data = (Array.isArray(bySource) ? bySource : []).map((s) => ({
        source: s.source,
        emitted: s.co2Emitted || 0,
        avoided: s.co2Avoided || 0,
    }));

    return (
        <Card variant="glass" delay={delay} className="overflow-hidden">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-dark-200">{title}</h3>
            </div>

            <div className="h-64 -mx-2">
                {data.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" vertical={false} />
                            <XAxis dataKey="source" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => formatNumber(v, 0)} />
                            <Tooltip content={<ToolTip />} />
                            <Legend />

                            <Bar name="Emissioni" dataKey="emitted" radius={[6, 6, 0, 0]} maxBarSize={44}>
                                {data.map((row, i) => (
                                    <Cell key={i} fill={SOURCE_COLORS?.[row.source] || '#64748b'} />
                                ))}
                            </Bar>

                            <Bar name="Risparmio" dataKey="avoided" radius={[6, 6, 0, 0]} maxBarSize={44} fill="#22c55e" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-sm text-dark-500">Nessun dato disponibile</div>
                )}
            </div>
        </Card>
    );
};

export default CO2BySourceChart;
