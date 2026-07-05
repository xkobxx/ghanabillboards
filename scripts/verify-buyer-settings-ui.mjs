import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP(process.env.CDP_URL || 'http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages()[0] || await context.newPage();
await page.setViewportSize({ width: 1440, height: 1000 });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));

await page.goto(process.env.APP_URL || 'http://localhost:3003/buyer');
await page.evaluate(() => {
  localStorage.setItem('vantage_current_user', JSON.stringify({
    id: 'usr_demo_adv',
    email: 'buyer@vantagepoint.com',
    name: 'Vanguard Brands Corp',
    role: 'buyer',
    company: 'Vanguard Media Group',
  }));
  localStorage.setItem('vantage_buyer_settings:usr_demo_adv', JSON.stringify({
    billingCurrency: 'GHS',
    defaultFlightDays: 21,
    budgetCapMinor: 5_000_000,
    approvalWorkflow: 'MANAGER',
    bookingStatusAlerts: true,
    availabilityAlerts: true,
    invoiceAlerts: true,
    sessionAlerts: true,
    creativeReviewRequired: true,
    mfaEnabled: false,
    version: 2,
  }));
});
await page.reload({ waitUntil: 'networkidle' });
await page.getByText('Settings', { exact: true }).first().click({ timeout: 8_000 });
await page.screenshot({ path: '/private/tmp/buyer-settings-desktop.png', fullPage: true });

const result = {
  settingsHeading: await page.getByText('Campaign operating preferences').count(),
  mfaAction: await page.getByRole('button', { name: /Set up MFA/ }).count(),
  budgetInput: await page.getByLabel('Campaign budget cap').count(),
  pageErrors: errors,
};
console.log(JSON.stringify(result, null, 2));
await browser.close();
