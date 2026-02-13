import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useToast } from "./ToastContext";


const AuthContext = createContext(null);

// ── OAuth Config ──
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

const ACCESS_TOKEN_KEY = "accessToken";

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};

// ── Token helpers ──
const getToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

const setToken = (t) => {
    if (t) {
        localStorage.setItem(ACCESS_TOKEN_KEY, t);
        console.log("✅ Token saved to localStorage");
    }
};

const clearToken = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    console.log("🗑️ Token cleared from localStorage");
};

// ── Extract helpers ──
const extractUser = (data) => {
    if (data?.user) return data.user;
    if (data?.data?.user) return data.data.user;
    if (data?.data && data.data._id) return data.data;
    if (data?._id || data?.id) return data;
    return null;
};

const extractToken = (data) =>
    data?.data?.accessToken ||
    data?.accessToken ||
    data?.data?.token ||
    data?.token ||
    null;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const toast = useToast();

    // Refs per evitare chiamate duplicate
    const checkAuthCalled = useRef(false);
    const lastToast = useRef(0);

    const toastOnce = useCallback(
        (type, msg, cooldown = 3000) => {
            const now = Date.now();
            if (now - lastToast.current < cooldown) return;
            lastToast.current = now;
            toast?.[type]?.(msg);
        },
        [toast]
    );

    // ══════════════════════════════════════════════════
    // CHECK AUTH
    // ══════════════════════════════════════════════════
    const checkAuth = useCallback(async () => {
        const token = getToken();
        console.log("🔍 checkAuth called, token present:", !!token);

        if (!token) {
            console.log("❌ No token, user not authenticated");
            setUser(null);
            setLoading(false);
            return false;
        }

        if (checkAuthCalled.current) {
            console.log("⏭️ checkAuth already in progress, skipping");
            return;
        }

        checkAuthCalled.current = true;

        try {
            console.log("📡 Fetching user data from /auth/me");
            const { data } = await api.get("/auth/me");

            const userData = extractUser(data);
            console.log("✅ User data received:", userData);

            if (userData) {
                setUser(userData);
                setLoading(false);
                return true;
            } else {
                console.warn("⚠️ No user in response");
                clearToken();
                setUser(null);
                setLoading(false);
                return false;
            }
        } catch (err) {
            console.error("❌ checkAuth error:", err.message);
            const status = err?.response?.status;

            if (status === 401) {
                console.log("🔓 401 - Clearing auth");
                clearToken();
                setUser(null);
            }

            setLoading(false);
            return false;
        } finally {
            checkAuthCalled.current = false;
        }
    }, []);

    // MOUNT: Check auth on load
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Forced logout listener
    useEffect(() => {
        const handleForceLogout = () => {
            console.log("🚪 Forced logout event received");
            clearToken();
            setUser(null);
            navigate("/login", { replace: true });
        };

        window.addEventListener("auth:logout", handleForceLogout);
        return () => window.removeEventListener("auth:logout", handleForceLogout);
    }, [navigate]);


    const register = useCallback(
        async (userData) => {
            try {
                console.log("📝 Register attempt:", {
                    username: userData.username,
                    email: userData.email,
                });

                const { data } = await api.post("/auth/register", userData);
                console.log("📥 Register response:", data);

                const token = extractToken(data);
                if (!token) throw new Error("No token in register response");
                setToken(token);

                const newUser = extractUser(data);
                if (!newUser) throw new Error("No user data in response");

                console.log("✅ Register successful, user:", newUser);

                setUser(newUser);
                await new Promise((resolve) => setTimeout(resolve, 150));

                toastOnce("success", "Account creato con successo!");
                console.log("🚀 Navigating to dashboard");
                navigate("/dashboard", { replace: true });

                return { success: true };
            } catch (err) {
                console.error("❌ Register error:", err);
                console.error("Response:", err.response?.data);

                const message =
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    err.message ||
                    "Errore durante la registrazione";

                toastOnce("error", message);
                return { success: false, message };
            }
        },
        [navigate, toastOnce]
    );

    const login = useCallback(
        async (credentials) => {
            try {
                //  accetta { email,password } o { username,password } o { login,password }
                const payload = {
                    login: (credentials?.login ?? credentials?.email ?? credentials?.username ?? "").trim(),
                    password: credentials?.password ?? "",
                };

                console.log("🔐 Login attempt payload:", { hasLogin: !!payload.login });

                // guard: evita 400 inutili
                if (!payload.login || !payload.password) {
                    const msg = "Email/username e password sono obbligatori.";
                    toastOnce("error", msg);
                    return { success: false, message: msg };
                }

                const { data } = await api.post("/auth/login", payload);
                console.log("📥 Login response:", data);

                const token = extractToken(data);
                if (!token) throw new Error("No token in login response");
                setToken(token);

                const userData = extractUser(data);
                if (!userData) throw new Error("No user data in response");

                console.log("✅ Login successful, user:", userData);

                setUser(userData);
                await new Promise((resolve) => setTimeout(resolve, 150));

                toastOnce("success", `Bentornato, ${userData?.username || userData?.name || "utente"}!`);

                console.log("🚀 Navigating to dashboard");
                navigate("/dashboard", { replace: true });

                return { success: true };
            } catch (err) {
                console.error("❌ Login error:", err);
                console.error("Response:", err.response?.data);

                const message =
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    err.message ||
                    "Credenziali non valide";

                toastOnce("error", message);
                return { success: false, message };
            }
        },
        [navigate, toastOnce]
    );

    const oauthLogin = useCallback(
        (provider) => {
            const redirectUri = `${FRONTEND_URL}/auth/${provider}/callback`;

            if (provider === "google") {
                if (!GOOGLE_CLIENT_ID) {
                    toastOnce("error", "Google OAuth non configurato");
                    return;
                }
                const params = new URLSearchParams({
                    client_id: GOOGLE_CLIENT_ID,
                    redirect_uri: redirectUri,
                    response_type: "code",
                    scope: "openid email profile",
                    access_type: "offline",
                    prompt: "consent",
                });
                window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
                return;
            }

            if (provider === "github") {
                if (!GITHUB_CLIENT_ID) {
                    toastOnce("error", "GitHub OAuth non configurato");
                    return;
                }
                const params = new URLSearchParams({
                    client_id: GITHUB_CLIENT_ID,
                    redirect_uri: redirectUri,
                    scope: "user:email",
                });
                window.location.href = `https://github.com/login/oauth/authorize?${params}`;
                return;
            }

            toastOnce("error", `Provider "${provider}" non supportato`);
        },
        [toastOnce]
    );


    const handleOAuthCallback = useCallback(
        async (provider, code) => {
            try {
                console.log("🔗 OAuth callback:", { provider, code: !!code });

                if (!code) throw new Error("Nessun codice di autorizzazione");
                if (!provider) throw new Error("Provider non specificato");

                const redirectUri = `${FRONTEND_URL}/auth/${provider}/callback`;

                const { data } = await api.post(`/auth/${provider}`, {
                    code,
                    redirect_uri: redirectUri,
                });

                console.log("📥 OAuth FULL response:", JSON.stringify(data, null, 2));

                // token extraction (aggressive)
                let token = null;
                if (data?.data?.accessToken) token = data.data.accessToken;
                else if (data?.accessToken) token = data.accessToken;
                else if (data?.data?.token) token = data.data.token;
                else if (data?.token) token = data.token;
                else if (data?.data?.data?.accessToken) token = data.data.data.accessToken;

                if (!token) {
                    console.error("❌ Token NOT found in response!");
                    console.error("Available keys in data:", Object.keys(data));
                    console.error("Available keys in data.data:", data.data ? Object.keys(data.data) : "N/A");
                    throw new Error("No token in OAuth response - check backend format");
                }

                setToken(token);

                // user extraction (aggressive)
                let userData = null;
                if (data?.data?.user) userData = data.data.user;
                else if (data?.user) userData = data.user;
                else if (data?.data?.data?.user) userData = data.data.data.user;
                else if (data?.data && data.data._id) userData = data.data;

                if (!userData) {
                    console.error("❌ User NOT found in response!");
                    console.error("Available keys:", Object.keys(data));
                    throw new Error("No user data in response");
                }

                setUser(userData);
                await new Promise((resolve) => setTimeout(resolve, 150));

                toastOnce("success", `Benvenuto, ${userData.username || userData.name || "utente"}!`);
                navigate("/dashboard", { replace: true });

                return { success: true };
            } catch (err) {
                console.error("❌ OAuth error:", err);
                console.error("Error details:", err.response?.data);

                const message = err.response?.data?.message || err.message || "Errore OAuth";
                clearToken();
                setUser(null);
                toastOnce("error", message);
                navigate("/login", { replace: true });
                return { success: false };
            }
        },
        [navigate, toastOnce]
    );


    const logout = useCallback(async () => {
        console.log("🚪 Logout");
        try {
            await api.post("/auth/logout");
        } catch {
            // ignore errors
        } finally {
            clearToken();
            setUser(null);
            toastOnce("info", "Logout effettuato");
            navigate("/login", { replace: true });
        }
    }, [navigate, toastOnce]);


    const forgotPassword = useCallback(
        async (email) => {
            try {
                await api.post("/auth/forgot-password", { email });
                toastOnce("success", "Email di recupero inviata!");
                return { success: true };
            } catch (err) {
                toastOnce("error", err.response?.data?.message || "Errore");
                return { success: false };
            }
        },
        [toastOnce]
    );

    const resetPassword = useCallback(
        async (token, password) => {
            try {
                console.log("🔐 resetPassword called:", { hasToken: !!token, hasPassword: !!password });

                if (!token || !password) {
                    const msg = "Token e nuova password obbligatori.";
                    toastOnce("error", msg);
                    return { success: false, message: msg };
                }

                await api.post(`/auth/reset-password/${encodeURIComponent(token)}`, { password });

                toastOnce("success", "Password aggiornata!");
                navigate("/login", { replace: true });
                return { success: true };
            } catch (err) {
                console.error("❌ resetPassword error:", err);
                toastOnce("error", err.response?.data?.message || "Token non valido");
                return { success: false };
            }
        },
        [navigate, toastOnce]
    );

    const updateProfile = useCallback(
        async (profileData) => {
            try {
                const { data } = await api.put("/users/profile", profileData);
                setUser(extractUser(data));
                toastOnce("success", "Profilo aggiornato!");
                return { success: true };
            } catch (err) {
                toastOnce("error", err.response?.data?.message || "Errore aggiornamento");
                return { success: false };
            }
        },
        [toastOnce]
    );

    const changePassword = useCallback(
        async (passwords) => {
            try {
                await api.put("/users/change-password", passwords);
                toastOnce("success", "Password cambiata!");
                return { success: true };
            } catch (err) {
                toastOnce("error", err.response?.data?.message || "Errore");
                return { success: false };
            }
        },
        [toastOnce]
    );


    const isAuthenticated = !!user && !!getToken();
    const displayName = user?.username || user?.name || user?.email?.split("@")[0] || "Utente";

    console.log("🔄 AuthContext state:", {
        user: !!user,
        token: !!getToken(),
        isAuthenticated,
        loading,
    });

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                displayName,
                register,
                login,
                logout,
                oauthLogin,
                handleOAuthCallback,
                forgotPassword,
                resetPassword,
                updateProfile,
                changePassword,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;