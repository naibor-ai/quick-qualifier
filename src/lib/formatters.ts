/**
 * Locale-aware formatting utilities for currency, numbers, and percentages.
 *
 * Uses Intl.NumberFormat for proper locale-specific formatting.
 */

export type SupportedLocale = 'en' | 'es';

/**
 * Format a number as currency for the given locale.
 * @param value - The numeric value to format
 * @param locale - The locale to use for formatting (default: 'en')
 * @param options - Additional formatting options
 */
export function formatCurrency(
  value: number,
  locale: SupportedLocale = 'en',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const localeMap: Record<SupportedLocale, string> = {
    en: 'en-US',
    es: 'es-US', // Spanish (US) for US dollar formatting with Spanish number conventions
  };

  return new Intl.NumberFormat(localeMap[locale], {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(value);
}

/**
 * Format a number as currency with cents (2 decimal places).
 */
export function formatCurrencyWithCents(
  value: number,
  locale: SupportedLocale = 'en'
): string {
  return formatCurrency(value, locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format a number with locale-specific thousand separators.
 */
export function formatNumber(
  value: number,
  locale: SupportedLocale = 'en',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const localeMap: Record<SupportedLocale, string> = {
    en: 'en-US',
    es: 'es-US',
  };

  return new Intl.NumberFormat(localeMap[locale], {
    style: 'decimal',
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(value);
}

/**
 * Format a number as a percentage.
 * @param value - The numeric value (e.g., 0.05 for 5%, or 5 for 5% if asDecimal is false)
 * @param locale - The locale to use for formatting
 * @param asDecimal - Whether the value is already in decimal form (default: false, meaning value is already in percent form)
 */
export function formatPercent(
  value: number,
  locale: SupportedLocale = 'en',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    asDecimal?: boolean;
  }
): string {
  const localeMap: Record<SupportedLocale, string> = {
    en: 'en-US',
    es: 'es-US',
  };

  // If value is not in decimal form, convert it (e.g., 5.5 -> 0.055)
  const decimalValue = options?.asDecimal ? value : value / 100;

  return new Intl.NumberFormat(localeMap[locale], {
    style: 'percent',
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 3,
  }).format(decimalValue);
}

/**
 * Format a number as a simple percentage string (e.g., "5.5%").
 * Unlike formatPercent, this doesn't use Intl.NumberFormat's percent style
 * which multiplies by 100 - this just appends the % symbol.
 */
export function formatPercentSimple(
  value: number,
  locale: SupportedLocale = 'en',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const formattedNumber = formatNumber(value, locale, {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 3,
  });

  return `${formattedNumber}%`;
}

/**
 * Format a date for the given locale.
 */
export function formatDate(
  date: Date | string,
  locale: SupportedLocale = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  const localeMap: Record<SupportedLocale, string> = {
    en: 'en-US',
    es: 'es-US',
  };

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(localeMap[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format a date in short format (MM/DD/YYYY for en, DD/MM/YYYY for es).
 */
export function formatDateShort(
  date: Date | string,
  locale: SupportedLocale = 'en'
): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * React hook for using formatters with the current locale.
 * Usage:
 *   const { formatCurrency, formatPercent } = useFormatters();
 *   formatCurrency(500000) // "$500,000"
 */
export function createFormatters(locale: SupportedLocale = 'en') {
  return {
    formatCurrency: (value: number, options?: Parameters<typeof formatCurrency>[2]) =>
      formatCurrency(value, locale, options),
    formatCurrencyWithCents: (value: number) =>
      formatCurrencyWithCents(value, locale),
    formatNumber: (value: number, options?: Parameters<typeof formatNumber>[2]) =>
      formatNumber(value, locale, options),
    formatPercent: (value: number, options?: Parameters<typeof formatPercent>[2]) =>
      formatPercent(value, locale, options),
    formatPercentSimple: (value: number, options?: Parameters<typeof formatPercentSimple>[2]) =>
      formatPercentSimple(value, locale, options),
    formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, locale, options),
    formatDateShort: (date: Date | string) =>
      formatDateShort(date, locale),
  };
}
