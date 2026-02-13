import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/helpers';



const Input = forwardRef(
  (
    {
      label,
      type = 'text',
      error,
      icon: Icon,
      hint,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        {label && (
          <label
            className={cn(
              'block text-sm font-medium transition-colors duration-200',
              focused ? 'text-aurea-400' : 'text-dark-400'
            )}
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {/* Focus glow ring */}
          <div
            className={cn(
              'absolute -inset-[1px] rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none',
              'bg-gradient-to-r from-aurea-500/20 via-aurea-400/10 to-aurea-500/20 blur-sm',
              focused && !error && 'opacity-100'
            )}
          />

          {Icon && (
            <div
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 z-10',
                focused ? 'text-aurea-400' : 'text-dark-500'
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              'relative w-full rounded-xl px-4 py-2.5 text-sm text-dark-100 placeholder-dark-600',
              'bg-dark-900/60 border border-dark-700/40',
              'backdrop-blur-sm',
              'transition-all duration-300',
              'focus:outline-none focus:border-aurea-500/40 focus:bg-dark-900/80',
              'hover:border-dark-600/60 hover:bg-dark-900/70',
              Icon && 'pl-10',
              isPassword && 'pr-10',
              error && 'border-red-500/40 focus:border-red-500/50',
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200',
                'text-dark-500 hover:text-dark-300'
              )}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Error with slide animation */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 text-xs text-red-400"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {hint && !error && (
          <p className="text-[11px] text-dark-600 leading-relaxed">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
