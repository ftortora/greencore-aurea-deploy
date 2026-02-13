import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { formatDate, SOURCE_LABELS } from '../utils/helpers';



const useExportCSV = () => {
  const toast = useToast();

  const exportToCSV = useCallback(
    (entries, filename = 'aurea-energy-export') => {
      try {
        if (!entries || entries.length === 0) {
          toast.warning('Nessun dato da esportare');
          return;
        }

        // CSV Headers
        const headers = [
          'Data',
          'Descrizione',
          'Fonte',
          'kWh',
          'CO₂ Emessa (kg)',
          'CO₂ Risparmiata (kg)',
          'Note',
        ];

        // CSV Rows
        const rows = entries.map((entry) => [
          formatDate(entry.date, 'yyyy-MM-dd'),
          `"${(entry.description || '').replace(/"/g, '""')}"`,
          SOURCE_LABELS[entry.source] || entry.source,
          (entry.kWh || 0).toFixed(2),
          (entry.co2Emission || 0).toFixed(3),
          (entry.co2Saved || 0).toFixed(3),
          `"${(entry.notes || '').replace(/"/g, '""')}"`,
        ]);


        const BOM = '\uFEFF';
        const csvContent =
          BOM +
          [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');


        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];

        link.href = url;
        link.download = `${filename}-${date}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();


        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);

        toast.success(`Esportati ${entries.length} record in CSV`);
      } catch (err) {
        console.error('CSV Export error:', err);
        toast.error("Errore durante l'esportazione CSV");
      }
    },
    [toast]
  );

  return { exportToCSV };
};

export default useExportCSV;
