import { useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, KeyRound, ShieldCheck } from 'lucide-react';
import { mfaApi } from '../../lib/mfaApi';

interface MfaSettingsProps {
  enabled: boolean;
  onStatusChange: (enabled: boolean) => void;
}

export default function MfaSettings({ enabled, onStatusChange }: MfaSettingsProps) {
  const [mode, setMode] = useState<'idle' | 'verify' | 'recovery' | 'disable'>('idle');
  const [secret, setSecret] = useState('');
  const [qr, setQr] = useState('');
  const [token, setToken] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const enroll = async () => {
    setBusy(true);
    setError('');
    try {
      const enrollment = await mfaApi.enroll();
      setSecret(enrollment.secret);
      setQr(await QRCode.toDataURL(enrollment.uri, { margin: 1, width: 180 }));
      setMode('verify');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to start MFA setup');
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await mfaApi.confirm(token);
      setRecoveryCodes(result.recoveryCodes);
      onStatusChange(true);
      setToken('');
      setMode('recovery');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Invalid authenticator code');
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    setError('');
    try {
      await mfaApi.disable(token);
      onStatusChange(false);
      setToken('');
      setMode('idle');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to disable MFA');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="vp-mfa-settings">
      <div className="vp-settings-row">
        <span>
          Two-factor authentication
          <small>{enabled ? 'Authenticator challenge is required at sign-in.' : 'Protect this workspace with a time-based authenticator code.'}</small>
        </span>
        {enabled ? (
          <button className="vp-btn sm" type="button" onClick={() => setMode(mode === 'disable' ? 'idle' : 'disable')}>
            <ShieldCheck size={14} /> Manage
          </button>
        ) : (
          <button className="vp-btn sm" type="button" onClick={enroll} disabled={busy}>
            <KeyRound size={14} /> {busy ? 'Preparing…' : 'Set up MFA'}
          </button>
        )}
      </div>

      {error && <p className="vp-settings-message error" role="alert">{error}</p>}

      {mode === 'verify' && (
        <div className="vp-mfa-panel">
          <div>
            <p className="vp-eyebrow">Authenticator setup</p>
            <h4>Scan, then confirm</h4>
            <p>Scan this code in your authenticator app. If scanning is unavailable, enter the setup key manually.</p>
            <code>{secret}</code>
          </div>
          {qr && <img src={qr} alt="Authenticator setup QR code" width={180} height={180} />}
          <label>
            Six-digit code
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              value={token}
              onChange={(event) => setToken(event.target.value.replace(/\D/g, '').slice(0, 8))}
            />
          </label>
          <div className="vp-settings-actions">
            <button className="vp-btn sm" type="button" onClick={() => setMode('idle')}>Cancel</button>
            <button className="vp-btn sm primary" type="button" onClick={confirm} disabled={busy || token.length < 6}>
              Confirm authenticator
            </button>
          </div>
        </div>
      )}

      {mode === 'recovery' && (
        <div className="vp-mfa-panel">
          <p className="vp-eyebrow">Recovery codes</p>
          <h4>Store these once</h4>
          <p>Each code can recover one sign-in. They will not be displayed again.</p>
          <div className="vp-recovery-codes">{recoveryCodes.map((code) => <code key={code}>{code}</code>)}</div>
          <button
            className="vp-btn sm"
            type="button"
            onClick={() => navigator.clipboard.writeText(recoveryCodes.join('\n'))}
          >
            <Copy size={14} /> Copy codes
          </button>
          <button className="vp-btn sm primary" type="button" onClick={() => setMode('idle')}>
            <Check size={14} /> I stored these codes
          </button>
        </div>
      )}

      {mode === 'disable' && (
        <div className="vp-mfa-panel">
          <h4>Disable two-factor authentication</h4>
          <p>Enter a current authenticator or unused recovery code.</p>
          <label>
            Authentication code
            <input value={token} onChange={(event) => setToken(event.target.value.trim())} />
          </label>
          <button className="vp-btn sm danger" type="button" onClick={disable} disabled={busy || token.length < 6}>
            Disable MFA
          </button>
        </div>
      )}
    </div>
  );
}
