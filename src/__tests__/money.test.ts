import { describe, expect, it } from 'vitest';
import { convertUsd, exceedsBudgetCap } from '../lib/money';

describe('buyer money preferences', () => {
  it('converts USD reference prices instead of swapping currency symbols', () => {
    expect(convertUsd(100, 'GHS')).toBe(1545);
    expect(convertUsd(100, 'NGN')).toBe(160500);
  });

  it('enforces the saved cap in the selected billing currency', () => {
    expect(exceedsBudgetCap(100, 'GHS', 150_000)).toBe(true);
    expect(exceedsBudgetCap(100, 'GHS', 160_000)).toBe(false);
    expect(exceedsBudgetCap(1_000_000, 'USD', null)).toBe(false);
  });
});
