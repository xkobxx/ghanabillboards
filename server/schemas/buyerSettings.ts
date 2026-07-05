import { z } from 'zod';

export const updateBuyerSettingsSchema = z.object({
  billingCurrency: z.enum(['USD', 'GHS', 'NGN', 'KES', 'ZAR']).optional(),
  defaultFlightDays: z.number().int().min(1).max(365).optional(),
  budgetCapMinor: z.number().int().positive().nullable().optional(),
  approvalWorkflow: z.enum(['DIRECT', 'MANAGER']).optional(),
  bookingStatusAlerts: z.boolean().optional(),
  availabilityAlerts: z.boolean().optional(),
  invoiceAlerts: z.boolean().optional(),
  sessionAlerts: z.boolean().optional(),
  creativeReviewRequired: z.boolean().optional(),
  version: z.number().int().positive(),
}).strict();
