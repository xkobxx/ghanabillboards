import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import BuyerSettingsForm from '../components/buyer-settings/BuyerSettingsForm';
import { DEFAULT_BUYER_SETTINGS } from '../types/buyerSettings';

describe('BuyerSettingsForm', () => {
  it('discards an unsaved draft when the buyer cancels', async () => {
    const user = userEvent.setup();
    render(
      <BuyerSettingsForm
        settings={DEFAULT_BUYER_SETTINGS}
        status="ready"
        onSave={vi.fn()}
        onMfaStatusChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit settings' }));
    const flightLength = screen.getByLabelText('Default flight length');
    await user.clear(flightLength);
    await user.type(flightLength, '30');
    await user.click(screen.getByRole('button', { name: /Cancel/ }));
    await user.click(screen.getByRole('button', { name: 'Edit settings' }));

    expect(screen.getByLabelText('Default flight length')).toHaveValue(14);
  });

  it('saves one validated account draft', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn(async (settings) => ({ ...settings, version: 2 }));
    render(
      <BuyerSettingsForm
        settings={DEFAULT_BUYER_SETTINGS}
        status="ready"
        onSave={onSave}
        onMfaStatusChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit settings' }));
    await user.selectOptions(screen.getByLabelText('Billing currency'), 'GHS');
    await user.click(screen.getByRole('switch', { name: 'Availability alerts' }));
    await user.click(screen.getByRole('button', { name: /Save changes/ }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      billingCurrency: 'GHS',
      availabilityAlerts: false,
      version: 1,
    }));
    expect(screen.getByText('Settings saved for this account.')).toBeInTheDocument();
  });
});
