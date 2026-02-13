import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Globe,
  TreePine,
  Factory,
  Leaf,
  TrendingDown,
  Droplets,
  Car,
  Flame,
} from 'lucide-react';
import { useEnergy } from '../contexts/EnergyContext';
import Card from '../components/ui/Card';
import { Skeleton } from '../components/ui/Loading';
import { formatNumber, SOURCE_COLORS, SOURCE_LABELS, CO2_FACTORS } from '../utils/helpers';

/* ═══════════════════════════════════════════════
   GREEN CORE AUREA v5.2 — CO₂ Tracker Page
   Emissions tracking, savings vs grid, tree equiv.
   ═══════════════════════════════════════════════ */


const KG_CO2_PER_TREE_YEAR = 22;

const KG_CO2_PER_CAR_YEAR = 4600;

const LITERS_WATER_PER_KWH = 1.8;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 shadow-lg border border-dark-700/50">
      <p className="text-xs text-dark-400 mb-1">{label}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-xs text-dark-300">{item.name}:</span>
          <span className="text-xs font-medium text-dark-200">
            {formatNumber(item.value, 2)} kg
          </span>
        </div>
      ))}
    </div>
  );
};

const EquivalentCard = ({ icon: Icon, value, label, sublabel, color, delay }) => (
  <Card variant="glass" hover delay={delay}>
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-xl border ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-lg font-display font-bold text-dark-100">{value}</p>
        <p className="text-xs text-dark-400">{label}</p>
        {sublabel && <p className="text-[10px] text-dark-600 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  </Card>
);

const CO2Tracker = () => {
  const { stats, chartData, sourceDistribution, fetchStats, fetchChartData } = useEnergy();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchChartData('30d')]);
      setLoading(false);
    };
    load();
  }, [fetchStats, fetchChartData]);

  // Calculations
  const totalCO2 = stats?.totalCO2 || 0;
  const totalCO2Saved = stats?.totalCO2Saved || 0;
  const totalKWh = stats?.totalKWh || 0;

  const treeEquivalent = totalCO2Saved > 0 ? Math.round(totalCO2Saved / KG_CO2_PER_TREE_YEAR) : 0;
  const carDaysEquivalent = totalCO2Saved > 0 ? Math.round((totalCO2Saved / KG_CO2_PER_CAR_YEAR) * 365) : 0;
  const waterSaved = totalKWh > 0 ? Math.round(totalKWh * LITERS_WATER_PER_KWH * (stats?.renewablePercentage || 0) / 100) : 0;

  // Source CO2 breakdown
  const co2BySource = (sourceDistribution || []).map((s) => {
    const source = s.source || s.name;
    const kWh = s.kWh || s.value || 0;
    const factor = CO2_FACTORS[source] || CO2_FACTORS.rete;
    return {
      name: SOURCE_LABELS[source] || source,
      source,
      co2: parseFloat((kWh * factor).toFixed(2)),
      kWh,
    };
  }).sort((a, b) => b.co2 - a.co2);

  // Chart data for CO2 trend
  const co2ChartData = (chartData || []).map((d) => ({
    date: d.date,
    co2: parseFloat(((d.kWh || 0) * 0.3).toFixed(2)), // blended avg
    saved: parseFloat(((d.kWh || 0) * 0.15).toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-display font-bold text-dark-50 flex items-center gap-2">
          <Globe className="w-6 h-6 text-aurea-400" />
          CO₂ Tracker
        </h1>
        <p className="text-sm text-dark-500">
          Monitora le emissioni, il risparmio e l'impatto ambientale delle tue scelte energetiche
        </p>
      </motion.div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="glow" delay={0.05}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
              <Factory className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-dark-500 uppercase tracking-wider">CO₂ Emessa</p>
              {loading ? (
                <Skeleton className="w-24 mt-1" height="h-6" />
              ) : (
                <p className="text-xl font-display font-bold text-dark-100">
                  {formatNumber(totalCO2, 1)} <span className="text-sm text-dark-500 font-normal">kg</span>
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="glow" delay={0.1}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-aurea-500/10 border border-aurea-500/20">
              <Leaf className="w-5 h-5 text-aurea-400" />
            </div>
            <div>
              <p className="text-xs text-dark-500 uppercase tracking-wider">CO₂ Risparmiata</p>
              {loading ? (
                <Skeleton className="w-24 mt-1" height="h-6" />
              ) : (
                <p className="text-xl font-display font-bold text-aurea-400">
                  {formatNumber(totalCO2Saved, 1)} <span className="text-sm text-dark-500 font-normal">kg</span>
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="glow" delay={0.15}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <TrendingDown className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-dark-500 uppercase tracking-wider">Riduzione Netta</p>
              {loading ? (
                <Skeleton className="w-24 mt-1" height="h-6" />
              ) : (
                <p className="text-xl font-display font-bold text-cyan-400">
                  {totalCO2 > 0 ? ((totalCO2Saved / (totalCO2 + totalCO2Saved)) * 100).toFixed(1) : 0}
                  <span className="text-sm text-dark-500 font-normal">%</span>
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Equivalents */}
      <div>
        <h3 className="text-sm font-semibold text-dark-300 mb-3">Equivalenze Ambientali</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <EquivalentCard
            icon={TreePine}
            value={`${treeEquivalent}`}
            label="Alberi equivalenti"
            sublabel={`${KG_CO2_PER_TREE_YEAR} kg CO₂/albero/anno`}
            color="bg-aurea-500/10 border-aurea-500/20 text-aurea-400"
            delay={0.2}
          />
          <EquivalentCard
            icon={Car}
            value={`${carDaysEquivalent}`}
            label="Giorni auto evitati"
            sublabel="4.6t CO₂/auto/anno (EPA)"
            color="bg-amber-500/10 border-amber-500/20 text-amber-400"
            delay={0.25}
          />
          <EquivalentCard
            icon={Droplets}
            value={`${formatNumber(waterSaved, 0)}L`}
            label="Acqua risparmiata"
            sublabel="1.8L/kWh produzione termica"
            color="bg-blue-500/10 border-blue-500/20 text-blue-400"
            delay={0.3}
          />
          <EquivalentCard
            icon={Flame}
            value={`${formatNumber(totalCO2Saved * 0.37, 0)}L`}
            label="Benzina evitata"
            sublabel="2.31 kg CO₂/litro benzina"
            color="bg-red-500/10 border-red-500/20 text-red-400"
            delay={0.35}
          />
        </div>
      </div>

      {/* CO₂ Trend Chart */}
      <Card variant="glass" delay={0.4}>
        <h3 className="text-sm font-semibold text-dark-200 mb-5">
          Andamento CO₂ — Emissioni vs Risparmio
        </h3>
        <div className="h-64">
          {loading ? (
            <Skeleton className="w-full" height="h-56" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={co2ChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="co2" name="CO₂ Emessa" stroke="#ef4444" strokeWidth={2} fill="url(#co2Grad)" />
                <Area type="monotone" dataKey="saved" name="CO₂ Risparmiata" stroke="#10b981" strokeWidth={2} fill="url(#savedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Source Breakdown */}
      <Card variant="glass" delay={0.45}>
        <h3 className="text-sm font-semibold text-dark-200 mb-5">
          CO₂ per Fonte Energetica
        </h3>
        <div className="h-56">
          {loading ? (
            <Skeleton className="w-full" height="h-48" />
          ) : co2BySource.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={co2BySource} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="co2" name="CO₂ (kg)" radius={[0, 6, 6, 0]} maxBarSize={24}>
                  {co2BySource.map((entry, i) => (
                    <Cell key={i} fill={SOURCE_COLORS[entry.source] || '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-dark-500">
              Nessun dato disponibile
            </div>
          )}
        </div>

        {/* Factor Table */}
        <div className="mt-5 pt-4 border-t border-dark-700/30">
          <p className="text-xs text-dark-500 mb-2 font-medium">Fattori di emissione utilizzati (kg CO₂/kWh)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(CO2_FACTORS).map(([source, factor]) => (
              <div key={source} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-dark-800/30">
                <span className="text-[11px] text-dark-400">{SOURCE_LABELS[source] || source}</span>
                <span className="text-[11px] font-mono text-dark-300">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CO2Tracker;
