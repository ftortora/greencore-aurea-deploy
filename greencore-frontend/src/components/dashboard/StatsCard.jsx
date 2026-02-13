import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from '../ui/Card';
import { cn, formatNumber } from '../../utils/helpers';


// Animated number counter
const AnimatedNumber = ({ value, delay = 0, format = true }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || typeof value !== 'number') return;
    const duration = 900;
    const start = Date.now();
    const timer = setTimeout(() => {
      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - start - delay * 1000) / duration, 1);
        if (progress < 0) {
          requestAnimationFrame(animate);
          return;
        }
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(value * eased);
        if (progress < 1) requestAnimationFrame(animate);
        else setDisplay(value);
      };
      animate();
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [value, isInView, delay]);

  return (
    <span ref={ref} className="tabular-nums">
      {format ? formatNumber(display) : display.toFixed(1)}
    </span>
  );
};

const StatsCard = ({
  title,
  value,
  unit,
  change,
  changeLabel = 'vs mese prec.',
  icon: Icon,
  color = 'aurea',
  delay = 0,
  className,
}) => {
  const isPositive = change > 0;
  const isNeutral = change === 0 || change === undefined || change === null;

  const colorMap = {
    aurea: {
      icon: 'bg-aurea-500/10 border-aurea-500/20 text-aurea-400',
      bar: 'from-aurea-500 to-aurea-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    blue: {
      icon: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      bar: 'from-blue-500 to-blue-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    },
    amber: {
      icon: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      bar: 'from-amber-500 to-amber-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
    cyan: {
      icon: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      bar: 'from-cyan-500 to-cyan-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    },
    purple: {
      icon: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      bar: 'from-purple-500 to-purple-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    },
  };

  const colors = colorMap[color] || colorMap.aurea;

  return (
    <Card
      variant="glass"
      hover
      delay={delay}
      className={cn('group relative overflow-hidden', colors.glow, className)}
    >
      {/* Top accent gradient bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500',
          colors.bar
        )}
      />

      <div className="flex items-start justify-between">
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold text-dark-500 uppercase tracking-widest">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-display font-bold text-dark-50">
              {typeof value === 'number' ? (
                <AnimatedNumber value={value} delay={delay} />
              ) : (
                value
              )}
            </span>
            {unit && (
              <span className="text-sm text-dark-500 font-medium">{unit}</span>
            )}
          </div>

          {/* Change Indicator */}
          {!isNeutral && (
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.4 }}
                className={cn(
                  'flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg',
                  isPositive
                    ? 'bg-aurea-500/10 text-aurea-400'
                    : 'bg-red-500/10 text-red-400'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{Math.abs(change).toFixed(1)}%</span>
              </motion.div>
              <span className="text-[10px] text-dark-600">{changeLabel}</span>
            </div>
          )}
          {isNeutral && change !== undefined && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg bg-dark-700/30 text-dark-400">
                <Minus className="w-3 h-3" />
                <span>0%</span>
              </div>
              <span className="text-[10px] text-dark-600">{changeLabel}</span>
            </div>
          )}
        </div>

        {/* Icon with hover glow */}
        {Icon && (
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className={cn(
              'p-2.5 rounded-xl border transition-shadow duration-300',
              colors.icon,
              'group-hover:shadow-lg'
            )}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
        )}
      </div>

      {/* Background subtle gradient on hover */}
      <div
        className={cn(
          'absolute -bottom-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl',
          `bg-gradient-to-br ${colors.bar}`
        )}
        style={{ opacity: 'var(--hover-opacity, 0)' }}
      />
    </Card>
  );
};

export default StatsCard;
