import { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/helpers';

const Select = forwardRef(
  ({ label, error, options = [], placeholder, icon: Icon, className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <select
            ref={ref}
            className={cn(
              'w-full appearance-none rounded-xl px-4 py-2.5 pr-10 text-sm',
              'backdrop-blur-sm',
              'transition-all duration-200',
              'focus:outline-none focus:border-aurea-500/50 focus:ring-2 focus:ring-aurea-500/20',
              'cursor-pointer',
              Icon && 'pl-10',
              error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
              className
            )}
            style={{
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-input)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: error ? 'rgba(239,68,68,0.5)' : 'var(--border-default)',
            }}
            {...props}
          >
            {placeholder && (
              <option value="" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                {placeholder}
              </option>
            )}
            {options.map((opt) => {
              const value = typeof opt === 'string' ? opt : opt.value;
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              return (
                <option key={value} value={value} style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                  {optLabel}
                </option>
              );
            })}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        </div>
        {error && (
          <div className="flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
