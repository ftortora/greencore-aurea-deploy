import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../utils/helpers';


const typeConfig = {
    success: {
        icon: CheckCircle2,
        bg: 'bg-aurea-500/10 border-aurea-500/30',
        iconColor: 'text-aurea-400',
        text: 'text-aurea-200',
    },
    error: {
        icon: XCircle,
        bg: 'bg-red-500/10 border-red-500/30',
        iconColor: 'text-red-400',
        text: 'text-red-200',
    },
    warning: {
        icon: AlertTriangle,
        bg: 'bg-amber-500/10 border-amber-500/30',
        iconColor: 'text-amber-400',
        text: 'text-amber-200',
    },
    info: {
        icon: Info,
        bg: 'bg-blue-500/10 border-blue-500/30',
        iconColor: 'text-blue-400',
        text: 'text-blue-200',
    },
};

// ✅ forwardRef così Framer Motion può passare un ref al DOM node
const ToastItem = React.forwardRef(({ toast, onRemove, ...rest }, ref) => {
    const config = typeConfig[toast.type] || typeConfig.info;
    const IconComp = config.icon;

    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg min-w-[280px] max-w-[420px]',
                config.bg
            )}
            {...rest}
        >
            <IconComp className={cn('w-5 h-5 shrink-0', config.iconColor)} />
            <p className={cn('text-sm font-medium flex-1', config.text)}>{toast.message}</p>

            <button
                onClick={() => onRemove(toast.id)}
                className="text-dark-400 hover:text-dark-200 transition-colors shrink-0"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
});
ToastItem.displayName = 'ToastItem';

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
