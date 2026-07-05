export type BillingCurrency = 'USD' | 'GHS' | 'NGN' | 'KES' | 'ZAR';
export type ApprovalWorkflow = 'DIRECT' | 'MANAGER';

export interface BuyerSettings {
  billingCurrency: BillingCurrency;
  defaultFlightDays: number;
  budgetCapMinor: number | null;
  approvalWorkflow: ApprovalWorkflow;
  bookingStatusAlerts: boolean;
  availabilityAlerts: boolean;
  invoiceAlerts: boolean;
  sessionAlerts: boolean;
  creativeReviewRequired: boolean;
  mfaEnabled: boolean;
  version: number;
}

export const DEFAULT_BUYER_SETTINGS: BuyerSettings = {
  billingCurrency: 'USD',
  defaultFlightDays: 14,
  budgetCapMinor: null,
  approvalWorkflow: 'DIRECT',
  bookingStatusAlerts: true,
  availabilityAlerts: true,
  invoiceAlerts: true,
  sessionAlerts: true,
  creativeReviewRequired: false,
  mfaEnabled: false,
  version: 1,
};

export type BuyerSettingsUpdate = Partial<Omit<BuyerSettings, 'mfaEnabled' | 'version'>> & {
  version: number;
};
