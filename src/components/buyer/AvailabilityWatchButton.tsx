import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { availabilityWatchesApi } from '../../lib/availabilityWatchesApi';
import { sessionStore } from '../../lib/apiClient';

interface AvailabilityWatchButtonProps {
  billboardId: string;
  userId: string;
  enabled: boolean;
}

export default function AvailabilityWatchButton({
  billboardId,
  userId,
  enabled,
}: AvailabilityWatchButtonProps) {
  const key = `vantage_availability_watches:${userId}`;
  const [watching, setWatching] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]').includes(billboardId);
    } catch {
      return false;
    }
  });
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      if (sessionStore.getToken()) {
        if (watching) await availabilityWatchesApi.unwatch(billboardId);
        else await availabilityWatchesApi.watch(billboardId);
      }
      setWatching((current) => {
        const stored: string[] = JSON.parse(localStorage.getItem(key) || '[]');
        const next = current ? stored.filter((id) => id !== billboardId) : [...new Set([...stored, billboardId])];
        localStorage.setItem(key, JSON.stringify(next));
        return !current;
      });
    } finally {
      setBusy(false);
    }
  };

  if (!enabled) return null;
  return (
    <button
      className="vp-btn sm"
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={watching}
      aria-label={`${watching ? 'Stop watching' : 'Watch'} availability for ${billboardId}`}
    >
      {watching ? <BellOff size={13} /> : <Bell size={13} />}
      {watching ? 'Watching' : 'Watch'}
    </button>
  );
}
