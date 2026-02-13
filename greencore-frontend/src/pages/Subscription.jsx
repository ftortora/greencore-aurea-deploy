import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Check,
  Zap,
  Shield,
  BarChart3,
  Globe,
  Crown,
  Sparkles,
  ChevronRight,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../utils/helpers';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Zap,
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: 'gray',
    gradient: 'from-slate-500 to-slate-600',
    features: [
      'Monitoraggio base consumi',
      'Fino a 50 registrazioni/mese',
      'Dashboard essenziale',
      'Report mensile email',
    ],
    cta: 'Piano Attuale',
    current: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: BarChart3,
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    color: 'green',
    gradient: 'from-aurea-500 to-aurea-600',
    popular: true,
    features: [
      'Registrazioni illimitate',
      'Analytics avanzati + CO₂',
      'Export CSV / PDF',
      'Obiettivi personalizzati',
      'API access',
      'Supporto prioritario',
    ],
    cta: 'Inizia Pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Crown,
    monthlyPrice: 29.99,
    yearlyPrice: 299.99,
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    features: [
      'Tutto di Pro +',
      'Multi-sede / Team',
      'Dashboard white-label',
      'Integrazioni IoT / Smart Meter',
      'SLA 99.9% uptime',
      'Account manager dedicato',
      'Fatturazione personalizzata',
    ],
    cta: 'Contattaci',
  },
];

const ApplePayIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M17.72 8.2c-.1.07-1.84 1.06-1.82 3.16.02 2.49 2.19 3.37 2.21 3.38-.02.06-.34 1.18-1.14 2.34-.69.99-1.4 1.99-2.53 2.01-1.11.02-1.46-.65-2.73-.65-1.27 0-1.66.63-2.71.67-1.09.04-1.91-1.07-2.61-2.06C5 15.19 3.93 12.06 5.34 9.94c.7-1.05 1.94-1.72 3.29-1.74 1.07-.02 2.08.72 2.73.72.65 0 1.88-.89 3.17-.76.54.02 2.05.22 3.02 1.63l.17.41zM14.85 3.52c.58-.7.97-1.68.86-2.65-.83.03-1.84.55-2.44 1.25-.53.62-1 1.62-.87 2.57.93.07 1.87-.47 2.45-1.17z" />
  </svg>
);

const GooglePayIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4" />
  </svg>
);

const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').slice(0, 16);
  const parts = [];
  for (let i = 0; i < v.length; i += 4) parts.push(v.slice(i, i + 4));
  return parts.join(' ');
};

const formatExpiry = (value) => {
  const v = value.replace(/[^0-9]/g, '').slice(0, 4);
  if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2);
  return v;
};

const detectCardBrand = (number) => {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return null;
};

const CardBrandIcon = ({ brand }) => {
  if (brand === 'visa') {
    return (
      <div className="text-[10px] font-bold tracking-wider text-blue-400 italic">VISA</div>
    );
  }
  if (brand === 'mastercard') {
    return (
      <div className="flex">
        <div className="w-4 h-4 rounded-full bg-red-500/80" />
        <div className="w-4 h-4 rounded-full bg-yellow-500/80 -ml-2" />
      </div>
    );
  }
  if (brand === 'amex') {
    return (
      <div className="text-[9px] font-bold tracking-wider text-blue-300">AMEX</div>
    );
  }
  return <CreditCard className="w-4 h-4 text-dark-500" />;
};

