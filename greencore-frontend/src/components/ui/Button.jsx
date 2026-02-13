import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';



const variants = {
  primary:
    'btn-shine bg-gradient-to-r from-aurea-600 via-aurea-500 to-aurea-600 bg-[length:200%_100%] text-white shadow-glow-sm hover:shadow-glow hover:bg-[position:100%_0] active:from-aurea-700 active:to-aurea-600',
  secondary:
    'glass inner-light text-aurea-300 hover:text-aurea-200 hover:border-aurea-500/20 active:bg-dark-800/80',
  ghost:
    'text-dark-300 hover:text-aurea-400 hover:bg-dark-800/40 active:bg-dark-800/60',
  danger:
    'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 active:bg-red-500/30',
  outline:
    'border border-aurea-500/25 text-aurea-400 hover:bg-aurea-500/8 hover:border-aurea-500/50 active:bg-aurea-500/15',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-base gap-2',
  xl: 'px-8 py-3 text-lg gap-2.5',
  icon: 'p-2',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon: Icon,
      iconRight: IconRight,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        className={cn(
          'relative inline-flex items-center justify-center font-medium rounded-xl',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-aurea-500/40 focus:ring-offset-2 focus:ring-offset-dark-950',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        {!loading && Icon && <Icon className="w-4 h-4 shrink-0" />}
        {children && <span>{children}</span>}
        {!loading && IconRight && <IconRight className="w-4 h-4 shrink-0" />}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
