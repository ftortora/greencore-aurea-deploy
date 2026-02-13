import { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Zap,
  BarChart3,
  Globe,
  Lightbulb,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Leaf,
  ChevronDown,
  User,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/helpers';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/energy', label: 'Energia', icon: Zap },
  { path: '/analytics', label: 'Analisi', icon: BarChart3 },
  { path: '/co2', label: 'CO₂ Tracker', icon: Globe },
  { path: '/tips', label: 'Consigli', icon: Lightbulb },
  { path: '/subscription', label: 'Abbonamento', icon: CreditCard },
  { path: '/settings', label: 'Impostazioni', icon: Settings },
];

const ADMIN_ITEM = { path: '/admin', label: 'Admin Panel', icon: ShieldCheck };

const Navbar = () => {
  const { user, logout, displayName } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const navItems = useMemo(() => {
    return isAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;
  }, [isAdmin]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinkClass = (isActive) =>
    cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative group/nav',
      isActive
        ? 'bg-aurea-500/8 text-aurea-400 nav-active-pill'
        : 'text-dark-500 hover:text-dark-200 hover:bg-dark-800/30'
    );

  const renderNavItems = (items) =>
    items.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) => navLinkClass(isActive)}
      >
        {({ isActive }) => (
          <>
            <item.icon
              className={cn(
                'w-[18px] h-[18px] shrink-0 transition-all duration-300',
                isActive && 'drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]'
              )}
            />
            <span>{item.label}</span>
            {!isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 group-hover/nav:h-1/2 rounded-full bg-dark-500/50 transition-all duration-300" />
            )}
          </>
        )}
      </NavLink>
    ));

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 glass-strong border-r border-dark-700/50 z-40">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-dark-700/20">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="p-2 rounded-xl bg-aurea-500/10 border border-aurea-500/20 glow-breathe"
          >
            <Leaf className="w-5 h-5 text-aurea-400" />
          </motion.div>
          <div>
            <h1 className="text-base font-display font-bold text-dark-100">
              Green Core
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-aurea-500/80 tracking-widest uppercase">
                AUREA
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-aurea-500/8 text-aurea-500/60 border border-aurea-500/10">
                v5.2
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {renderNavItems(navItems)}
        </nav>

        <div className="px-3 py-4 border-t border-dark-700/30 space-y-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{isDark ? 'Tema Chiaro' : 'Tema Scuro'}</span>
          </button>

          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-dark-800/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurea-400 via-aurea-500 to-aurea-700 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
                {displayName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-dark-200 truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-dark-500 truncate">
                  {user?.role === 'admin' || user?.role === 'superadmin'
                    ? `${user.role} • ${user.email || ''}`
                    : user?.email || ''}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-dark-500 transition-transform',
                  userMenuOpen && 'rotate-180'
                )}
              />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 right-0 mb-2 glass-strong rounded-xl border border-dark-700/50 overflow-hidden shadow-xl"
                >
                  <NavLink
                    to="/settings"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-800/50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profilo
                  </NavLink>
                  {isAdmin && (
                    <NavLink
                      to="/admin"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin Panel
                    </NavLink>
                  )}
                  <button
                    onClick={logout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 glass-strong border-b border-dark-700/50 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <Leaf className="w-5 h-5 text-aurea-400" />
          <span className="text-sm font-display font-bold text-dark-100">
            AUREA
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed top-14 left-0 bottom-0 w-72 glass-strong border-r border-dark-700/50 z-50 flex flex-col"
            >
              <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {renderNavItems(navItems)}
              </div>
              <div className="px-3 py-4 border-t border-dark-700/30">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
