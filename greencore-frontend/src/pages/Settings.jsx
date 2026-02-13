import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Shield,
  Save,
  Mail,
  AlertTriangle,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { sanitizeInput } from '../utils/helpers';



const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ── Profile Form (sends username) ──
  const profileForm = useForm({
    defaultValues: {
      username: user?.username || user?.name || '',
      email: user?.email || '',
    },
  });

  const handleProfileUpdate = async (data) => {
    setProfileLoading(true);
    await updateProfile({
      username: sanitizeInput(data.username),
      email: sanitizeInput(data.email),
    });
    setProfileLoading(false);
  };

  // ── Password Form ──
  const passwordForm = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handlePasswordChange = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError('confirmPassword', {
        message: 'Le password non coincidono',
      });
      return;
    }
    setPasswordLoading(true);
    const result = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    if (result.success) {
      passwordForm.reset();
    }
    setPasswordLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-display font-bold text-themed flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-aurea-400" />
          Impostazioni
        </h1>
        <p className="text-sm text-themed-muted">
          Gestisci il tuo profilo e le preferenze dell&apos;account
        </p>
      </motion.div>

      {/* ── Theme Toggle Section ── */}
      <Card variant="glass" delay={0}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-aurea-500/10 border border-aurea-500/20">
              {isDark ? (
                <Moon className="w-5 h-5 text-aurea-400" />
              ) : (
                <Sun className="w-5 h-5 text-aurea-400" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-themed-secondary">Aspetto</h3>
              <p className="text-xs text-themed-muted">
                {isDark ? 'Tema scuro attivo' : 'Tema chiaro attivo'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full transition-colors duration-300"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.2))'
                : 'linear-gradient(135deg, rgba(16,185,129,0.5), rgba(52,211,153,0.3))',
              border: '1px solid rgba(16,185,129,0.2)',
            }}
          >
            <motion.div
              animate={{ x: isDark ? 2 : 26 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
            >
              {isDark ? (
                <Moon className="w-3.5 h-3.5 text-dark-800" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
            </motion.div>
          </button>
        </div>
      </Card>

      {/* ── Profile Section ── */}
      <Card variant="glass" delay={0.05}>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-aurea-500/10 border border-aurea-500/20">
            <User className="w-5 h-5 text-aurea-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-themed-secondary">Profilo</h3>
            <p className="text-xs text-themed-muted">
              Aggiorna le tue informazioni personali
            </p>
          </div>
        </div>

        <form
          onSubmit={profileForm.handleSubmit(handleProfileUpdate)}
          className="space-y-4"
        >
          <Input
            label="Username"
            icon={User}
            placeholder="il-tuo-username"
            error={profileForm.formState.errors.username?.message}
            {...profileForm.register('username', {
              required: 'Username obbligatorio',
              minLength: { value: 3, message: 'Minimo 3 caratteri' },
              maxLength: { value: 30, message: 'Max 30 caratteri' },
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
            error={profileForm.formState.errors.email?.message}
            {...profileForm.register('email', {
              required: 'Email obbligatoria',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email non valida',
              },
            })}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              loading={profileLoading}
            >
              Salva Profilo
            </Button>
          </div>
        </form>

        {/* OAuth Badge */}
        {user?.provider && user.provider !== 'local' && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-muted)' }}>
            <div className="flex items-center gap-2 text-xs text-themed-muted">
              <Shield className="w-3.5 h-3.5" />
              Account collegato tramite{' '}
              <span className="font-medium text-themed-secondary capitalize">
                {user.provider}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* ── Password Section ── */}
      {(!user?.provider || user.provider === 'local') && (
        <Card variant="glass" delay={0.1}>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-themed-secondary">Sicurezza</h3>
              <p className="text-xs text-themed-muted">
                Modifica la password del tuo account
              </p>
            </div>
          </div>

          <form
            onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
            className="space-y-4"
          >
            <Input
              label="Password attuale"
              type="password"
              icon={Lock}
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword', {
                required: 'Password attuale obbligatoria',
              })}
            />
            <Input
              label="Nuova password"
              type="password"
              icon={Lock}
              hint="Minimo 8 caratteri con maiuscola, numero e carattere speciale"
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register('newPassword', {
                required: 'Nuova password obbligatoria',
                minLength: { value: 8, message: 'Minimo 8 caratteri' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
                  message: 'Deve contenere maiuscola, numero e speciale',
                },
              })}
            />
            <Input
              label="Conferma nuova password"
              type="password"
              icon={Lock}
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register('confirmPassword', {
                required: 'Conferma password obbligatoria',
              })}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                icon={Save}
                loading={passwordLoading}
              >
                Cambia Password
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── Danger Zone ── */}
      <Card variant="glass" delay={0.15} className="border-red-500/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-400">Zona Pericolosa</h3>
            <p className="text-xs text-themed-muted">Azioni irreversibili</p>
          </div>
        </div>
        <p className="text-sm text-themed-muted mb-4">
          L&apos;eliminazione dell&apos;account è permanente. Tutti i dati
          energetici verranno cancellati in modo irreversibile.
        </p>
        <Button variant="danger" size="sm">
          Elimina Account
        </Button>
      </Card>
    </div>
  );
};

export default Settings;
