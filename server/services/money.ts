import type { BillingCurrency } from '@prisma/client';

const USD_REFERENCE_RATES: Record<BillingCurrency, number> = {
  USD: 1,
  GHS: 15.45,
  NGN: 1605,
  KES: 129.2,
  ZAR: 18.1,
};

export function convertUsdToMinor(amountUsd: number, currency: BillingCurrency) {
  return Math.round(amountUsd * USD_REFERENCE_RATES[currency] * 100);
}
