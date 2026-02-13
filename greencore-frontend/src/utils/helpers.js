

import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';


export const formatNumber = (num, decimals = 1) => {
  if (num === null || num === undefined) return '—';
  if (num >= 1000000) return `${(num / 1000000).toFixed(decimals)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(decimals)}K`;
  return num.toFixed(decimals);
};

export const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

// ── Date Formatting ──
export const formatDate = (date, pattern = 'dd MMM yyyy') => {
  if (!date) return '—';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return format(parsed, pattern, { locale: it });
};

export const formatRelativeDate = (date) => {
  if (!date) return '—';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(parsed, { addSuffix: true, locale: it });
};

// ── Energy Helpers ──
export const SOURCE_COLORS = {
  solare: '#f59e0b',
  eolico: '#3b82f6',
  idroelettrico: '#06b6d4',
  biomassa: '#84cc16',
  geotermico: '#ef4444',
  rete: '#8b5cf6',
  altro: '#64748b',
};

export const SOURCE_LABELS = {
  solare: 'Solare',
  eolico: 'Eolico',
  idroelettrico: 'Idroelettrico',
  biomassa: 'Biomassa',
  geotermico: 'Geotermico',
  rete: 'Rete Elettrica',
  altro: 'Altro',
};

export const CO2_FACTORS = {
  solare: 0.02,
  eolico: 0.01,
  idroelettrico: 0.004,
  biomassa: 0.23,
  geotermico: 0.038,
  rete: 0.475,
  altro: 0.5,
};

export const calculateCO2 = (kWh, source) => {
  const factor = CO2_FACTORS[source] || CO2_FACTORS.rete;
  return kWh * factor;
};

export const calculateCO2Saved = (kWh, source) => {
  if (source === 'rete' || source === 'altro') return 0;
  return kWh * (CO2_FACTORS.rete - (CO2_FACTORS[source] || 0));
};

// ── Validation ──
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Per email e password, NON rimuovere caratteri validi
  // Solo rimuovi script injection pericolosi
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ── Class Name Helper ──
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
