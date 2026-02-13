import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Home,
  Thermometer,
  Droplets,
  Monitor,
  Zap,
  Sun,
  Wind,
  Star,
  Filter,
} from 'lucide-react';
import TipCard from '../components/ui/TipCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { cn } from '../utils/helpers';



const CATEGORIES = [
  { key: 'tutti', label: 'Tutti', icon: Lightbulb },
  { key: 'casa', label: 'Casa', icon: Home },
  { key: 'riscaldamento', label: 'Riscaldamento', icon: Thermometer },
  { key: 'acqua', label: 'Acqua', icon: Droplets },
  { key: 'elettronica', label: 'Elettronica', icon: Monitor },
  { key: 'rinnovabile', label: 'Rinnovabile', icon: Sun },
];

const DIFFICULTIES = ['tutti', 'facile', 'medio', 'avanzato'];

const TIPS = [
  { title: 'LED al posto delle lampadine tradizionali', description: 'Sostituisci tutte le lampadine con LED a basso consumo. Durano fino a 25 volte di più e consumano l\'80% in meno di energia.', category: 'casa', difficulty: 'facile', savingsKWh: 30, savingsEuro: 8, icon: Lightbulb },
  { title: 'Pompa di calore ad alta efficienza', description: 'Installa una pompa di calore aria-acqua con COP ≥ 4.0. Può ridurre i costi di riscaldamento fino al 60% rispetto a una caldaia a gas.', category: 'riscaldamento', difficulty: 'avanzato', savingsKWh: 200, savingsEuro: 50, icon: Thermometer },
  { title: 'Doccia con riduttore di flusso', description: 'Installa riduttori di flusso su docce e rubinetti. Un flusso di 7L/min invece di 12L/min riduce il consumo di acqua calda del 40%.', category: 'acqua', difficulty: 'facile', savingsKWh: 25, savingsEuro: 7, icon: Droplets },
  { title: 'Standby killer con ciabatta smart', description: 'I dispositivi in standby consumano fino al 10% dell\'energia totale. Una ciabatta con interruttore elimina i consumi fantasma.', category: 'elettronica', difficulty: 'facile', savingsKWh: 40, savingsEuro: 10, icon: Monitor },
  { title: 'Pannelli solari con accumulo', description: 'Un impianto fotovoltaico da 3kW con batteria da 5kWh copre circa il 70% del fabbisogno energetico domestico annuale.', category: 'rinnovabile', difficulty: 'avanzato', savingsKWh: 350, savingsEuro: 80, icon: Sun },
  { title: 'Termostato smart programmabile', description: 'Un termostato intelligente impara le tue abitudini e regola automaticamente la temperatura, risparmiando fino al 15% sui costi.', category: 'riscaldamento', difficulty: 'medio', savingsKWh: 80, savingsEuro: 20, icon: Thermometer },
  { title: 'Elettrodomestici classe A+++', description: 'Sostituisci gli elettrodomestici vecchi con modelli A+++. Un frigorifero nuovo consuma il 60% in meno rispetto a uno di 10 anni fa.', category: 'casa', difficulty: 'medio', savingsKWh: 120, savingsEuro: 30, icon: Zap },
  { title: 'Micro-eolico residenziale', description: 'In zone ventose, un micro-eolico da 1kW produce 1.500-2.500 kWh/anno integrando il fotovoltaico nelle ore notturne.', category: 'rinnovabile', difficulty: 'avanzato', savingsKWh: 180, savingsEuro: 45, icon: Wind },
  { title: 'Isolamento termico del sottotetto', description: 'L\'isolamento del sottotetto riduce le dispersioni termiche fino al 30%. Uno degli interventi con miglior rapporto costo/beneficio.', category: 'casa', difficulty: 'medio', savingsKWh: 150, savingsEuro: 35, icon: Home },
  { title: 'Raccolta acqua piovana', description: 'Un sistema da 3000L riduce il consumo di acqua potabile del 50% per irrigazione e pulizia, riducendo anche il pompaggio.', category: 'acqua', difficulty: 'medio', savingsKWh: 15, savingsEuro: 12, icon: Droplets },
  { title: 'Lavatrice a pieno carico e bassa temperatura', description: 'Lavare a 30°C invece di 60°C riduce il consumo energetico del 50%. Aspetta sempre il pieno carico prima di avviare.', category: 'casa', difficulty: 'facile', savingsKWh: 20, savingsEuro: 5, icon: Droplets },
  { title: 'Vetri doppi o tripli', description: 'Finestre con vetro basso-emissivo riducono le dispersioni del 40-60%. Con triplo vetro si raggiunge un Uw di 0.8 W/m²K.', category: 'casa', difficulty: 'avanzato', savingsKWh: 180, savingsEuro: 45, icon: Home },
  { title: 'Spegni il router di notte', description: 'Un router Wi-Fi consuma 6-12W costanti. Spegnerlo 8h/notte risparmia 18-35 kWh/anno senza impatto sulla tua vita.', category: 'elettronica', difficulty: 'facile', savingsKWh: 25, savingsEuro: 6, icon: Monitor },
  { title: 'Cottura con coperchio', description: 'Cucinare con il coperchio riduce il consumo energetico del 25%. L\'acqua bolle più velocemente e il calore non si disperde.', category: 'casa', difficulty: 'facile', savingsKWh: 10, savingsEuro: 3, icon: Home },
  { title: 'Valvole termostatiche', description: 'Le valvole termostatiche sui termosifoni consentono di regolare la temperatura stanza per stanza. Risparmio fino al 20%.', category: 'riscaldamento', difficulty: 'facile', savingsKWh: 60, savingsEuro: 15, icon: Thermometer },
  { title: 'Cappotto termico esterno', description: 'L\'isolamento a cappotto riduce le dispersioni murarie del 70%. Con Superbonus e detrazioni, l\'investimento si recupera in 5-8 anni.', category: 'riscaldamento', difficulty: 'avanzato', savingsKWh: 250, savingsEuro: 60, icon: Thermometer },
  { title: 'Monitor e TV: luminosità automatica', description: 'Il sensore di luminosità adatta la retroilluminazione all\'ambiente. Riduci la luminosità dal 100% al 60% e risparmi il 20% di energia.', category: 'elettronica', difficulty: 'facile', savingsKWh: 15, savingsEuro: 4, icon: Monitor },
  { title: 'Asciugatrice a pompa di calore', description: 'Rispetto a un\'asciugatrice tradizionale, la versione con pompa di calore consuma il 50% in meno con cicli da 1-2 kWh.', category: 'casa', difficulty: 'medio', savingsKWh: 90, savingsEuro: 22, icon: Zap },
  { title: 'Solare termico per ACS', description: 'Un impianto solare termico da 4m² copre fino al 70% del fabbisogno di acqua calda sanitaria di una famiglia di 4 persone.', category: 'rinnovabile', difficulty: 'medio', savingsKWh: 160, savingsEuro: 40, icon: Sun },
  { title: 'Riscaldamento a pavimento', description: 'Il riscaldamento a pavimento lavora a 30-35°C contro i 60-70°C dei termosifoni, con un\'efficienza superiore del 15-25%.', category: 'riscaldamento', difficulty: 'avanzato', savingsKWh: 130, savingsEuro: 32, icon: Thermometer },
  { title: 'Cisterna di accumulo termico', description: 'Un accumulo da 500L abbinato al solare termico consente di utilizzare l\'acqua calda anche nelle ore serali e notturne.', category: 'acqua', difficulty: 'avanzato', savingsKWh: 100, savingsEuro: 25, icon: Droplets },
  { title: 'Smart plug con monitoraggio', description: 'Le prese intelligenti mostrano il consumo reale di ogni dispositivo e permettono di spegnere da remoto quelli non necessari.', category: 'elettronica', difficulty: 'facile', savingsKWh: 30, savingsEuro: 8, icon: Monitor },
];

