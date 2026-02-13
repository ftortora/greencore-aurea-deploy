import { Clock } from 'lucide-react';
import { useEnergy } from '../../contexts/EnergyContext';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Skeleton } from '../ui/Loading';
import { formatNumber, formatRelativeDate } from '../../utils/helpers';

const RecentList = () => {
  const { entries, loading } = useEnergy();
  const recent = (entries || []).slice(0, 5);

  return (
    <Card variant="glass">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-aurea-400" />
        <h3 className="text-sm font-semibold text-dark-200">Attività Recente</h3>
      </div>
      {loading || !recent.length ? (
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

export default RecentList;
