import Card from '../ui/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatNumber } from '../../utils/helpers';

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

const CO2CompareChart = ({ data = [], title = 'CO₂ — Emissioni vs Risparmio', delay = 0 }) => {
    const safe = (Array.isArray(data) ? data : []).map((d) => ({
        ...d,
        co2Emitted: d.co2Emitted ?? 0,
        co2Avoided: d.co2Avoided ?? 0,
    }));

    return (
        <Card variant="glass" delay={delay} className="overflow-hidden">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-dark-200">{title}</h3>
            </div>

            <div className="h-64 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={safe} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="co2EmittedGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.22} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="co2AvoidedGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.22} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" vertical={false} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => formatNumber(v, 0)} />
                        <Tooltip content={<ToolTip />} />
                        <Legend />

                        <Area name="Emissioni" type="monotone" dataKey="co2Emitted" stroke="#ef4444" fill="url(#co2EmittedGrad)" strokeWidth={2} dot={false} />
                        <Area name="Risparmio" type="monotone" dataKey="co2Avoided" stroke="#22c55e" fill="url(#co2AvoidedGrad)" strokeWidth={2} dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default CO2CompareChart;
