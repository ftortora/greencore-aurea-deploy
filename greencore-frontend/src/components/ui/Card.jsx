import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';



const cardVariants = {
  glass: 'glass inner-light',
  'glass-light': 'glass-light',
  'glass-strong': 'glass-strong inner-light',
  solid: 'bg-dark-850 border border-dark-700/50',
  glow: 'glass glow-border inner-light',
  shimmer: 'glass inner-light shimmer-line',
};

const Card = ({
  children,
  variant = 'glass',
  hover = false,
  padding = 'md',
  className,
  animate = true,
  delay = 0,
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8',
  };

  const Comp = animate ? motion.div : 'div';
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay, ease: 'easeOut' },
      }
    : {};

  return (
    <Comp
      className={cn(
        'rounded-2xl',
        cardVariants[variant],
        paddings[padding],
        hover && 'card-hover cursor-pointer',
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Comp>
  );
};

export default Card;