const Tips = () => {
  const [activeCategory, setActiveCategory] = useState('tutti');
  const [activeDifficulty, setActiveDifficulty] = useState('tutti');

  // Daily tip: one tip per day based on day-of-year
  const dailyTip = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return TIPS[dayOfYear % TIPS.length];
  }, []);

  const filtered = useMemo(() => {
    return TIPS.filter((t) => {
      if (activeCategory !== 'tutti' && t.category !== activeCategory) return false;
      if (activeDifficulty !== 'tutti' && t.difficulty !== activeDifficulty) return false;
      return true;
    });
  }, [activeCategory, activeDifficulty]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-display font-bold text-dark-50 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-aurea-400" />
          Consigli Energetici
        </h1>
        <p className="text-sm text-dark-500">
          {TIPS.length} suggerimenti pratici per ridurre consumi e costi energetici
        </p>
      </motion.div>

      {/* Daily Tip Highlight */}
      <Card variant="glow" delay={0.05} className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-aurea-600 via-aurea-400 to-aurea-600" />
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-aurea-500/15 border border-aurea-500/20 shrink-0">
            <Star className="w-6 h-6 text-aurea-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge color="green" size="sm">Consiglio del Giorno</Badge>
              <Badge color={dailyTip.difficulty === 'facile' ? 'green' : dailyTip.difficulty === 'medio' ? 'amber' : 'red'} size="xs">
                {dailyTip.difficulty}
              </Badge>
            </div>
            <h3 className="text-base font-semibold text-dark-100 mb-1">{dailyTip.title}</h3>
            <p className="text-sm text-dark-400 leading-relaxed">{dailyTip.description}</p>
            {(dailyTip.savingsKWh || dailyTip.savingsEuro) && (
              <div className="flex items-center gap-4 mt-2">
                {dailyTip.savingsKWh && (
                  <span className="text-xs text-aurea-400 font-semibold">-{dailyTip.savingsKWh} kWh/mese</span>
                )}
                {dailyTip.savingsEuro && (
                  <span className="text-xs text-aurea-400 font-semibold">-{dailyTip.savingsEuro}€/mese</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.key}
              variant={activeCategory === cat.key ? 'outline' : 'ghost'}
              size="sm"
              icon={cat.icon}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-dark-500" />
          <span className="text-xs text-dark-500 mr-1">Difficoltà:</span>
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDifficulty(d)}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-lg transition-all capitalize',
                activeDifficulty === d
                  ? 'bg-aurea-500/10 text-aurea-400 border border-aurea-500/20'
                  : 'text-dark-500 hover:text-dark-300 hover:bg-dark-800/30'
              )}
            >
              {d}
            </button>
          ))}
          <span className="text-xs text-dark-600 ml-auto">
            {filtered.length} risultat{filtered.length === 1 ? 'o' : 'i'}
          </span>
        </div>
      </motion.div>

      {/* Tips Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCategory}-${activeDifficulty}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {filtered.map((tip, i) => (
            <TipCard key={i} {...tip} delay={0.05 + i * 0.03} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-dark-500">
          <Lightbulb className="w-10 h-10 mx-auto mb-3 text-dark-700" />
          <p className="text-sm">Nessun consiglio per questa combinazione di filtri</p>
        </div>
      )}
    </div>
  );
};

export default Tips;
