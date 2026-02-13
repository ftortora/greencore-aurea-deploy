import { cn } from '../../utils/helpers';



const colorMap = {
  green: 'bg-aurea-500/15 text-aurea-400 border-aurea-500/20',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  red: 'bg-red-500/15 text-red-400 border-red-500/20',
  cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  gray: 'bg-dark-600/30 text-dark-300 border-dark-600/30',
};

const sizeMap = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
};

const sourceColorMap = {
  solare: 'amber',
  eolico: 'blue',
  idroelettrico: 'cyan',
  biomassa: 'green',
  geotermico: 'red',
  rete: 'purple',
  altro: 'gray',
};

const Badge = ({
  children,
  color = 'green',
  size = 'sm',
  source,
  dot = false,
  className,
}) => {
  const resolvedColor = source ? sourceColorMap[source] || 'gray' : color;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-lg border',
        colorMap[resolvedColor],
        sizeMap[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            resolvedColor === 'green' && 'bg-aurea-400',
            resolvedColor === 'blue' && 'bg-blue-400',
            resolvedColor === 'amber' && 'bg-amber-400',
            resolvedColor === 'red' && 'bg-red-400',
            resolvedColor === 'cyan' && 'bg-cyan-400',
            resolvedColor === 'purple' && 'bg-purple-400',
            resolvedColor === 'gray' && 'bg-dark-400'
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
