import { useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Leaf, Activity, BarChart3, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEnergy } from '../contexts/EnergyContext';
import StatsCard from '../components/dashboard/StatsCard';
import EnergyChart from '../components/dashboard/EnergyChart';
import SourcePieChart from '../components/dashboard/SourcePieChart';
import RecentList from '../components/dashboard/RecentList';
import CO2CompareChart from '../components/dashboard/CO2CompareChart';
import CO2BySourceChart from '../components/dashboard/CO2BySourceChart';
import EnergySavingTipsCard from '../components/dashboard/EnergySavingTipsCard';



const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 6) return { text: 'Buonanotte', emoji: '🌙' };
    if (h < 12) return { text: 'Buongiorno', emoji: '☀️' };
    if (h < 18) return { text: 'Buon pomeriggio', emoji: '🌤️' };
    return { text: 'Buonasera', emoji: '🌆' };
};

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const Dashboard = () => {
    const { displayName, isAuthenticated } = useAuth();
    const { stats, chartData, fetchStats, fetchChartData } = useEnergy();
    const navigate = useNavigate();


    useEffect(() => {
        if (!isAuthenticated) return;
        fetchStats('30d');
        fetchChartData('30d');
    }, [fetchStats, fetchChartData, isAuthenticated]);

    const greeting = useMemo(() => getGreeting(), []);
    const firstName = displayName?.split(' ')[0] || 'Utente';

    const handleChartPeriod = useCallback(
        (p) => {
            if (!isAuthenticated) return;
            fetchChartData(p);
            fetchStats(p);
        },
        [fetchChartData, fetchStats, isAuthenticated]
    );

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-7">
            {/* Header Greeting */}
            <motion.div variants={item} className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-dark-50">
                    {greeting.text}, <span className="text-gradient">{firstName}</span>{' '}
                    <span className="inline-block">{greeting.emoji}</span>
                </h1>
                <p className="text-sm text-dark-500">Ecco il riepilogo della tua attività energetica</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatsCard
                    title="Energia Totale"
                    value={stats?.totalKWh || 0}
                    unit="kWh"
                    change={stats?.monthlyChange}
                    icon={Zap}
                    color="aurea"
                    delay={0}
                />
                <StatsCard
                    title="CO₂ Risparmiata"
                    value={stats?.totalCO2Saved || 0}
                    unit="kg"
                    icon={Leaf}
                    color="cyan"
                    delay={0.05}
                />
                <StatsCard
                    title="Registrazioni"
                    value={stats?.totalEntries || 0}
                    icon={Activity}
                    color="blue"
                    delay={0.1}
                />
                <StatsCard
                    title="Rinnovabile"
                    value={stats?.renewablePercentage || 0}
                    unit="%"
                    icon={BarChart3}
                    color="purple"
                    delay={0.15}
                />
            </motion.div>

            {/* Charts Row */}
            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <EnergyChart data={chartData} onPeriodChange={handleChartPeriod} />
                </div>
                <div>
                    <SourcePieChart />
                </div>
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <CO2CompareChart data={chartData} />
                </div>
                <div>
                    <EnergySavingTipsCard stats={stats} />
                </div>
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-1 gap-4">
                <CO2BySourceChart bySource={stats?.bySource || []} />
            </motion.div>

            {/* Recent + Quick Action */}
            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <RecentList />
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-widest">Azioni Rapide</h3>
                    {[
                        { label: 'Nuova Registrazione', path: '/energy', color: 'aurea' },
                        { label: 'CO₂ Tracker', path: '/co2', color: 'cyan' },
                        { label: 'Consigli Energetici', path: '/tips', color: 'amber' },
                    ].map((action) => (
                        <motion.button
                            key={action.path}
                            onClick={() => navigate(action.path)}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full glass inner-light card-hover rounded-xl px-4 py-3 flex items-center justify-between group/action"
                        >
              <span className="text-sm font-medium text-dark-300 group-hover/action:text-dark-100 transition-colors">
                {action.label}
              </span>
                            <ArrowRight className="w-4 h-4 text-dark-600 group-hover/action:text-aurea-400 transition-colors" />
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
