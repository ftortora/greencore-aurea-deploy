import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import UserTable from '../../components/admin/UserTable';
import SystemStats from '../../components/admin/SystemStats';
import Card from '../../components/ui/Card';
import { cn } from '../../utils/helpers';



const TABS = [
  { key: 'stats', label: 'Statistiche', icon: BarChart3 },
  { key: 'users', label: 'Utenti', icon: Users },
];

const AdminPanel = () => {
  const {
    users,
    systemStats,
    loading,
    userPagination,
    fetchUsers,
    fetchSystemStats,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState('stats');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchSystemStats();
  }, [fetchSystemStats]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers({ page: currentPage, search: searchQuery, limit: 15 });
    }
  }, [activeTab, currentPage, searchQuery, fetchUsers]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-display font-bold text-dark-50 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-aurea-400" />
          Pannello Admin
        </h1>
        <p className="text-sm text-dark-500">
          Gestione utenti, monitoraggio sistema e controllo ruoli
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-dark-800/30 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === tab.key
                ? 'text-aurea-400'
                : 'text-dark-500 hover:text-dark-300'
            )}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="admin-tab"
                className="absolute inset-0 bg-aurea-500/10 border border-aurea-500/20 rounded-lg"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <tab.icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'stats' && (
        <motion.div
          key="stats"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <SystemStats stats={systemStats} loading={!systemStats} />

          {/* Quick Actions */}
          <Card variant="glass" delay={0.25}>
            <h3 className="text-sm font-semibold text-dark-200 mb-4">
              Riepilogo Rapido
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-dark-800/30 text-center">
                <p className="text-2xl font-display font-bold text-dark-100">
                  {systemStats?.totalUsers || 0}
                </p>
                <p className="text-[11px] text-dark-500 mt-0.5">Utenti Totali</p>
              </div>
              <div className="p-3 rounded-xl bg-dark-800/30 text-center">
                <p className="text-2xl font-display font-bold text-aurea-400">
                  {systemStats?.activeToday || 0}
                </p>
                <p className="text-[11px] text-dark-500 mt-0.5">Attivi Oggi</p>
              </div>
              <div className="p-3 rounded-xl bg-dark-800/30 text-center">
                <p className="text-2xl font-display font-bold text-amber-400">
                  {systemStats?.totalEntries || 0}
                </p>
                <p className="text-[11px] text-dark-500 mt-0.5">Registrazioni</p>
              </div>
              <div className="p-3 rounded-xl bg-dark-800/30 text-center">
                <p className="text-2xl font-display font-bold text-cyan-400">
                  {systemStats?.dbStatus || '—'}
                </p>
                <p className="text-[11px] text-dark-500 mt-0.5">Stato DB</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 'users' && (
        <motion.div
          key="users"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <UserTable
            users={users}
            loading={loading}
            pagination={userPagination}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onRoleChange={updateUserRole}
            onToggleStatus={toggleUserStatus}
            onDelete={deleteUser}
            onSearch={handleSearch}
            searchQuery={searchQuery}
          />
        </motion.div>
      )}
    </div>
  );
};

export default AdminPanel;
