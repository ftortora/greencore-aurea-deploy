import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  Search,
  MoreVertical,
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { TableRowSkeleton } from '../ui/Loading';
import { cn, formatDate, formatRelativeDate } from '../../utils/helpers';



const ROLES = [
  { value: 'user', label: 'User', color: 'gray' },
  { value: 'editor', label: 'Editor', color: 'blue' },
  { value: 'admin', label: 'Admin', color: 'amber' },
  { value: 'superadmin', label: 'Super Admin', color: 'red' },
];

const RoleBadge = ({ role }) => {
  const config = ROLES.find((r) => r.value === role) || ROLES[0];
  return (
    <Badge color={config.color} size="sm" dot>
      {config.label}
    </Badge>
  );
};

const UserTable = ({
  users = [],
  loading = false,
  pagination = { total: 0, pages: 1 },
  currentPage = 1,
  onPageChange,
  onRoleChange,
  onToggleStatus,
  onDelete,
  onSearch,
  searchQuery = '',
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        icon={Search}
        placeholder="Cerca utenti per nome o email..."
        value={searchQuery}
        onChange={(e) => onSearch?.(e.target.value)}
      />

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/40">
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Utente
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Ruolo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Registrato
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/20">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={6} />
                ))
              ) : users.length > 0 ? (
                users.map((user, i) => (
                  <motion.tr
                    key={user._id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-dark-800/20 transition-colors group"
                  >
                    {/* User Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurea-500 to-aurea-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dark-200">
                            {user.name || 'N/A'}
                          </p>
                          <p className="text-[11px] text-dark-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => onRoleChange?.(user._id, e.target.value)}
                        className="text-xs bg-dark-800/50 border border-dark-700/50 rounded-lg px-2 py-1 text-dark-200 focus:outline-none focus:border-aurea-500/50 cursor-pointer"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Provider */}
                    <td className="px-4 py-3">
                      <Badge color={user.provider === 'local' ? 'gray' : 'blue'} size="xs">
                        {user.provider || 'local'}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onToggleStatus?.(user._id, !user.active)}
                        className="flex items-center gap-1.5 group/status"
                      >
                        {user.active !== false ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-aurea-400" />
                            <span className="text-xs text-aurea-400">Attivo</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-dark-600" />
                            <span className="text-xs text-dark-500">Disattivo</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-dark-400">
                        {formatDate(user.createdAt, 'dd MMM yyyy')}
                      </p>
                      <p className="text-[10px] text-dark-600">
                        {formatRelativeDate(user.createdAt)}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          window.confirm(`Eliminare l'utente ${user.name}?`) &&
                          onDelete?.(user._id)
                        }
                        className="!p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-dark-500 hover:text-red-400" />
                      </Button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-dark-500">
                    Nessun utente trovato
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-dark-500">
            Pagina {currentPage} di {pagination.pages} ({pagination.total} utenti)
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" icon={ChevronLeft} disabled={currentPage <= 1} onClick={() => onPageChange?.(currentPage - 1)} />
            <Button variant="ghost" size="sm" icon={ChevronRight} disabled={currentPage >= pagination.pages} onClick={() => onPageChange?.(currentPage + 1)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
