/**
 * Sanitization utilities for cleaning GHL Custom Values.
 * Non-tech savvy users may enter values in various formats:
 * - "$1,000.00" instead of 1000
 * - "6.5%" instead of 6.5
 * - " 500 " with extra whitespace
 * - null or undefined values
 */

/**
 * Sanitize a string value to a number.
 * Handles common formats like "$1,234.56", "6.5%", " 500 ", etc.
 */
export function sanitizeNumber(
  value: unknown,
  defaultValue: number = 0
): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  if (typeof value === 'number') {
    return isNaN(value) ? defaultValue : value;
  }

  if (typeof value !== 'string') {
    return defaultValue;
  }

  // Trim whitespace
  let cleaned = value.trim();

  // Check if it's a percentage (ends with %)
  const isPercentage = cleaned.endsWith('%');
  if (isPercentage) {
    cleaned = cleaned.slice(0, -1).trim();
  }

  // Remove currency symbols and commas
  cleaned = cleaned
    .replace(/[$€£¥]/g, '')
    .replace(/,/g, '')
    .trim();

  // Handle parentheses for negative numbers: (500) -> -500
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = '-' + cleaned.slice(1, -1);
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Sanitize a percentage value (stored as decimal in some systems).
 * If value > 1 and < 100, assumes it's already a percentage.
 * If value <= 1, assumes it's a decimal and converts to percentage.
 */
export function sanitizePercentage(
  value: unknown,
  defaultValue: number = 0
): number {
  const num = sanitizeNumber(value, defaultValue);

  // If it looks like a decimal (e.g., 0.065), convert to percentage
  if (num > 0 && num < 1) {
    return num * 100;
  }

  return num;
}

/**
 * Sanitize a rate value (always stored as percentage points, e.g., 6.5 for 6.5%).
 * This is for interest rates which are typically entered as 6.5, not 0.065.
 */
export function sanitizeRate(value: unknown, defaultValue: number = 0): number {
  const num = sanitizeNumber(value, defaultValue);

  // Interest rates should be between 0 and 20 typically
  // If someone enters 0.065, convert to 6.5
  if (num > 0 && num < 1) {
    return num * 100;
  }

  return num;
}

/**
 * Sanitize a string value (trim whitespace, handle null/undefined).
 */
export function sanitizeString(value: unknown, defaultValue: string = ''): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || defaultValue;
  }

  return String(value);
}

/**
 * Sanitize a boolean value from various string representations.
 */
export function sanitizeBoolean(value: unknown, defaultValue: boolean = false): boolean {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    if (['true', 'yes', '1', 'on'].includes(lower)) {
      return true;
    }
    if (['false', 'no', '0', 'off'].includes(lower)) {
      return false;
    }
  }

  return defaultValue;
}

/**
 * Sanitize a monetary value (always returns a positive number or 0).
 */
export function sanitizeMoney(value: unknown, defaultValue: number = 0): number {
  const num = sanitizeNumber(value, defaultValue);
  return Math.max(0, num);
}

/**
 * Create a sanitized config object from raw GHL Custom Values.
 * This maps the raw key-value pairs to a structured config object.
 */
