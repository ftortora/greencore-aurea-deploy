import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../ui/Card';
import { SOURCE_COLORS, SOURCE_LABELS, formatNumber } from '../../utils/helpers';
import { useEnergy } from '../../contexts/EnergyContext';

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    const total = item?.payload?.total || 0;

    return (
        <div className="glass-strong rounded-xl px-3 py-2 shadow-lg border border-dark-700/50">
            <p className="text-xs font-medium text-dark-200">
                {item.name}: {formatNumber(item.value)} kWh
            </p>
            <p className="text-[11px] text-dark-500">
                {total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'}%
            </p>
        </div>
    );
};

const SourcePieChart = ({ data, title = 'Fonti Energetiche', delay = 0 }) => {
    const { sourceDistribution } = useEnergy();
    const effective = Array.isArray(data) ? data : sourceDistribution || [];

    const total = effective.reduce((sum, d) => sum + (d.kWh || d.value || d.amount || 0), 0);

    const chartData = effective.map((d) => ({
        name: SOURCE_LABELS[d.source || d.name] || d.source || d.name,
        value: d.kWh || d.value || d.amount || 0,
        source: d.source || d.name,
        total,
    }));

    return (
    <Card variant="glass" delay={delay}>
      <h3 className="text-sm font-semibold text-dark-200 mb-4">{title}</h3>

      {chartData.length > 0 ? (
        <>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={SOURCE_COLORS[entry.source] || '#64748b'}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-2">
            {chartData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{
                      backgroundColor:
                        SOURCE_COLORS[item.source] || '#64748b',
                    }}
                  />
                  <span className="text-xs text-dark-400">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-dark-200">
                    {formatNumber(item.value)} kWh
                  </span>
                  <span className="text-[11px] text-dark-500 w-10 text-right">
                    {total > 0
                      ? ((item.value / total) * 100).toFixed(0)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-48 text-sm text-dark-500">
          Nessun dato disponibile
        </div>
      )}
    </Card>
  );
};

export default SourcePieChart;
