import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import { LoadingScreen } from "./ui/Loading";



const ACCESS_TOKEN_KEY = "accessToken";

const extractToken = (data) =>
    data?.data?.accessToken ||
    data?.accessToken ||
    data?.data?.token ||
    data?.token ||
    null;

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, checkAuth } = useAuth();
    const location = useLocation();

    const [refreshing, setRefreshing] = useState(false);
    const triedRefreshRef = useRef(false);

    useEffect(() => {
        const trySilentRefresh = async () => {
            console.log('ProtectedRoute check:', { isAuthenticated, loading }); // DEBUG
            
            // Se siamo già autenticati o stiamo ancora caricando, non fare nulla
            if (loading || isAuthenticated) return;

            // Prova refresh UNA sola volta (evita loop)
            if (triedRefreshRef.current) return;
            triedRefreshRef.current = true;

            setRefreshing(true);
            try {
                const { data } = await api.post("/auth/refresh", null, {
                    skipAuthRefresh: true,
                });

                const token = extractToken(data);
                if (token) {
                    localStorage.setItem(ACCESS_TOKEN_KEY, token);
                    console.log('Silent refresh token saved'); // DEBUG
                    // ora ricalcola utente con /auth/me
                    await checkAuth();
                }
            } catch (err) {
                // refresh fallito => rimani non autenticato
                console.debug("Silent refresh failed (expected if no cookie):", err.message);
            } finally {
                setRefreshing(false);
            }
        };

        trySilentRefresh();
    }, [loading, isAuthenticated, checkAuth]);

    console.log('ProtectedRoute render:', { loading, refreshing, isAuthenticated });

    if (loading || refreshing) {
        return <LoadingScreen message="Verificando sessione..." />;
    }

    if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    console.log('Authenticated, rendering children');
    return children;
};

export default ProtectedRoute;
