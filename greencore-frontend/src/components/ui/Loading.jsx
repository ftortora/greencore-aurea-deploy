import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { cn } from '../../utils/helpers';



// ── Fullscreen Loader ──
export const LoadingScreen = ({ message = 'Caricamento...' }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-950">
    <div className="bg-aurora" />
    <div className="relative">
      {/* Outer orbital ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute -inset-6"
      >
        <div className="w-full h-full rounded-full border border-dashed border-aurea-500/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-aurea-400 shadow-glow-sm" />
      </motion.div>

      {/* Inner orbital ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute -inset-3"
      >
        <div className="w-full h-full rounded-full border border-aurea-500/10" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-aurea-300/60" />
      </motion.div>

      {/* Breathing pulse */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-2xl bg-aurea-500/10"
      />

      {/* Logo */}
      <motion.div
        animate={{ scale: [1, 0.95, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative p-4 rounded-2xl bg-aurea-500/10 border border-aurea-500/20"
      >
        <Leaf className="w-8 h-8 text-aurea-400" />
      </motion.div>
    </div>

    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      className="text-sm text-dark-400 font-medium mt-10"
    >
      {message}
    </motion.p>
  </div>
);

// ── Inline Spinner ──
export const Spinner = ({ size = 'md', className }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };
  return (
    <div className={cn('relative', sizes[size], className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, rgba(16,185,129,0.5) 80%, transparent 100%)',
          WebkitMask: 'radial-gradient(circle, transparent 55%, black 58%)',
          mask: 'radial-gradient(circle, transparent 55%, black 58%)',
        }}
      />
      <div className="absolute inset-[25%] flex items-center justify-center">
        <Leaf className="w-full h-full text-aurea-500" />
      </div>
    </div>
  );
};

// ── Skeleton Block ──
export const Skeleton = ({ className, lines = 1, height }) => {
  if (lines > 1) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-lg animate-pulse',
              'bg-gradient-to-r from-dark-800/70 via-dark-700/40 to-dark-800/70 bg-[length:200%_100%]',
              i === lines - 1 ? 'w-2/3' : 'w-full',
              height || 'h-4',
              className
            )}
            style={{ animationDuration: '1.8s' }}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn(
        'rounded-lg animate-pulse',
        'bg-gradient-to-r from-dark-800/70 via-dark-700/40 to-dark-800/70 bg-[length:200%_100%]',
        height || 'h-4',
        className
      )}
      style={{ animationDuration: '1.8s' }}
    />
  );
};

// ── Card Skeleton ──
export const CardSkeleton = ({ className }) => (
  <div className={cn('glass inner-light rounded-2xl p-5 space-y-3', className)}>
    <Skeleton className="w-1/3" height="h-3" />
    <Skeleton height="h-8" className="w-2/3" />
    <Skeleton className="w-1/2" height="h-3" />
  </div>
);

// ── Table Row Skeleton ──
export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="border-b border-dark-700/20">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <Skeleton className={i === 0 ? 'w-28' : 'w-16'} />
      </td>
    ))}
  </tr>
);

const Loading = ({ fullScreen = false, message }) => {
  if (fullScreen) return <LoadingScreen message={message} />;
  return (
    <div className="flex items-center justify-center py-16">
      <Spinner size="lg" />
    </div>
  );
};

export default Loading;
