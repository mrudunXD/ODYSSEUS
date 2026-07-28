import { format, parseISO } from 'date-fns';

/**
 * Always formats dates in DD MMM YYYY format (e.g., 25 Dec 2025)
 */
export const formatDate = (dateInput: string | Date | number | null | undefined): string => {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    if (isNaN(d.getTime())) return '-';
    return format(d, 'dd MMM yyyy');
  } catch (err) {
    return '-';
  }
};
