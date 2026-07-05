import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Toggle from '../Toggle';
import type { BuyerSettings } from '../../types/buyerSettings';
import MfaSettings from './MfaSettings';

interface BuyerSettingsFormProps {
  settings: BuyerSettings;
  status: 'loading' | 'ready' | 'saving' | 'error';
  error?: string;
  onSave: (settings: BuyerSettings) => Promise<BuyerSettings>;
  onMfaStatusChange: (enabled: boolean) => void;
}

const CURRENCIES = ['USD', 'GHS', 'NGN', 'KES', 'ZAR'] as const;

export default function BuyerSettingsForm({
  settings,
  status,
  error,
  onSave,
  onMfaStatusChange,
}: BuyerSettingsFormProps) {
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const validationError = draft.defaultFlightDays < 1 || draft.defaultFlightDays > 365
    ? 'Default flight length must be between 1 and 365 days.'
    : draft.budgetCapMinor !== null && draft.budgetCapMinor < 100
      ? 'Budget cap must be at least 1.00 in the selected currency.'
      : '';

  const autoSave = async (updated: BuyerSettings) => {
    await onSave(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (status === 'loading') {
    return <div className="vp-settings-state" role="status">Loading account settings…</div>;
  }

  return (
    <div className="vp-settings-editor">
      {error && <p className="vp-settings-message error" role="alert">{error}</p>}
      {validationError && <p className="vp-settings-message error" role="alert">{validationError}</p>}
      <div className="vp-settings-message" aria-live="polite">
        {saved && <span><Check size={14} /> Settings saved.</span>}
      </div>

      <div className="vp-settings-groups" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0 32px', alignItems: 'start' }}>
        <fieldset className="vp-settings-group" style={{ borderBottom: 'none' }}>
          <legend>Planning defaults</legend>
          <label className="vp-settings-row" htmlFor="buyer-billing-currency">
            <span>Billing currency<small>Used for estimates, caps, and invoice display.</small></span>
            <select
              id="buyer-billing-currency"
              aria-label="Billing currency"
              value={draft.billingCurrency}
              onChange={(event) => {
                const updated = { ...draft, billingCurrency: event.target.value as BuyerSettings['billingCurrency'] };
                setDraft(updated);
                autoSave(updated);
              }}
            >
              {CURRENCIES.map((currency) => <option key={currency}>{currency}</option>)}
            </select>
          </label>
          <label className="vp-settings-row" htmlFor="buyer-flight-days">
            <span>Default flight length<small>Prefills the campaign window for every new booking.</small></span>
            <span className="vp-settings-number">
              <input
                id="buyer-flight-days"
                aria-label="Default flight length"
                type="number"
                min={1}
                max={365}
                value={draft.defaultFlightDays}
                onChange={(event) => setDraft(curr => ({ ...curr, defaultFlightDays: Number(event.target.value) }))}
                onBlur={() => { if (!validationError) autoSave(draft); }}
              />
              days
            </span>
          </label>
          <label className="vp-settings-row" htmlFor="buyer-budget-cap">
            <span>Campaign budget cap<small>Blocks booking requests above this account limit.</small></span>
            <span className="vp-settings-number">
              <input
                id="buyer-budget-cap"
                aria-label="Campaign budget cap"
                type="number"
                min={1}
                step="0.01"
                placeholder="No cap"
                value={draft.budgetCapMinor === null ? '' : draft.budgetCapMinor / 100}
                onChange={(event) => setDraft(curr => ({
                  ...curr,
                  budgetCapMinor: event.target.value === '' ? null : Math.round(Number(event.target.value) * 100),
                }))}
                onBlur={() => { if (!validationError) autoSave(draft); }}
              />
              {draft.billingCurrency}
            </span>
          </label>
        </fieldset>

        <fieldset className="vp-settings-group" style={{ borderBottom: 'none' }}>
          <legend>Governance</legend>
          <label className="vp-settings-row" htmlFor="buyer-approval-workflow">
            <span>Approval workflow<small>Choose whether requests go directly to publishers or pause for manager review.</small></span>
            <select
              id="buyer-approval-workflow"
              aria-label="Approval workflow"
              value={draft.approvalWorkflow}
              onChange={(event) => {
                const updated = { ...draft, approvalWorkflow: event.target.value as BuyerSettings['approvalWorkflow'] };
                setDraft(updated);
                autoSave(updated);
              }}
            >
              <option value="DIRECT">Direct submission</option>
              <option value="MANAGER">Manager approval first</option>
            </select>
          </label>
          <div className="vp-settings-row">
            <span>Creative review required<small>Only approved campaign creative can advance to a publisher.</small></span>
            <Toggle
              label="Creative review required"
              checked={draft.creativeReviewRequired}
              onChange={() => {
                const updated = { ...draft, creativeReviewRequired: !draft.creativeReviewRequired };
                setDraft(updated);
                autoSave(updated);
              }}
            />
          </div>
        </fieldset>

        <fieldset className="vp-settings-group" style={{ gridColumn: '1 / -1' }}>
          <legend>Alert routing</legend>
          {([
            ['bookingStatusAlerts', 'Booking status alerts', 'Approval, rejection, live, and completion events.'],
            ['availabilityAlerts', 'Availability alerts', 'Watched inventory becoming bookable.'],
            ['invoiceAlerts', 'Invoice alerts', 'Invoice issue, payment, and overdue events.'],
            ['sessionAlerts', 'Session alerts', 'New device and unusual sign-in activity.'],
          ] as const).map(([key, label, description]) => (
            <div className="vp-settings-row" key={key}>
              <span>{label}<small>{description}</small></span>
              <Toggle
                label={label}
                checked={draft[key]}
                onChange={() => {
                  const updated = { ...draft, [key]: !draft[key] };
                  setDraft(updated);
                  autoSave(updated);
                }}
              />
            </div>
          ))}
        </fieldset>

        <div className="vp-settings-group security" style={{ gridColumn: '1 / -1' }}>
          <p className="vp-settings-legend">Security</p>
          <MfaSettings enabled={settings.mfaEnabled} onStatusChange={onMfaStatusChange} />
        </div>
      </div>
    </div>
  );
}
