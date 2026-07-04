import type { User } from '../types';

interface ProfileCompletenessProps {
  user: User;
}

const FIELDS: { key: keyof User; label: string }[] = [
  { key: 'name', label: 'Full name' },
  { key: 'email', label: 'Work email' },
  { key: 'company', label: 'Company' },
  { key: 'phone', label: 'Phone' },
  { key: 'avatar', label: 'Profile photo' },
  { key: 'bio', label: 'Bio' },
  { key: 'location', label: 'Location' },
  { key: 'website', label: 'Website' },
];

export default function ProfileCompleteness({ user }: ProfileCompletenessProps) {
  const filled = FIELDS.filter(f => {
    const v = user[f.key];
    return v !== undefined && v !== null && v !== '';
  }).length;

  const pct = Math.round((filled / FIELDS.length) * 100);

  const steps = filled >= FIELDS.length ? 'complete' : filled >= 6 ? 'strong' : filled >= 3 ? 'partial' : 'minimal';

  return (
    <div className="vp-dash-panel" style={{ marginTop: 20 }}>
      <div className="vp-panel-title">
        <div><h3>Profile completeness</h3></div>
        <strong className="text-body-xs" style={{
          fontFamily: 'monospace',
          color: steps === 'complete' ? '#a8ff60' : steps === 'strong' ? '#ffe484' : 'rgba(245,240,231,.68)',
        }}>
          {filled}/{FIELDS.length} · {pct}%
        </strong>
      </div>
      <div style={{
        height: 6, borderRadius: 3, background: 'rgba(255,255,255,.06)', marginTop: 8, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 3, width: `${pct}%`,
          background: steps === 'complete' ? '#a8ff60' : steps === 'strong' ? '#ffe484' : 'rgba(245,240,231,.32)',
          transition: 'width .4s ease',
        }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 12 }}>
        {FIELDS.map(f => {
          const done = user[f.key] !== undefined && user[f.key] !== null && user[f.key] !== '';
          return (
            <span key={f.key} className="text-caption" style={{
              fontFamily: 'monospace', fontSize: 10,
              color: done ? '#a8ff60' : 'rgba(245,240,231,.28)',
              textDecoration: done ? 'none' : 'line-through',
            }}>
              {done ? '●' : '○'} {f.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
