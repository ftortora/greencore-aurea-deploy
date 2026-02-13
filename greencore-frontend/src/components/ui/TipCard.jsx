import { motion } from 'framer-motion';
import { Zap, Euro } from 'lucide-react';
import Card from './Card';
import Badge from './Badge';
import { cn } from '../../utils/helpers';



const difficultyConfig = {
  facile: { color: 'green', label: 'Facile', dots: 1 },
  medio: { color: 'amber', label: 'Medio', dots: 2 },
  avanzato: { color: 'red', label: 'Avanzato', dots: 3 },
};

const DifficultyDots = ({ level }) => {
  const config = difficultyConfig[level] || difficultyConfig.facile;
  const colors = {
    green: 'bg-aurea-400',
    amber: 'bg-amber-400',
    red: 'bg-red-400',
  };
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((dot) => (
        <div
          key={dot}
          className={cn(
            'w-1.5 h-1.5 rounded-full transition-all',
            dot <= config.dots ? colors[config.color] : 'bg-dark-700'
          )}
        />
      ))}
    </div>
  );
};

const TipCard = ({
  title,
  description,
  category,
  difficulty = 'facile',
  savingsKWh,
  savingsEuro,
  icon: Icon,
  delay = 0,
}) => {
  const diff = difficultyConfig[difficulty] || difficultyConfig.facile;

  return (
    <Card variant="glass" hover delay={delay} className="group relative overflow-hidden">
      {/* Left accent line */}
      <div
        className={cn(
          'absolute left-0 top-4 bottom-4 w-[2px] rounded-full transition-all duration-500',
          'bg-gradient-to-b',
          difficulty === 'facile' && 'from-aurea-500/60 to-aurea-500/10',
          difficulty === 'medio' && 'from-amber-500/60 to-amber-500/10',
          difficulty === 'avanzato' && 'from-red-500/60 to-red-500/10',
          'group-hover:top-2 group-hover:bottom-2'
        )}
      />

      <div className="flex gap-4">
        {/* Icon */}
        {Icon && (
          <motion.div
            whileHover={{ rotate: 10 }}
            className={cn(
              'p-2.5 rounded-xl shrink-0 h-fit border transition-all duration-300',
              'bg-dark-800/40 border-dark-700/30',
              'group-hover:bg-aurea-500/10 group-hover:border-aurea-500/20'
            )}
          >
            <Icon className="w-5 h-5 text-dark-400 group-hover:text-aurea-400 transition-colors duration-300" />
          </motion.div>
        )}

        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-dark-200 group-hover:text-dark-100 transition-colors leading-snug">
              {title}
            </h3>
            <DifficultyDots level={difficulty} />
          </div>

          {/* Description */}
          <p className="text-xs text-dark-500 leading-relaxed line-clamp-3">
            {description}
          </p>

          {/* Savings + Tags */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {savingsKWh && (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-aurea-400 bg-aurea-500/8 px-2 py-0.5 rounded-lg">
                <Zap className="w-3 h-3" />
                <span>-{savingsKWh} kWh</span>
              </div>
            )}
            {savingsEuro && (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-aurea-400 bg-aurea-500/8 px-2 py-0.5 rounded-lg">
                <Euro className="w-3 h-3" />
                <span>-{savingsEuro}€/mese</span>
              </div>
            )}
            <Badge color={diff.color} size="xs" className="ml-auto">
              {diff.label}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TipCard;
