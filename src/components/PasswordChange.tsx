import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { validatePassword, type ProfileErrors } from '../lib/validation';

interface PasswordChangeProps {
  onChangePassword: (currentPassword: string, newPassword: string) => boolean;
  onClose: () => void;
}

export default function PasswordChange({ onChangePassword, onClose }: PasswordChangeProps) {
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = () => {
    const validationErrors = validatePassword(current, newPw);
    if (validationErrors.currentPassword || validationErrors.newPassword) {
      setErrors(validationErrors);
      return;
    }
    if (newPw !== confirmPw) {
      setErrors({ newPassword: 'Passwords do not match' });
      return;
    }

    const ok = onChangePassword(current, newPw);
    if (ok) {
      setStatus('success');
      setTimeout(onClose, 1500);
    } else {
      setErrors({ currentPassword: 'Current password is incorrect' });
      setStatus('error');
    }
  };

  return (
    <div style={{ paddingTop: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Lock size={14} style={{ color: 'rgba(245,240,231,.52)', flexShrink: 0 }} />
        <h3 style={{ margin: 0, fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>Change password</h3>
      </div>

      <div className="vp-dash-list">
        <div className="vp-dash-item">
          <span style={{ flexShrink: 0 }}>Current password</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
            <input
              type={showCurrent ? 'text' : 'password'}
              value={current}
              onChange={e => { setCurrent(e.target.value); setErrors({}); setStatus('idle'); }}
              className="vp-input-inline"
              placeholder="••••••••"
            />
            <button type="button" className="vp-btn sm icon" onClick={() => setShowCurrent(v => !v)} style={{ flexShrink: 0 }}>
              {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        {errors.currentPassword && (
          <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{errors.currentPassword}</p>
        )}

        <div className="vp-dash-item">
          <span style={{ flexShrink: 0 }}>New password</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
            <input
              type={showNew ? 'text' : 'password'}
              value={newPw}
              onChange={e => { setNewPw(e.target.value); setErrors({}); setStatus('idle'); }}
              className="vp-input-inline"
              placeholder="Min 6 characters"
            />
            <button type="button" className="vp-btn sm icon" onClick={() => setShowNew(v => !v)} style={{ flexShrink: 0 }}>
              {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        {errors.newPassword && (
          <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{errors.newPassword}</p>
        )}

        <div className="vp-dash-item">
          <span style={{ flexShrink: 0 }}>Confirm password</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPw}
              onChange={e => { setConfirmPw(e.target.value); setErrors({}); setStatus('idle'); }}
              className="vp-input-inline"
              placeholder="Re-enter new password"
            />
            <button type="button" className="vp-btn sm icon" onClick={() => setShowConfirm(v => !v)} style={{ flexShrink: 0 }}>
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
        <button className="vp-btn sm primary" type="button" onClick={handleSubmit}>Update password</button>
        <button className="vp-btn sm" type="button" onClick={onClose}>Cancel</button>
        {status === 'success' && (
          <span className="text-body-xs" style={{ color: '#a8ff60', fontWeight: 700, fontFamily: 'monospace' }}>Password updated</span>
        )}
      </div>
    </div>
  );
}
