import { Edit3, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import Badge from '../ui/Badge';
import { cn, formatDate, formatNumber, SOURCE_LABELS } from '../../utils/helpers';

const EnergyTable = ({
  entries = [],
  loading = false,
  pagination = { total: 0, pages: 1 },
  currentPage = 1,
  onPageChange,
  onEdit,
  onDelete,
  onSort,
  sortBy,
  sortOrder,
}) => {
  const columns = [
    { key: 'date', label: 'Data', sortable: true },
    { key: 'description', label: 'Descrizione', sortable: false },
    { key: 'source', label: 'Fonte', sortable: true },
    { key: 'amount', label: 'kWh', sortable: true, align: 'right' },
    { key: 'cost', label: 'Costo (€)', sortable: true, align: 'right' },
    { key: 'actions', label: '', sortable: false, align: 'right' },
  ];

  const handleSort = (key) => {
    if (!onSort) return;
    const newOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(key, newOrder);
  };

  const safeEntries = Array.isArray(entries) ? entries : [];

  const safeFormatNumber = (val) => {
    try {
      const n = Number(val);
      if (isNaN(n)) return '—';
      return formatNumber(n);
    } catch {
      return '—';
    }
  };

  const safeFormatDate = (val) => {
    try {
      if (!val) return '—';
      return formatDate(val);
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/40">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider',
                      col.align === 'right' ? 'text-right' : 'text-left',
                      col.sortable && 'cursor-pointer hover:text-dark-300 transition-colors select-none'
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className={cn('flex items-center gap-1', col.align === 'right' && 'justify-end')}>
                      {col.label}
                      {col.sortable && (
                        <ArrowUpDown className={cn('w-3 h-3', sortBy === col.key ? 'text-aurea-400' : 'text-dark-600')} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/20">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-dark-700/30 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : safeEntries.length > 0 ? (
                safeEntries.map((entry, i) => {
                  const amount = Number(entry.amount ?? entry.kWh ?? 0);
                  const cost = Number(entry.cost ?? 0);

                  return (
                    <tr
                      key={entry._id || i}
                      className="hover:bg-dark-800/20 transition-colors group"
                    >
                      <td className="px-4 py-3 text-sm text-dark-300">
                        {safeFormatDate(entry.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-dark-200 max-w-[200px] truncate">
                        {entry.description || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge source={entry.source} size="sm" dot>
                          {SOURCE_LABELS[entry.source] || entry.source || '—'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-dark-200 text-right">
                        {safeFormatNumber(amount)}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-dark-400 text-right">
                        {cost > 0 ? `€${cost.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit?.(entry)}
                            className="p-1.5 rounded-lg text-dark-400 hover:text-aurea-400 hover:bg-dark-800/50 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete?.(entry._id)}
                            className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-dark-500">
                    Nessun dato energetico trovato
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-dark-500">
            Pagina {currentPage} di {pagination.pages} ({pagination.total} totali)
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(pagination.pages, 5) }).map((_, i) => {
              let page;
              if (pagination.pages <= 5) page = i + 1;
              else if (currentPage <= 3) page = i + 1;
              else if (currentPage >= pagination.pages - 2) page = pagination.pages - 4 + i;
              else page = currentPage - 2 + i;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    page === currentPage
                      ? 'bg-aurea-500/15 text-aurea-400 border border-aurea-500/25'
                      : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
                  )}
                >
                  {page}
                </button>
              );
            })}
            <button
              disabled={currentPage >= pagination.pages}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 transition-colors disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyTable;
