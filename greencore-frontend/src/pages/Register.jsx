import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { sanitizeInput } from '../utils/helpers';



const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const Register = () => {
  const { register: registerUser, oauthLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    
    console.log('📤 Sending register request:', { 
      username: data.username,
      email: data.email, 
      passwordLength: data.password?.length 
    });
    
    const result = await registerUser({
      username: sanitizeInput(data.username), // Username sanitized
      email: sanitizeInput(data.email),       // Email sanitized
      password: data.password,                // Password MAI sanitized
    });
    
    console.log('📥 Register result:', result);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-display font-bold text-themed">
          Crea Account
        </h2>
        <p className="text-sm text-themed-muted mt-1">
          Inizia a monitorare i tuoi consumi
        </p>
      </div>

      {/* ── OAuth Buttons (identical to Login) ── */}
      <div className="space-y-2.5">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => oauthLogin('google')}
          className="oauth-btn"
          type="button"
        >
          <GoogleIcon />
          <span>Registrati con Google</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => oauthLogin('github')}
          className="oauth-btn"
          type="button"
        >
          <GitHubIcon />
          <span>Registrati con GitHub</span>
        </motion.button>
      </div>

      {/* ── Divider ── */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-themed" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 text-themed-muted divider-label">oppure</span>
        </div>
      </div>

      {/* ── Registration Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username"
          type="text"
          icon={User}
          placeholder="il-tuo-username"
          autoComplete="username"
          error={errors.username?.message}
          {...register('username', {
            required: 'Username obbligatorio',
            minLength: { value: 3, message: 'Minimo 3 caratteri' },
            maxLength: { value: 30, message: 'Massimo 30 caratteri' },
            pattern: {
              value: /^[a-zA-Z0-9_.-]+$/,
              message: 'Solo lettere, numeri, punti, trattini e underscore',
            },
          })}
        />

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

        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          autoComplete="new-password"
          hint="Minimo 8 caratteri, una maiuscola e un numero"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password obbligatoria',
            minLength: { value: 8, message: 'Minimo 8 caratteri' },
            pattern: {
              value: /^(?=.*[A-Z])(?=.*\d)/,
              message: 'Deve contenere almeno una maiuscola e un numero',
            },
          })}
        />

        <Input
          label="Conferma Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Conferma la password',
            validate: (val) => val === password || 'Le password non corrispondono',
          })}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          icon={UserPlus}
          loading={loading}
        >
          Crea Account
        </Button>
      </form>

      {/* ── Login Link ── */}
      <p className="text-center text-sm text-themed-muted">
        Hai già un account?{' '}
        <Link
          to="/login"
          className="text-aurea-500 hover:text-aurea-400 font-medium transition-colors"
        >
          Accedi
        </Link>
      </p>
    </div>
  );
};

export default Register;
