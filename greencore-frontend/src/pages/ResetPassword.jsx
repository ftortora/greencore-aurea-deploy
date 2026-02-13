import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';



const ResetPassword = () => {
    const { resetPassword } = useAuth();
    const { token } = useParams();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const password = watch('password');

    const onSubmit = async (data) => {
        if (!token) return;
        setLoading(true);
        await resetPassword(token, data.password);
        setLoading(false);
    };

    if (!token) {
        return (
            <div className="text-center space-y-4 py-4">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-red-400" />
                </div>
                <div>
                    <h3 className="text-lg font-display font-bold text-dark-100">
                        Link non valido
                    </h3>
                    <p className="text-sm text-dark-400 mt-2">
                        Il link di recupero è scaduto o non è valido. Richiedi un nuovo link.
                    </p>
                </div>
                <Link to="/forgot-password">
                    <Button variant="primary">Richiedi nuovo link</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-display font-bold text-dark-100">
                    Nuova Password
                </h2>
                <p className="text-sm text-dark-500 mt-1">
                    Inserisci la tua nuova password
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Nuova password"
                    type="password"
                    icon={Lock}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    hint="Minimo 8 caratteri con maiuscola, numero e carattere speciale"
                    error={errors.password?.message}
                    {...register('password', {
                        required: 'Password obbligatoria',
                        minLength: { value: 8, message: 'Minimo 8 caratteri' },
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
                            message: 'Deve contenere maiuscola, numero e carattere speciale',
                        },
                    })}
                />

                <Input
                    label="Conferma password"
                    type="password"
                    icon={Lock}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword', {
                        required: 'Conferma obbligatoria',
                        validate: (val) => val === password || 'Le password non coincidono',
                    })}
                />

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    icon={Save}
                    loading={loading}
                >
                    Reimposta Password
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

export default ResetPassword;
