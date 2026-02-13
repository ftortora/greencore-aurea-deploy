import { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { cn, formatNumber } from '../../utils/helpers';


const PERIODS = [
    { key: '7d', label: '7G' },
    { key: '30d', label: '30G' },
    { key: '90d', label: '90G' },
    { key: '1y', label: '1A' },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-strong rounded-xl px-3 py-2 shadow-lg border border-dark-700/50">
            <p className="text-xs text-dark-400 mb-1">{label}</p>
            {payload.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium text-dark-200">
            {formatNumber(item.value)} kWh
          </span>
                </div>
            ))}
        </div>
    );
};

const EnergyChart = ({ data = [], onPeriodChange, title = 'Consumo Energetico', delay = 0 }) => {
    const [activePeriod, setActivePeriod] = useState('30d');

    const handlePeriod = (key) => {
        setActivePeriod(key);
        onPeriodChange?.(key);
    };


    const safeData = (Array.isArray(data) ? data : []).map((d) => ({
        ...d,
        kWh: d.kWh ?? d.total ?? 0,
    }));

    return (
        <Card variant="glass" delay={delay} className="overflow-hidden">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-dark-200">{title}</h3>
                <div className="flex items-center gap-1 bg-dark-800/50 rounded-lg p-0.5">
                    {PERIODS.map((p) => (
                        <button
                            key={p.key}
                            onClick={() => handlePeriod(p.key)}
                            className={cn(
                                'relative px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                                activePeriod === p.key ? 'text-aurea-400' : 'text-dark-500 hover:text-dark-300'
                            )}
                        >
                            {activePeriod === p.key && (
                                <motion.div
                                    layoutId="period-indicator"
                                    className="absolute inset-0 bg-aurea-500/10 border border-aurea-500/20 rounded-md"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{p.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-64 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={safeData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.3)" vertical={false} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickFormatter={(v) => formatNumber(v, 0)}
                            dx={-5}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="kWh"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#chartGradient)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#10b981', stroke: '#020617', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default EnergyChart;
