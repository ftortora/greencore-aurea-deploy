import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { cn, SOURCE_LABELS } from '../../utils/helpers';

const sourceOptions = [
  { value: '', label: 'Tutte le fonti' },
  ...Object.entries(SOURCE_LABELS).map(([value, label]) => ({ value, label })),
];

const sortOptions = [
  { value: 'date', label: 'Data' },
  { value: 'kWh', label: 'Consumo kWh' },
  { value: 'source', label: 'Fonte' },
];

const EnergyFilters = ({ filters, onFilterChange, onReset, totalResults = 0 }) => {
  const [expanded, setExpanded] = useState(false);

  const hasActiveFilters =
    filters.source || filters.dateFrom || filters.dateTo || filters.search;

  return (
    <div className="space-y-3">
      {/* Top bar: Search + Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Cerca registrazioni..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
        </div>
        <Button
          variant={expanded ? 'outline' : 'secondary'}
          size="md"
          icon={expanded ? X : SlidersHorizontal}
          onClick={() => setExpanded(!expanded)}
          className="shrink-0"
        >
          <span className="hidden sm:inline">Filtri</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-aurea-400 absolute top-1.5 right-1.5" />
          )}
        </Button>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Select
                  label="Fonte energetica"
                  options={sourceOptions}
                  value={filters.source || ''}
                  onChange={(e) => onFilterChange({ source: e.target.value })}
                />
                <Input
                  label="Data inizio"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
                />
                <Input
                  label="Data fine"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => onFilterChange({ dateTo: e.target.value })}
                />
                <Select
                  label="Ordina per"
                  options={sortOptions}
                  value={filters.sortBy || 'date'}
                  onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-dark-700/30">
                <p className="text-xs text-dark-500">
                  {totalResults} risultat{totalResults === 1 ? 'o' : 'i'} trovati
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="xs"
                    icon={RotateCcw}
                    onClick={onReset}
                  >
                    Reset filtri
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnergyFilters;
