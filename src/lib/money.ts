import type { BillingCurrency } from '../types/buyerSettings';

// USD reference rates. Production can replace this pure boundary with a live provider
// while preserving deterministic booking records and tests.
export const USD_REFERENCE_RATES: Record<BillingCurrency, number> = {
  USD: 1,
  GHS: 15.45,
  NGN: 1605,
  KES: 129.2,
  ZAR: 18.1,
};

export function convertUsd(amountUsd: number, currency: BillingCurrency) {
  return amountUsd * USD_REFERENCE_RATES[currency];
}

export function formatUsdInCurrency(amountUsd: number, currency: BillingCurrency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'USD' ? 2 : 0,
  }).format(convertUsd(amountUsd, currency));
}

export function exceedsBudgetCap(
  amountUsd: number,
  currency: BillingCurrency,
  budgetCapMinor: number | null,
) {
  if (budgetCapMinor === null) return false;
  return Math.round(convertUsd(amountUsd, currency) * 100) > budgetCapMinor;
}
