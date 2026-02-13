import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
    useRef,
} from "react";
import api from "../utils/api";
import { useToast } from "./ToastContext";
import { calculateCO2, calculateCO2Saved } from "../utils/helpers";

const EnergyContext = createContext(null);

export const useEnergy = () => {
    const ctx = useContext(EnergyContext);
    if (!ctx) throw new Error("useEnergy must be used within EnergyProvider");
    return ctx;
};

const INITIAL_FILTERS = {
    source: "",
    dateFrom: "",
    dateTo: "",
    search: "",
    sortBy: "date",
    sortOrder: "desc",
    page: 1,
    limit: 15,
};

const buildQueryParams = (f) => {
    const params = {
        source: f.source || undefined,
        startDate: f.dateFrom || undefined,
        endDate: f.dateTo || undefined,
        search: (f.search || "").trim() || undefined,
        sortBy: f.sortBy || "date",
        sortOrder: f.sortOrder || "desc",
        page: f.page || 1,
        limit: f.limit || 15,
    };

    Object.keys(params).forEach((k) => {
        if (params[k] === undefined || params[k] === null || params[k] === "")
            delete params[k];
    });

    return params;
};


const normalizeChartData = (chart = []) => {
    const normalized = (Array.isArray(chart) ? chart : []).map((d) => {
        //  Date: supporta date, day, label, _id
        const date = d.date || d.day || d.label || d._id || "";

        //  kWh: supporta kWh, total, amount, value
        const kWh = Number(d.kWh ?? d.total ?? d.amount ?? d.value ?? 0);

        //  CO2 Emitted: supporta co2Emitted, co2, emitted
        const co2Emitted = Number(d.co2Emitted ?? d.co2 ?? d.emitted ?? 0);

        //  CO2 Avoided: supporta co2Avoided, co2Saved, avoided
        const co2Avoided = Number(d.co2Avoided ?? d.co2Saved ?? d.avoided ?? 0);

        //  Optional: cost, count
        const cost = Number(d.cost ?? 0);
        const count = Number(d.count ?? 0);

        return {
            date,
            kWh,
            co2Emitted,
            co2Avoided,
            cost,
            count,
        };
    });

    if (import.meta.env.DEV && normalized.length > 0) {
        console.log("[EnergyContext] chartData normalized:", {
            length: normalized.length,
            sample: normalized[0],
        });
    }

    return normalized;
};

/**
 * Normalizza source distribution per Pie/Bar charts
 * Garantisce: source, kWh, co2Emitted, co2Avoided, cost, count
 */
const normalizeSourceDistribution = (bySource = []) => {
    const normalized = (Array.isArray(bySource) ? bySource : []).map((s) => {
        //  Source: supporta source, name, label
        const source = s.source || s.name || s.label || "unknown";

        // kWh: supporta kWh, amount, value, total
        const kWh = Number(s.kWh ?? s.amount ?? s.value ?? s.total ?? 0);

        //  CO2 Emitted
        const co2Emitted = Number(s.co2Emitted ?? s.co2 ?? s.emitted ?? 0);

        //  CO2 Avoided
        const co2Avoided = Number(s.co2Avoided ?? s.co2Saved ?? s.avoided ?? 0);

        //  Cost e Count
        const cost = Number(s.cost ?? 0);
        const count = Number(s.count ?? 0);

        return {
            source,
            kWh,
            value: kWh,
            amount: kWh,
            co2Emitted,
            co2Avoided,
            cost,
            count,
        };
    });


    if (import.meta.env.DEV && normalized.length > 0) {
        console.log("[EnergyContext] sourceDistribution normalized:", {
            length: normalized.length,
            sample: normalized[0],
        });
    }

    return normalized;
};

const hasAccessToken = () => !!localStorage.getItem("accessToken");