export function sanitizeGhlConfig(rawValues: Record<string, unknown>) {
  const get = (key: string, defaultValue: number = 0) =>
    sanitizeNumber(rawValues[key], defaultValue);

  const getRate = (key: string, defaultValue: number = 0) =>
    sanitizeRate(rawValues[key], defaultValue);

  const getStr = (key: string, defaultValue: string = '') =>
    sanitizeString(rawValues[key], defaultValue);

  // Build MI factor lookup tables
  const buildMiTable = (prefix: string) => {
    const ltvTiers = ['97', '95', '90', '85'];
    const ficoTiers = ['760', '740', '720', '700', '680', '660', '640', '620'];

    const monthly: Record<string, Record<string, number>> = {};
    const single: Record<string, Record<string, number>> = {};

    for (const ltv of ltvTiers) {
      monthly[ltv] = {};
      single[ltv] = {};
      for (const fico of ficoTiers) {
        monthly[ltv][fico] = getRate(`${prefix}_mo_${ltv}_${fico}`);
        single[ltv][fico] = getRate(`${prefix}_sg_${ltv}_${fico}`);
      }
    }

    return { monthly, single };
  };

  return {
    rates: {
      conv30: getRate('calc_rate_conv_30', 7.0),
      conv15: getRate('calc_rate_conv_15', 6.5),
      fha30: getRate('calc_rate_fha_30', 6.5),
      va30: getRate('calc_rate_va_30', 6.5),
      jumbo: getRate('calc_rate_jumbo', 7.5),
    },

    fees: {
      originationPoints: get('calc_fee_origination_pts', 0),
      admin: get('calc_fee_admin', 0),
      processing: get('calc_fee_processing', 995),
      underwriting: get('calc_fee_underwriting', 1495),
      appraisal: get('calc_fee_appraisal', 650),
      creditReport: get('calc_fee_credit_report', 150),
      floodCert: get('calc_fee_flood_cert', 30),
      taxService: get('calc_fee_tax_service', 85),
      docPrep: get('calc_fee_doc_prep', 295),
      settlement: get('calc_fee_settlement', 1115),
      notary: get('calc_fee_notary', 350),
      recording: get('calc_fee_recording', 275),
      courier: get('calc_fee_courier', 35),
      ownerTitlePolicy: get('calc_fee_owner_title_policy', 1730),
      lenderTitlePolicy: get('calc_fee_lender_title_policy', 1515),
      pestInspection: get('calc_fee_pest_inspection', 150),
      propertyInspection: get('calc_fee_property_inspection', 450),
      poolInspection: get('calc_fee_pool_inspection', 100),
    },

    prepaids: {
      taxMonths: get('calc_reserves_tax_mo', 4),
      insuranceMonths: get('calc_reserves_ins_mo', 14),
      interestDays: get('calc_days_interest', 15),
      taxRateAnnual: getRate('calc_tax_rate_annual', 1.25),
    },

    limits: {
      conforming: get('calc_limit_conforming', 766550),
      highBalance: get('calc_limit_high_balance', 1149825),
      fha: get('calc_fha_limit', 498257),
    },

    fha: {
      minDownPct: get('calc_fha_min_down_pct', 3.5),
      maxLtvCashout: get('calc_fha_max_ltv_cashout', 80),
      ufmipPurchase: getRate('calc_fha_ufmip_rate_purchase', 1.75),
      ufmipRefi: getRate('calc_fha_ufmip_rate_refi', 1.75),
      ufmipStreamline: getRate('calc_fha_ufmip_rate_streamline', 0.55),
      mip30yrGt95: getRate('calc_fha_mip_30yr_gt95', 0.55),
      mip30yrLe95: getRate('calc_fha_mip_30yr_le95', 0.50),
      mip15yrGt90: getRate('calc_fha_mip_15yr_gt90', 0.40),
      mip15yrLe90: getRate('calc_fha_mip_15yr_le90', 0.15),
    },

    va: {
      maxGuarantee: get('calc_va_max_guarantee', 0),
      maxLtvCashout: get('calc_va_max_ltv_cashout', 100),
      maxLtvIrrrl: get('calc_va_max_ltv_irrrl', 100),
      ffFirstLe90: getRate('calc_va_ff_first_ltv_le90', 1.25),
      ffFirst90to95: getRate('calc_va_ff_first_ltv_90_95', 1.50),
      ffFirstGt95: getRate('calc_va_ff_first_ltv_gt95', 2.15),
      ffSubseqLe90: getRate('calc_va_ff_subseq_ltv_le90', 1.25),
      ffSubseq90to95: getRate('calc_va_ff_subseq_ltv_90_95', 1.50),
      ffSubseqGt95: getRate('calc_va_ff_subseq_ltv_gt95', 3.30),
      ffIrrrl: getRate('calc_va_ff_irrrl', 0.50),
      ffCashoutFirst: getRate('calc_va_ff_cashout_first', 2.15),
      ffCashoutSubseq: getRate('calc_va_ff_cashout_subseq', 3.30),
    },

    miFactors: {
      standard: buildMiTable('calc_mi_std'),
      highBalance: buildMiTable('calc_mi_hb'),
    },

    company: {
      name: getStr('calc_company_name', ''),
      nmlsId: getStr('calc_nmls_id', ''),
      loName: getStr('calc_lo_name', ''),
      loEmail: getStr('calc_lo_email', ''),
      loPhone: getStr('calc_lo_phone', ''),
      address: getStr('calc_lo_address', ''),
    },

    blurbs: {
      home1: getStr('calc_blurb_home_1', ''),
      home2: getStr('calc_blurb_home_2', ''),
      home3: getStr('calc_blurb_home_3', ''),
    },
  };
}
