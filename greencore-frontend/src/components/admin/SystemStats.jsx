import { motion } from 'framer-motion';
import {
  Users,
  Zap,
  Database,
  Server,
  Activity,
  Globe,
  Clock,
  HardDrive,
} from 'lucide-react';
import Card from '../ui/Card';
import { Skeleton } from '../ui/Loading';
import { formatNumber } from '../../utils/helpers';



const StatItem = ({ icon: Icon, label, value, unit, color, loading: isLoading }) => (
  <div className="flex items-center gap-3">
    <div className={`p-2 rounded-xl border ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-dark-500 uppercase tracking-wider">{label}</p>
      {isLoading ? (
        <Skeleton className="w-16 mt-0.5" height="h-5" />
      ) : (
        <p className="text-base font-display font-bold text-dark-100">
          {typeof value === 'number' ? formatNumber(value) : value}
          {unit && <span className="text-xs text-dark-500 font-normal ml-1">{unit}</span>}
        </p>
      )}
    </div>
  </div>
);

const SystemStats = ({ stats, loading = false }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* User Stats */}
      <Card variant="glass" delay={0.05}>
        <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-4">
          Utenti
        </h4>
        <div className="space-y-3">
          <StatItem
            icon={Users}
            label="Totale Utenti"
            value={stats?.totalUsers || 0}
            color="bg-aurea-500/10 border-aurea-500/20 text-aurea-400"
            loading={loading}
          />
          <StatItem
            icon={Activity}
            label="Attivi Oggi"
            value={stats?.activeToday || 0}
            color="bg-blue-500/10 border-blue-500/20 text-blue-400"
            loading={loading}
          />
          <StatItem
            icon={Globe}
            label="Nuovi (7gg)"
            value={stats?.newUsersWeek || 0}
            color="bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
            loading={loading}
          />
        </div>
      </Card>

      {/* Energy Stats */}
      <Card variant="glass" delay={0.1}>
        <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-4">
          Energia
        </h4>
        <div className="space-y-3">
          <StatItem
            icon={Zap}
            label="Totale kWh"
            value={stats?.totalKWh || 0}
            unit="kWh"
            color="bg-amber-500/10 border-amber-500/20 text-amber-400"
            loading={loading}
          />
          <StatItem
            icon={Zap}
            label="Registrazioni"
            value={stats?.totalEntries || 0}
            color="bg-aurea-500/10 border-aurea-500/20 text-aurea-400"
            loading={loading}
          />
          <StatItem
            icon={Zap}
            label="Media/Utente"
            value={stats?.avgEntriesPerUser || 0}
            color="bg-purple-500/10 border-purple-500/20 text-purple-400"
            loading={loading}
          />
        </div>
      </Card>

      {/* Server Stats */}
      <Card variant="glass" delay={0.15}>
        <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-4">
          Server
        </h4>
        <div className="space-y-3">
          <StatItem
            icon={Server}
            label="Uptime"
            value={stats?.uptime || '—'}
            color="bg-aurea-500/10 border-aurea-500/20 text-aurea-400"
            loading={loading}
          />
          <StatItem
            icon={Clock}
            label="Risposta Media"
            value={stats?.avgResponseMs || 0}
            unit="ms"
            color="bg-blue-500/10 border-blue-500/20 text-blue-400"
            loading={loading}
          />
          <StatItem
            icon={Activity}
            label="Req/min"
            value={stats?.requestsPerMin || 0}
            color="bg-amber-500/10 border-amber-500/20 text-amber-400"
            loading={loading}
          />
        </div>
      </Card>

      {/* Database Stats */}
      <Card variant="glass" delay={0.2}>
        <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-4">
          Database
        </h4>
        <div className="space-y-3">
          <StatItem
            icon={Database}
            label="Stato"
            value={stats?.dbStatus || 'Connected'}
            color="bg-aurea-500/10 border-aurea-500/20 text-aurea-400"
            loading={loading}
          />
          <StatItem
            icon={HardDrive}
            label="Dimensione"
            value={stats?.dbSize || '—'}
            color="bg-purple-500/10 border-purple-500/20 text-purple-400"
            loading={loading}
          />
          <StatItem
            icon={Database}
            label="Collezioni"
            value={stats?.dbCollections || 0}
            color="bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
            loading={loading}
          />
        </div>
      </Card>
    </div>
  );
};

export default SystemStats;