const Subscription = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [billing, setBilling] = useState('yearly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState('plans');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const expiryRef = useRef(null);
  const cvcRef = useRef(null);

  const cardBrand = detectCardBrand(card.number);

  const handleCardChange = (field, value) => {
    if (field === 'number') {
      const formatted = formatCardNumber(value);
      setCard((p) => ({ ...p, number: formatted }));
      if (formatted.replace(/\s/g, '').length === 16) expiryRef.current?.focus();
    } else if (field === 'expiry') {
      const formatted = formatExpiry(value);
      setCard((p) => ({ ...p, expiry: formatted }));
      if (formatted.length === 5) cvcRef.current?.focus();
    } else {
      setCard((p) => ({ ...p, [field]: value }));
    }
  };

  const handlePayment = async (method = 'card') => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2500));
    setProcessing(false);
    setSuccess(true);
    toast.success(`Abbonamento ${selectedPlan.name} attivato! 🎉`);
  };

  const handleSelectPlan = (plan) => {
    if (plan.current) return;
    if (plan.id === 'enterprise') {
      toast.info('Contattaci a enterprise@greencore-aurea.com per un piano personalizzato');
      return;
    }
    setSelectedPlan(plan);
    setStep('payment');
  };

  const price = selectedPlan
    ? billing === 'yearly'
      ? selectedPlan.yearlyPrice
      : selectedPlan.monthlyPrice
    : 0;

  const isCardValid =
    card.number.replace(/\s/g, '').length === 16 &&
    card.expiry.length === 5 &&
    card.cvc.length >= 3 &&
    card.name.length >= 2;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        {step !== 'plans' && (
          <button
            onClick={() => {
              if (success) { setStep('plans'); setSuccess(false); setSelectedPlan(null); }
              else setStep('plans');
            }}
            className="p-2 rounded-xl glass hover:bg-dark-800/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-dark-400" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-aurea-400" />
            {step === 'plans' ? 'Piani e Abbonamento' : success ? 'Pagamento Completato' : 'Pagamento'}
          </h1>
          <p className="text-sm text-dark-500 mt-1">
            {step === 'plans'
              ? 'Scegli il piano più adatto alle tue esigenze'
              : success
                ? 'Il tuo abbonamento è stato attivato con successo'
                : `Completa il pagamento per ${selectedPlan?.name}`}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ═══════════ STEP 1: PLANS ═══════════ */}
        {step === 'plans' && (
          <motion.div
            key="plans"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Billing Toggle */}
            <div className="flex justify-center">
              <div className="glass rounded-xl p-1 inline-flex items-center gap-1">
                <button
                  onClick={() => setBilling('monthly')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    billing === 'monthly'
                      ? 'bg-aurea-500/15 text-aurea-400'
                      : 'text-dark-400 hover:text-dark-200'
                  )}
                >
                  Mensile
                </button>
                <button
                  onClick={() => setBilling('yearly')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                    billing === 'yearly'
                      ? 'bg-aurea-500/15 text-aurea-400'
                      : 'text-dark-400 hover:text-dark-200'
                  )}
                >
                  Annuale
                  <Badge color="green" size="xs">-17%</Badge>
                </button>
              </div>
            </div>

            {/* Plan Cards */}
            <div className="grid md:grid-cols-3 gap-5">
              {PLANS.map((plan, i) => (
                <Card
                  key={plan.id}
                  variant={plan.popular ? 'glow' : 'glass'}
                  padding="none"
                  delay={i * 0.1}
                  hover
                  className={cn(
                    'relative overflow-hidden transition-all duration-300',
                    plan.popular && 'ring-1 ring-aurea-500/30 scale-[1.02]',
                    plan.current && 'opacity-70'
                  )}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-aurea-400 via-aurea-500 to-aurea-600" />
                  )}

                  <div className="p-6 space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2.5 rounded-xl bg-gradient-to-br', plan.gradient, 'text-white')}>
                          <plan.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-display font-bold text-dark-100">{plan.name}</h3>
                          {plan.popular && <Badge color="green" size="xs">Più popolare</Badge>}
                          {plan.current && <Badge color="gray" size="xs">Attuale</Badge>}
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-display font-bold text-dark-100">
                        €{billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-sm text-dark-500">
                        /{billing === 'yearly' ? 'anno' : 'mese'}
                      </span>
                    </div>
                    {billing === 'yearly' && plan.monthlyPrice > 0 && (
                      <p className="text-xs text-dark-500">
                        equivale a €{(plan.yearlyPrice / 12).toFixed(2)}/mese
                      </p>
                    )}

                    {/* Features */}
                    <ul className="space-y-2.5">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-sm text-dark-300">
                          <Check className={cn('w-4 h-4 shrink-0 mt-0.5', plan.color === 'green' ? 'text-aurea-400' : plan.color === 'purple' ? 'text-purple-400' : 'text-dark-500')} />
                          {feat}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      variant={plan.popular ? 'primary' : plan.current ? 'ghost' : 'outline'}
                      size="lg"
                      className="w-full"
                      disabled={plan.current}
                      iconRight={!plan.current ? ChevronRight : undefined}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              {[
                { icon: Shield, text: 'Pagamenti sicuri SSL' },
                { icon: Lock, text: 'Dati crittografati' },
                { icon: CreditCard, text: 'Annulla quando vuoi' },
              ].map(({ icon: TIcon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-dark-500">
                  <TIcon className="w-3.5 h-3.5" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════ STEP 2: PAYMENT ═══════════ */}
        {step === 'payment' && !success && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid lg:grid-cols-5 gap-6"
          >
            {/* Payment Form */}
            <div className="lg:col-span-3 space-y-5">
              {/* Quick Pay */}
              <Card variant="glass" padding="md">
                <p className="text-xs text-dark-500 font-medium uppercase tracking-wider mb-3">Pagamento rapido</p>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePayment('apple_pay')}
                    disabled={processing}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-black font-semibold text-sm transition-all hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ApplePayIcon />
                    Apple Pay
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePayment('google_pay')}
                    disabled={processing}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-black font-semibold text-sm transition-all hover:bg-gray-100 disabled:opacity-50"
                  >
                    <GooglePayIcon />
                    Google Pay
                  </motion.button>
                </div>
              </Card>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-700/50" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 text-dark-500 bg-dark-950">oppure paga con carta</span>
                </div>
              </div>

              {/* Card Form */}
              <Card variant="glass" padding="md">
                <div className="space-y-4">
                  {/* Card Number */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-dark-400">Numero carta</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={card.number}
                        onChange={(e) => handleCardChange('number', e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        className="w-full rounded-xl px-4 py-2.5 pl-11 text-sm text-dark-100 placeholder-dark-600 bg-dark-900/60 border border-dark-700/40 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:border-aurea-500/40 focus:bg-dark-900/80 tracking-wider font-mono"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <CardBrandIcon brand={cardBrand} />
                      </div>
                    </div>
                  </div>

                  {/* Expiry + CVC */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-dark-400">Scadenza</label>
                      <input
                        ref={expiryRef}
                        type="text"
                        inputMode="numeric"
                        value={card.expiry}
                        onChange={(e) => handleCardChange('expiry', e.target.value)}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="w-full rounded-xl px-4 py-2.5 text-sm text-dark-100 placeholder-dark-600 bg-dark-900/60 border border-dark-700/40 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:border-aurea-500/40 focus:bg-dark-900/80 tracking-wider font-mono text-center"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-dark-400">CVC</label>
                      <input
                        ref={cvcRef}
                        type="text"
                        inputMode="numeric"
                        value={card.cvc}
                        onChange={(e) => handleCardChange('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        maxLength={4}
                        className="w-full rounded-xl px-4 py-2.5 text-sm text-dark-100 placeholder-dark-600 bg-dark-900/60 border border-dark-700/40 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:border-aurea-500/40 focus:bg-dark-900/80 tracking-wider font-mono text-center"
                      />
                    </div>
                  </div>

                  {/* Card Holder */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-dark-400">Titolare carta</label>
                    <input
                      type="text"
                      value={card.name}
                      onChange={(e) => handleCardChange('name', e.target.value)}
                      placeholder="MARIO ROSSI"
                      className="w-full rounded-xl px-4 py-2.5 text-sm text-dark-100 placeholder-dark-600 bg-dark-900/60 border border-dark-700/40 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:border-aurea-500/40 focus:bg-dark-900/80 uppercase tracking-wider"
                    />
                  </div>

                  {/* Pay Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => handlePayment('card')}
                    loading={processing}
                    disabled={!isCardValid}
                    icon={Lock}
                  >
                    {processing ? 'Elaborazione...' : `Paga €${price.toFixed(2)}`}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-dark-600">
                    <Shield className="w-3 h-3" />
                    Pagamento sicuro con crittografia SSL a 256-bit
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <Card variant="glass-strong" padding="md" className="sticky top-8">
                <h3 className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-4">Riepilogo ordine</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-xl bg-gradient-to-br text-white', selectedPlan.gradient)}>
                      <selectedPlan.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark-100">
                        Piano {selectedPlan.name}
                      </p>
                      <p className="text-xs text-dark-500">
                        Fatturazione {billing === 'yearly' ? 'annuale' : 'mensile'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-dark-700/30 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Subtotale</span>
                      <span className="text-dark-200">€{price.toFixed(2)}</span>
                    </div>
                    {billing === 'yearly' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-aurea-400">Risparmio annuale</span>
                        <span className="text-aurea-400">
                          -€{((selectedPlan.monthlyPrice * 12) - selectedPlan.yearlyPrice).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">IVA (22%)</span>
                      <span className="text-dark-200">€{(price * 0.22).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-dark-700/30 pt-3 flex justify-between">
                    <span className="text-sm font-semibold text-dark-200">Totale</span>
                    <span className="text-lg font-display font-bold text-aurea-400">
                      €{(price * 1.22).toFixed(2)}
                    </span>
                  </div>

                  <p className="text-[11px] text-dark-600 leading-relaxed">
                    Cliccando "Paga" accetti i Termini di Servizio e la Privacy Policy di Green Core AUREA.
                    Puoi annullare il tuo abbonamento in qualsiasi momento dalle impostazioni.
                  </p>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* ═══════════ STEP 3: SUCCESS ═══════════ */}
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-12 space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-aurea-500/15 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.4 }}
              >
                <Check className="w-10 h-10 text-aurea-400" />
              </motion.div>
            </motion.div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold text-dark-100">
                Pagamento completato!
              </h2>
              <p className="text-dark-400 max-w-md">
                Il tuo piano <strong className="text-aurea-400">{selectedPlan?.name}</strong> è ora attivo.
                Tutte le funzionalità premium sono sbloccate.
              </p>
            </div>

            <Card variant="glass" padding="sm" className="flex items-center gap-4 px-6">
              <div className="text-center">
                <p className="text-xs text-dark-500">Piano</p>
                <p className="text-sm font-semibold text-dark-200">{selectedPlan?.name}</p>
              </div>
              <div className="w-px h-8 bg-dark-700/30" />
              <div className="text-center">
                <p className="text-xs text-dark-500">Importo</p>
                <p className="text-sm font-semibold text-dark-200">€{(price * 1.22).toFixed(2)}</p>
              </div>
              <div className="w-px h-8 bg-dark-700/30" />
              <div className="text-center">
                <p className="text-xs text-dark-500">Rinnovo</p>
                <p className="text-sm font-semibold text-dark-200">
                  {billing === 'yearly' ? 'Annuale' : 'Mensile'}
                </p>
              </div>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button variant="primary" onClick={() => navigate('/dashboard')} icon={Zap}>
                Vai alla Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => { setStep('plans'); setSuccess(false); setSelectedPlan(null); }}
              >
                Cambia Piano
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Overlay */}
      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm"
          >
            <Card variant="glass-strong" padding="lg" className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 mx-auto border-2 border-aurea-500/20 border-t-aurea-500 rounded-full"
              />
              <div>
                <p className="text-dark-100 font-medium">Elaborazione pagamento...</p>
                <p className="text-xs text-dark-500 mt-1">Non chiudere questa finestra</p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Subscription;
