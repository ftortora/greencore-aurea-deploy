import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';
import { useToast } from './ToastContext';



const AdminContext = createContext(null);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};

export const AdminProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userPagination, setUserPagination] = useState({ total: 0, pages: 1 });
  const toast = useToast();

  // ── Fetch Users ──
  const fetchUsers = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const { data } = await api.get('/admin/users', { params });
        setUsers(data.users || []);
        setUserPagination({
          total: data.total || 0,
          pages: data.pages || 1,
        });
      } catch (err) {
        toast.error('Errore nel caricamento utenti');
        console.error('fetchUsers error:', err);
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // ── Fetch System Stats ──
  const fetchSystemStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setSystemStats(data);
    } catch (err) {
      console.error('fetchSystemStats error:', err);
    }
  }, []);

  // ── Update User Role ──
  const updateUserRole = useCallback(
    async (userId, role) => {
      try {
        const { data } = await api.put(`/admin/users/${userId}/role`, { role });
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: data.role } : u))
        );
        toast.success(`Ruolo aggiornato a "${role}"`);
        return { success: true };
      } catch (err) {
        const msg = err.response?.data?.message || 'Errore aggiornamento ruolo';
        toast.error(msg);
        return { success: false, message: msg };
      }
    },
    [toast]
  );

  // ── Toggle User Status (enable/disable) ──
  const toggleUserStatus = useCallback(
    async (userId, active) => {
      try {
        await api.put(`/admin/users/${userId}/status`, { active });
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, active } : u))
        );
        toast.success(active ? 'Utente riattivato' : 'Utente disattivato');
        return { success: true };
      } catch (err) {
        toast.error('Errore modifica stato utente');
        return { success: false };
      }
    },
    [toast]
  );

  // ── Delete User ──
  const deleteUser = useCallback(
    async (userId) => {
      try {
        await api.delete(`/admin/users/${userId}`);
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        toast.success('Utente eliminato');
        return { success: true };
      } catch (err) {
        toast.error("Errore nell'eliminazione utente");
        return { success: false };
      }
    },
    [toast]
  );

  return (
    <AdminContext.Provider
      value={{
        users,
        systemStats,
        loading,
        userPagination,
        fetchUsers,
        fetchSystemStats,
        updateUserRole,
        toggleUserStatus,
        deleteUser,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
