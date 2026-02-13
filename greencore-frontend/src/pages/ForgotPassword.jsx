import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { sanitizeInput } from '../utils/helpers';



const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await forgotPassword(sanitizeInput(data.email));
    if (result.success) {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4 py-4"
      >
        <div className="mx-auto w-14 h-14 rounded-2xl bg-aurea-500/15 border border-aurea-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-aurea-400" />
        </div>
        <div>
          <h3 className="text-lg font-display font-bold text-dark-100">
            Email inviata!
          </h3>
          <p className="text-sm text-dark-400 mt-2 leading-relaxed">
            Abbiamo inviato un link di recupero a{' '}
            <span className="font-medium text-dark-200">{getValues('email')}</span>.
            Controlla la tua casella di posta.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/login">
            <Button variant="ghost" icon={ArrowLeft}>
              Torna al login
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-display font-bold text-dark-100">
          Password dimenticata?
        </h2>
        <p className="text-sm text-dark-500 mt-1">
          Inserisci la tua email per ricevere un link di recupero
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="la-tua@email.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email obbligatoria',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Email non valida',
            },
          })}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          icon={Send}
          loading={loading}
        >
          Invia Link di Recupero
        </Button>
      </form>

      <p className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-dark-500 hover:text-dark-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Torna al login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
