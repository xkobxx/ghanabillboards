import { useEffect, useState } from 'react';
import type { Booking } from '../../types';
import { invoicesApi, type Invoice } from '../../lib/invoicesApi';
import { paymentsApi } from '../../lib/paymentsApi';
import type { BillingCurrency } from '../../types/buyerSettings';
import { convertUsd } from '../../lib/money';

interface InvoiceListProps {
  bookings: Booking[];
  currency: BillingCurrency;
}

export default function InvoiceList({ bookings, currency }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    invoicesApi.list().then(setInvoices).catch(() => undefined);
  }, []);

  const rows = invoices.length > 0 ? invoices : bookings.map((booking) => ({
    id: booking.id,
    code: booking.invoiceCode || `INV-${booking.id.toUpperCase()}`,
    currency,
    totalMinor: Math.round(convertUsd(booking.totalCost, currency) * 100),
    status: booking.status === 'Completed' ? 'PAID' as const : 'ISSUED' as const,
    issuedAt: booking.startDate,
    dueAt: booking.endDate,
    booking: { campaignName: booking.campaignName, billboardId: booking.billboardId },
  }));

  const payInvoice = async (bookingId: string) => {
    setPayingId(bookingId);
    try {
      const { authorization_url } = await paymentsApi.initialize(bookingId);
      window.location.href = authorization_url;
    } catch {
      setPayingId(null);
    }
  };

  if (rows.length === 0) {
    return <div className="vp-empty">Invoices appear after the first booking request is created.</div>;
  }

  return (
    <div className="vp-dash-list">
      {rows.map((invoice) => (
        <div className="vp-dash-item" key={invoice.id}>
          <span>
            {invoice.code}
            <small>{invoice.booking.campaignName} · due {new Date(invoice.dueAt).toLocaleDateString()}</small>
          </span>
          <strong>{new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: invoice.currency,
          }).format(invoice.totalMinor / 100)}</strong>
          <span className={`vp-status-pill ${invoice.status === 'PAID' ? 'ok' : 'warn'}`}>{invoice.status}</span>
          {invoice.status !== 'PAID' && (
            <button className="vp-btn sm primary" onClick={() => payInvoice(invoice.id)} disabled={payingId === invoice.id}>
              {payingId === invoice.id ? 'Redirecting…' : 'Pay via Paystack'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
