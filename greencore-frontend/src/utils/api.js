import axios from "axios";



const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:10000/api",
    withCredentials: true, // Required for httpOnly cookies
});

// ---- Token Storage (access token in localStorage) ----
const ACCESS_TOKEN_KEY = "accessToken";
const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
const setAccessToken = (t) => localStorage.setItem(ACCESS_TOKEN_KEY, t);
const clearAuth = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
};

// ---- Request interceptor: attach Authorization ----
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ---- Refresh lock + queue ----
let isRefreshing = false;
let queued = [];

function queueRequest(cb) {
    return new Promise((resolve, reject) => {
        queued.push({ cb, resolve, reject });
    });
}

function flushQueue(error, token) {
    queued.forEach(({ cb, resolve, reject }) => {
        if (error) reject(error);
        else resolve(cb(token));
    });
    queued = [];
}

// ---- Refresh call WITHOUT interceptor recursion ----
async function doRefresh() {
    const plain = axios.create({
        baseURL: api.defaults.baseURL,
        withCredentials: true,
    });

    const res = await plain.post("/auth/refresh");

    const newToken =
        res?.data?.data?.accessToken ||
        res?.data?.accessToken ||
        res?.data?.token;

    if (!newToken) throw new Error("Refresh OK ma accessToken mancante");

    setAccessToken(newToken);
    return newToken;
}

// ---- Response interceptor: handle 401 + refresh ----
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;


        if (!error.response) return Promise.reject(error);

        const status = error.response.status;


        const skipAuthRefresh = original?.skipAuthRefresh === true;


        const isRefreshCall = original?.url?.includes("/auth/refresh") || skipAuthRefresh;
        if (isRefreshCall) return Promise.reject(error);


        if (status !== 401) return Promise.reject(error);


        if (original._retry) {
            clearAuth();
            window.dispatchEvent(new CustomEvent("auth:logout"));
            return Promise.reject(error);
        }
        original._retry = true;


        if (isRefreshing) {
            return queueRequest((token) => {
                original.headers.Authorization = `Bearer ${token}`;
                return api(original);
            });
        }


        isRefreshing = true;

        try {
            const newToken = await doRefresh();
            isRefreshing = false;

            flushQueue(null, newToken);


            original.headers.Authorization = `Bearer ${newToken}`;
            return api(original);
        } catch (refreshErr) {
            isRefreshing = false;

            flushQueue(refreshErr, null);


            clearAuth();
            window.dispatchEvent(new CustomEvent("auth:logout"));

            return Promise.reject(refreshErr);
        }
    }
);

export default api;
