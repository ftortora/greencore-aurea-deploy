import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Save, X } from 'lucide-react';
import { SOURCE_LABELS, sanitizeInput } from '../../utils/helpers';

const sourceOptions = Object.entries(SOURCE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const EnergyModal = ({ isOpen, onClose, entry = null, onSave, loading = false }) => {
  const isEdit = !!entry;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      description: '',
      source: 'rete',
      kWh: '',
      cost: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  useEffect(() => {
    if (entry) {
      reset({
        description: entry.description || '',
        source: entry.source || 'rete',
        kWh: entry.amount || entry.kWh || '',
        cost: entry.cost || '',
        date: entry.date
          ? new Date(entry.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        notes: entry.notes || '',
      });
    } else {
      reset({
        description: '',
        source: 'rete',
        kWh: '',
        cost: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [entry, reset]);

  const onSubmit = (data) => {
    const sanitized = {
      description: sanitizeInput(data.description),
      source: data.source,
      amount: parseFloat(data.kWh),
      cost: data.cost ? parseFloat(data.cost) : 0,
      date: data.date,
      notes: sanitizeInput(data.notes),
    };
    onSave?.(sanitized);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Modifica Registrazione' : 'Nuova Registrazione'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} icon={X}>
            Annulla
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            loading={loading}
            icon={Save}
          >
            {isEdit ? 'Aggiorna' : 'Salva'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Descrizione"
          placeholder="Es. Consumo mensile, Pannello solare..."
          error={errors.description?.message}
          {...register('description', {
            required: 'Descrizione obbligatoria',
            maxLength: { value: 200, message: 'Max 200 caratteri' },
          })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Fonte energetica"
            options={sourceOptions}
            error={errors.source?.message}
            {...register('source', {
              required: 'Seleziona una fonte',
            })}
          />
          <Input
            label="Consumo (kWh)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.kWh?.message}
            {...register('kWh', {
              required: 'Valore kWh obbligatorio',
              min: { value: 0.01, message: 'Minimo 0.01 kWh' },
              max: { value: 999999, message: 'Valore troppo alto' },
            })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Costo (€)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.cost?.message}
            {...register('cost', {
              min: { value: 0, message: 'Minimo 0' },
              max: { value: 999999, message: 'Valore troppo alto' },
            })}
          />
          <Input
            label="Data"
            type="date"
            error={errors.date?.message}
            {...register('date', {
              required: 'Data obbligatoria',
            })}
          />
        </div>

        <Input
          label="Note (opzionale)"
          placeholder="Note aggiuntive..."
          error={errors.notes?.message}
          {...register('notes', {
            maxLength: { value: 500, message: 'Max 500 caratteri' },
          })}
        />
      </form>
    </Modal>
  );
};

export default EnergyModal;
