import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Unsubscribe = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const run = async () => {
            try {
                const { data } = await api.get(`/newsletter/unsubscribe/${token}`);
                setStatus('ok');
                setMessage(data?.message || 'Disiscrizione completata.');
            } catch (err) {
                setStatus('error');
                setMessage(err?.response?.data?.message || 'Token non valido o scaduto.');
            }
        };
        if (token) run();
    }, [token]);

    return (
        <div className="max-w-lg mx-auto py-10">
            <Card variant="glass" padding="lg">
                <h1 className="text-xl font-display font-bold text-themed mb-2">
                    Newsletter
                </h1>

                {status === 'loading' && (
                    <p className="text-sm text-themed-muted">Sto elaborando...</p>
                )}

                {status !== 'loading' && (
                    <p className="text-sm text-themed-muted">{message}</p>
                )}

                <div className="mt-6 flex gap-3">
                    <Link to="/login">
                        <Button variant="primary">Vai al login</Button>
                    </Link>
                    <Link to="/dashboard">
                        <Button variant="outline">Dashboard</Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default Unsubscribe;