export const EnergyProvider = ({ children }) => {
    const toast = useToast();

    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });

    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [sourceDistribution, setSourceDistribution] = useState([]);

    // --- refs ---
    const filtersRef = useRef(filters);
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    const debounceRef = useRef(null);
    const abortEntriesRef = useRef(null);

    // toast cooldown (stop modal loop)
    const lastErrorToastRef = useRef(0);

    // dedupe: evita chiamate identiche in parallelo
    const inFlightRef = useRef(new Map()); // key -> promise

    useEffect(() => {
        const onLogout = () => {
            if (abortEntriesRef.current) abortEntriesRef.current.abort();
            setLoading(false);
            setEntries([]);
            setPagination({ total: 0, pages: 1 });
            setStats(null);
            setChartData([]);
            setSourceDistribution([]);
        };

        window.addEventListener("auth:logout", onLogout);
        return () => window.removeEventListener("auth:logout", onLogout);
    }, []);

    const cooldownToast = useCallback(
        (msg) => {
            const now = Date.now();
            if (now - lastErrorToastRef.current > 4000) {
                toast.error(msg);
                lastErrorToastRef.current = now;
            }
        },
        [toast]
    );

    const runOncePerKey = useCallback((key, fn) => {
        if (inFlightRef.current.has(key)) return inFlightRef.current.get(key);
        const p = (async () => {
            try {
                return await fn();
            } finally {
                inFlightRef.current.delete(key);
            }
        })();
        inFlightRef.current.set(key, p);
        return p;
    }, []);

    const shouldToastForError = (err) => {
        const status = err?.response?.status;

        if (status === 401) return false;

        if (status === 429) return false;
        return true;
    };


    const fetchEntries = useCallback(
        async (customFilters) => {

            if (!hasAccessToken()) return;

            if (abortEntriesRef.current) abortEntriesRef.current.abort();
            const controller = new AbortController();
            abortEntriesRef.current = controller;

            setLoading(true);

            const merged = { ...filtersRef.current, ...customFilters };
            const params = buildQueryParams(merged);
            const key = `entries:${JSON.stringify(params)}`;

            try {
                const res = await runOncePerKey(key, async () => {
                    const { data } = await api.get("/energy", {
                        params,
                        signal: controller.signal,
                    });
                    return data;
                });

                const items = res?.data?.items || res?.entries || res?.data || [];
                const pag = res?.data?.pagination || {};

                setEntries(Array.isArray(items) ? items.filter(Boolean) : []);
                setPagination({
                    total: pag.total || (Array.isArray(items) ? items.length : 0) || 0,
                    pages: pag.pages || 1,
                });
            } catch (err) {
                if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;

                if (shouldToastForError(err)) {
                    cooldownToast("Errore nel caricamento dei dati energetici");
                }
                console.error("fetchEntries error:", err);
            } finally {
                setLoading(false);
            }
        },
        [cooldownToast, runOncePerKey]
    );

    useEffect(() => {

        if (!hasAccessToken()) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchEntries();
        }, 350);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [filters, fetchEntries]);


    const fetchStats = useCallback(
        async (period = "30d") => {
            if (!hasAccessToken()) return;

            const key = `stats:${period}`;
            try {
                const res = await runOncePerKey(key, async () => {
                    const { data } = await api.get("/energy/stats", {
                        params: { period },
                    });
                    return data;
                });

                //  Supporta shape multiple: res.data, res.data.data, res
                const d = res?.data?.data || res?.data || res || {};
                const totals = d.totals || d;
                const bySrc = d.bySource || d.sources || [];

                //  Normalizza bySource
                const normalizedBySource = normalizeSourceDistribution(bySrc);

                setStats({
                    totalKWh: totals?.totalAmount || totals?.totalKWh || 0,
                    totalCO2: totals?.totalCo2Emitted || totals?.totalCO2 || 0,
                    totalCO2Saved: totals?.totalCo2Avoided || totals?.totalCO2Saved || 0,
                    totalEntries: totals?.count || totals?.totalEntries || 0,
                    avgDailyKWh: totals?.avgAmount || totals?.avgDailyKWh || 0,
                    renewablePercentage: totals?.renewablePercentage || 0,
                    totalCost: totals?.totalCost || 0,
                    bySource: normalizedBySource, //  Array normalizzato
                    trend: Array.isArray(d.trend) ? d.trend : [],
                    monthlyChange: totals?.monthlyChange || d.monthlyChange,
                });


                setSourceDistribution(normalizedBySource);


                if (import.meta.env.DEV) {
                    console.log("[EnergyContext] fetchStats result:", {
                        period,
                        totalKWh: totals?.totalAmount || 0,
                        bySourceCount: normalizedBySource.length,
                    });
                }
            } catch (err) {
                // niente toast qui (evita loop), log soltanto
                console.error("fetchStats error:", err);
            }
        },
        [runOncePerKey]
    );


    const fetchChartData = useCallback(
        async (period = "30d") => {
            if (!hasAccessToken()) return;

            const key = `chart:${period}`;
            try {
                const res = await runOncePerKey(key, async () => {
                    const { data } = await api.get("/energy/chart", {
                        params: { period },
                    });
                    return data;
                });

                const rawChart =
                    res?.chart ||
                    res?.data?.chart ||
                    res?.data ||
                    (Array.isArray(res) ? res : []);

                const normalized = normalizeChartData(rawChart);

                setChartData(normalized);

                if (import.meta.env.DEV) {
                    console.log("[EnergyContext] fetchChartData result:", {
                        period,
                        length: normalized.length,
                        sample: normalized[0],
                    });
                }
            } catch (err) {
                console.error("fetchChartData error:", err);

                setChartData([]);
            }
        },
        [runOncePerKey]
    );

    const createEntry = useCallback(
        async (entryData) => {
            try {
                const amount = entryData.amount ?? entryData.kWh ?? 0;
                const co2 = calculateCO2(amount, entryData.source);
                const co2Saved = calculateCO2Saved(amount, entryData.source);

                const { data: res } = await api.post("/energy", {
                    ...entryData,
                    amount,
                    co2Emission: co2,
                    co2Saved,
                });

                const newEntry = res?.data || res?.entry || res;
                if (newEntry && newEntry._id) setEntries((prev) => [newEntry, ...prev]);

                toast.success(res?.message || "Dato energetico registrato!");
                return { success: true, entry: newEntry };
            } catch (err) {
                const msg = err.response?.data?.message || "Errore nella creazione";
                toast.error(msg);
                return { success: false, message: msg };
            }
        },
        [toast]
    );

    const updateEntry = useCallback(
        async (id, entryData) => {
            try {
                const amount = entryData.amount ?? entryData.kWh ?? 0;
                const co2 = calculateCO2(amount, entryData.source);
                const co2Saved = calculateCO2Saved(amount, entryData.source);

                const { data: res } = await api.put(`/energy/${id}`, {
                    ...entryData,
                    amount,
                    co2Emission: co2,
                    co2Saved,
                });

                const updated = res?.data || res?.entry || res;
                if (updated && updated._id) {
                    setEntries((prev) => prev.map((e) => (e._id === id ? updated : e)));
                }

                toast.success(res?.message || "Dato aggiornato!");
                return { success: true, entry: updated };
            } catch (err) {
                const msg = err.response?.data?.message || "Errore nell'aggiornamento";
                toast.error(msg);
                return { success: false, message: msg };
            }
        },
        [toast]
    );

    const deleteEntry = useCallback(
        async (id) => {
            try {
                await api.delete(`/energy/${id}`);
                setEntries((prev) => prev.filter((e) => e?._id !== id));
                toast.success("Dato eliminato");
                return { success: true };
            } catch {
                toast.error("Errore nell'eliminazione");
                return { success: false };
            }
        },
        [toast]
    );

    const updateFilters = useCallback((newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    }, []);

    const resetFilters = useCallback(() => setFilters(INITIAL_FILTERS), []);
    const setPage = useCallback((page) => setFilters((prev) => ({ ...prev, page })), []);

    const computedStats = useMemo(() => stats || null, [stats]);

    return (
        <EnergyContext.Provider
            value={{
                entries,
                loading,
                filters,
                pagination,
                stats: computedStats,
                chartData,
                sourceDistribution,
                fetchEntries,
                fetchStats,
                fetchChartData,
                createEntry,
                updateEntry,
                deleteEntry,
                updateFilters,
                resetFilters,
                setPage,
            }}
        >
            {children}
        </EnergyContext.Provider>
    );
};

export default EnergyContext;
