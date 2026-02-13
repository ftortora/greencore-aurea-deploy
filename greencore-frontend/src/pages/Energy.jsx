import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Zap, Download } from 'lucide-react';
import { useEnergy } from '../contexts/EnergyContext';
import EnergyFilters from '../components/energy/EnergyFilters';
import EnergyTable from '../components/energy/EnergyTable';
import EnergyModal from '../components/energy/EnergyModal';
import Button from '../components/ui/Button';
import useExportCSV from '../hooks/useExportCSV';



const Energy = () => {
    const {
        entries,
        loading,
        filters,
        pagination,
        fetchEntries,
        createEntry,
        updateEntry,
        deleteEntry,
        updateFilters,
        resetFilters,
        setPage,
    } = useEnergy();

    const { exportToCSV } = useExportCSV();
    const [modalOpen, setModalOpen] = useState(false);
    const [editEntry, setEditEntry] = useState(null);
    const [saving, setSaving] = useState(false);


    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const handleEdit = useCallback((entry) => {
        setEditEntry(entry);
        setModalOpen(true);
    }, []);

    const handleDelete = useCallback(
        async (id) => {
            if (window.confirm('Sei sicuro di voler eliminare questa registrazione?')) {
                await deleteEntry(id);
            }
        },
        [deleteEntry]
    );

    const handleSave = useCallback(
        async (data) => {
            setSaving(true);
            try {
                if (editEntry) {
                    await updateEntry(editEntry._id, data);
                } else {
                    await createEntry(data);
                }
                setModalOpen(false);
                setEditEntry(null);
            } finally {
                setSaving(false);
            }
        },
        [editEntry, createEntry, updateEntry]
    );

    const handleSort = useCallback(
        (sortBy, sortOrder) => {
            updateFilters({ sortBy, sortOrder });
        },
        [updateFilters]
    );

    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
        setEditEntry(null);
    }, []);

    const handleExport = useCallback(() => {
        exportToCSV(entries);
    }, [entries, exportToCSV]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
                <div className="space-y-1">
                    <h1 className="text-2xl font-display font-bold text-dark-50 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-aurea-400" />
                        Gestione Energia
                    </h1>
                    <p className="text-sm text-dark-500">Registra e gestisci i tuoi dati di consumo energetico</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="secondary" icon={Download} onClick={handleExport} disabled={entries.length === 0}>
                        <span className="hidden sm:inline">Esporta CSV</span>
                        <span className="sm:hidden">CSV</span>
                    </Button>

                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => {
                            setEditEntry(null);
                            setModalOpen(true);
                        }}
                    >
                        <span className="hidden sm:inline">Nuova Registrazione</span>
                        <span className="sm:hidden">Nuovo</span>
                    </Button>
                </div>
            </motion.div>

            {/* Filters */}
            <EnergyFilters
                filters={filters}
                onFilterChange={updateFilters}
                onReset={resetFilters}
                totalResults={pagination.total}
            />

            {/* Table */}
            <EnergyTable
                entries={entries}
                loading={loading}
                pagination={pagination}
                currentPage={filters.page}
                onPageChange={setPage}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSort={handleSort}
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
            />

            {/* Modal */}
            <EnergyModal isOpen={modalOpen} onClose={handleCloseModal} entry={editEntry} onSave={handleSave} loading={saving} />
        </div>
    );
};

export default Energy;
