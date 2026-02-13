import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { BarChart3, TrendingUp, Leaf, Calendar } from 'lucide-react';
import { useEnergy } from '../contexts/EnergyContext';
import Card from '../components/ui/Card';
import { Skeleton } from '../components/ui/Loading';
import { formatNumber, SOURCE_COLORS } from '../utils/helpers';



const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-strong rounded-xl px-3 py-2 shadow-lg border border-dark-700/50">
            <p className="text-xs text-dark-400 mb-1.5">{label}</p>
            {payload.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-dark-300">{item.name}:</span>
                    <span className="text-xs font-medium text-dark-200">{formatNumber(item.value)}</span>
                </div>
            ))}
        </div>
    );
};

const Analytics = () => {
    const { chartData, sourceDistribution, fetchChartData, stats, fetchStats } = useEnergy();
    const [period, setPeriod] = useState('30d');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchChartData(period), fetchStats(period)]);
            setLoading(false);
        };
        load();
    }, [fetchChartData, fetchStats, period]);

    // ✅ chartData normalizzato dal context con kWh
    const consumptionSeries = useMemo(() => chartData || [], [chartData]);

    // ✅ distribuzione per fonte già normalizzata dal context
    const sourceData = useMemo(() => sourceDistribution || [], [sourceDistribution]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                <h1 className="text-2xl font-display font-bold text-dark-50 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-aurea-400" />
                    Analisi Avanzata
                </h1>
                <p className="text-sm text-dark-500">Approfondimenti dettagliati sul tuo consumo energetico</p>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card variant="glass" delay={0.05}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-aurea-500/10 border border-aurea-500/20">
                            <TrendingUp className="w-5 h-5 text-aurea-400" />
                        </div>
                        <div>
                            <p className="text-xs text-dark-500">Trend Mensile</p>
                            {loading ? (
                                <Skeleton className="w-20 mt-1" height="h-5" />
                            ) : (
                                <p className="text-lg font-display font-bold text-dark-100">
                                    {stats?.monthlyChange !== undefined
                                        ? `${stats.monthlyChange >= 0 ? '+' : ''}${stats.monthlyChange.toFixed(1)}%`
                                        : '—'}
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                <Card variant="glass" delay={0.1}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                            <Leaf className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-xs text-dark-500">CO₂ Totale Risparmiata</p>
                            {loading ? (
                                <Skeleton className="w-20 mt-1" height="h-5" />
                            ) : (
                                <p className="text-lg font-display font-bold text-dark-100">
                                    {formatNumber(stats?.totalCO2Saved || 0)} kg
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                <Card variant="glass" delay={0.15}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <Calendar className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-dark-500">Totale Registrazioni</p>
                            {loading ? (
                                <Skeleton className="w-20 mt-1" height="h-5" />
                            ) : (
                                <p className="text-lg font-display font-bold text-dark-100">{stats?.totalEntries || 0}</p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Consumption Trend */}
            <Card variant="glass" delay={0.2}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-dark-200">Andamento Consumi</h3>
                    <div className="flex gap-1 bg-dark-800/50 rounded-lg p-0.5">
                        {['7d', '30d', '90d', '1y'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                                    period === p
                                        ? 'bg-aurea-500/10 text-aurea-400 border border-aurea-500/20'
                                        : 'text-dark-500 hover:text-dark-300'
                                }`}
                            >
                                {p === '7d' ? '7G' : p === '30d' ? '30G' : p === '90d' ? '90G' : '1A'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-72">
                    {loading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <Skeleton className="w-full" height="h-60" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={consumptionSeries} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="analyticGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" vertical={false} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="kWh" stroke="#10b981" strokeWidth={2} fill="url(#analyticGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </Card>

            {/* Source Comparison */}
            <Card variant="glass" delay={0.3}>
                <h3 className="text-sm font-semibold text-dark-200 mb-5">Distribuzione per Fonte</h3>

                <div className="h-64">
                    {loading ? (
                        <Skeleton className="w-full" height="h-56" />
                    ) : sourceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sourceData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" vertical={false} />
                                <XAxis dataKey="source" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="kWh" radius={[6, 6, 0, 0]} maxBarSize={50} name="kWh">
                                    {sourceData.map((s, i) => {
                                        const color = SOURCE_COLORS?.[s.source] || '#64748b';
                                        return <Cell key={i} fill={color} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-sm text-dark-500">
                            Nessun dato disponibile
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Analytics;
