import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Zap, Leaf, TrendingUp, Clock, Lightbulb, BarChart2 } from 'lucide-react';
import { useEnergy } from '../../contexts/EnergyContext';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Skeleton } from '../ui/Loading';
import { SOURCE_COLORS, SOURCE_LABELS, formatNumber, formatRelativeDate } from '../../utils/helpers';

// ═══════ SourcePieChart ═══════
const SourceTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 shadow-lg border border-dark-700/50">
      <p className="text-xs text-dark-400 mb-1">{payload[0].name}</p>
      <p className="text-xs font-medium text-dark-200">{formatNumber(payload[0].value)} kWh</p>
    </div>
  );
};

export const SourcePieChart = () => {
  const { sourceDistribution } = useEnergy();
  const data = (sourceDistribution || []).map((s) => ({
    name: SOURCE_LABELS[s.source] || s.source,
    value: s.kWh || 0,
    color: SOURCE_COLORS[s.source] || '#64748b',
  }));

  return (
    <Card variant="glass">
      <div className="flex items-center gap-2 mb-5">
        <Zap className="w-4 h-4 text-aurea-400" />
        <h3 className="text-sm font-semibold text-dark-200">Distribuzione Fonti</h3>
      </div>
      <div className="h-64">
        {!data.length ? (
          <Skeleton className="w-full" height="h-56" />
        ) : (
          <>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<SourceTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center">
              {data.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-dark-500">{item.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

// ═══════ CO2CompareChart ═══════
export const CO2CompareChart = ({ data = [] }) => {
  const chartData = (data || []).map((d) => ({
    date: d.date,
    emitted: ((d.kWh || 0) * 0.475).toFixed(2),
    saved: ((d.kWh || 0) * 0.3).toFixed(2),
  }));

  return (
    <Card variant="glass">
      <div className="flex items-center gap-2 mb-3">
        <Leaf className="w-4 h-4 text-aurea-400" />
        <h3 className="text-sm font-semibold text-dark-200">CO₂ Overview</h3>
      </div>
      {!chartData.length ? (
        <Skeleton height="h-32" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
            <p className="text-xs text-dark-500 mb-1">CO₂ Emessa</p>
            <p className="text-2xl font-display font-bold text-red-400">
              {formatNumber(chartData.reduce((acc, d) => acc + parseFloat(d.emitted), 0))}
              <span className="text-sm text-dark-500 ml-1">kg</span>
            </p>
          </div>
          <div className="p-4 rounded-xl bg-aurea-500/5 border border-aurea-500/10">
            <p className="text-xs text-dark-500 mb-1">CO₂ Risparmiata</p>
            <p className="text-2xl font-display font-bold text-aurea-400">
              {formatNumber(chartData.reduce((acc, d) => acc + parseFloat(d.saved), 0))}
              <span className="text-sm text-dark-500 ml-1">kg</span>
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

// ═══════ CO2BySourceChart ═══════
export const CO2BySourceChart = ({ bySource = [] }) => {
  const data = (bySource || []).map((s) => ({
    source: SOURCE_LABELS[s.source] || s.source,
    co2: s.co2Emitted || 0,
  }));

  return (
    <Card variant="glass">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-4 h-4 text-aurea-400" />
        <h3 className="text-sm font-semibold text-dark-200">CO₂ per Fonte</h3>
      </div>
      {!data.length ? (
        <Skeleton height="h-24" />
      ) : (
        <div className="space-y-2">
          {data.slice(0, 5).map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-dark-400 w-24 truncate">{item.source}</span>
              <div className="flex-1 h-6 bg-dark-800/30 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500/50 to-red-500/30 transition-all duration-500"
                  style={{ width: `${(item.co2 / Math.max(...data.map((d) => d.co2))) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-dark-300 w-16 text-right">
                {formatNumber(item.co2, 2)} kg
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ═══════ RecentList ═══════
export const RecentList = () => {
  const { entries } = useEnergy();
  const recent = (entries || []).slice(0, 5);

  return (
    <Card variant="glass">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-aurea-400" />
        <h3 className="text-sm font-semibold text-dark-200">Attività Recente</h3>
      </div>
      {!recent.length ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="h-12" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map((entry, i) => (
            <div
              key={entry._id || i}
              className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/20 hover:bg-dark-800/40 transition-colors"
            >
              <Badge source={entry.source} size="xs" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-dark-300 truncate">{entry.description || 'Consumo energetico'}</p>
                <p className="text-[10px] text-dark-600">{formatRelativeDate(entry.date)}</p>
              </div>
              <span className="text-xs font-semibold text-aurea-400">{formatNumber(entry.kWh || entry.amount)} kWh</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ═══════ EnergySavingTipsCard ═══════
export const EnergySavingTipsCard = ({ stats }) => {
  const tips = [
    { text: 'Passa alle lampadine LED', saving: '30 kWh/mese' },
    { text: 'Usa ciabatte smart', saving: '40 kWh/mese' },
    { text: 'Installa un termostato programmabile', saving: '80 kWh/mese' },
  ];

  return (
    <Card variant="glass">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-dark-200">Consigli</h3>
      </div>
      <div className="space-y-2">
        {tips.map((tip, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <p className="text-xs text-dark-300">{tip.text}</p>
            <p className="text-[10px] text-amber-400 font-medium mt-0.5">-{tip.saving}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SourcePieChart;
