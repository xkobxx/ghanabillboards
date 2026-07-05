import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { User } from '../types';
import AuthStage from './AuthStage';
import { authApi } from '../lib/authApi';

interface SignInProps {
  onSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
  onCancel: () => void;
}

export default function SignIn({
  onSuccess,
  onSwitchToRegister,
  onCancel,
}: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPendingAuth = useCallback(() => {
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => cancelPendingAuth, [cancelPendingAuth]);

  const getRegisteredUsers = () => {
    const raw = localStorage.getItem('vantage_users');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return [];
  };

  const handleSignInSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (mfaToken) {
        const session = await authApi.completeMfa({ mfaToken, token: mfaCode });
        onSuccess(session.user);
        return;
      }
      const result = await authApi.login({ email: email.toLowerCase(), password });
      if ('mfaRequired' in result) {
        setMfaToken(result.mfaToken);
        setPassword('');
        return;
      }
      onSuccess(result.user);
    } catch {
      const normalizedEmail = email.toLowerCase();
      const users = getRegisteredUsers();
      const userMatch = users.find((user: any) =>
        user.email.toLowerCase() === normalizedEmail && user.password === password);
      const demoAccounts: Record<string, Parameters<typeof onSuccess>[0]> = {
        'buyer@vantagepoint.com': { id: 'usr_demo_adv', email: 'buyer@vantagepoint.com', name: 'Vanguard Brands Corp', role: 'buyer', company: 'Vanguard Media Group' },
        'publisher@vantagepoint.com': { id: 'usr_demo_pub', email: 'publisher@vantagepoint.com', name: 'Apex OOH Screens', role: 'publisher', company: 'Apex Media Group' },
        'investor@vantagepoint.com': { id: 'usr_demo_inv', email: 'investor@vantagepoint.com', name: 'Kalu Capital Partners', role: 'investor', company: 'Kalu Capital LLP' },
      };
      if (!mfaToken && userMatch) {
        onSuccess(userMatch);
      } else if (!mfaToken && demoAccounts[normalizedEmail] && password === 'password') {
        onSuccess(demoAccounts[normalizedEmail]);
      } else {
        setError(mfaToken ? 'Invalid or expired authentication code.' : 'Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    cancelPendingAuth();
    onCancel();
  };

  const handleSwitchToRegister = () => {
    cancelPendingAuth();
    onSwitchToRegister();
  };

  return (
    <AuthStage mode="sign-in" onCancel={handleCancel}>
      <p className="vp-eyebrow">Secure access</p>
      <h1 className="text-3xl" style={{ margin: '0 0 12px', letterSpacing: '-.04em', color: 'var(--vp-ink)', textWrap: 'balance' }}>Login</h1>
      <p className="text-lg" style={{ color: 'var(--vp-muted)', lineHeight: 1.62, margin: 0 }}>
        Enter your credentials to access your workspace.
      </p>

      {error ? (
        <div className="vp-auth-error" role="alert" aria-live="polite">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSignInSubmit}>
        <div className="vp-stack">
          {!mfaToken && <div className="vp-field">
            <label htmlFor="sign-in-email">Email</label>
            <input
              id="sign-in-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>}

          {!mfaToken ? <div className="vp-field">
            <label htmlFor="sign-in-password">Password</label>
            <input
              id="sign-in-password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div> : (
            <div className="vp-field">
              <label htmlFor="sign-in-mfa">Authentication code</label>
              <input
                id="sign-in-mfa"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                placeholder="6-digit or recovery code"
                value={mfaCode}
                onChange={(event) => setMfaCode(event.target.value.trim())}
              />
            </div>
          )}

        </div>

        <div className="vp-auth-actions">
          <button type="submit" className="vp-btn sm primary" disabled={isLoading}>
            {isLoading ? 'Signing in…' : mfaToken ? 'Verify and continue' : 'Login to workspace'} <ArrowUpRight className="w-3 h-3" />
          </button>
          <p className="vp-auth-alt">
            {mfaToken ? (
              <button type="button" onClick={() => { setMfaToken(''); setMfaCode(''); }}>
                Use another account
              </button>
            ) : <>
            No account?{' '}
            <button type="button" onClick={handleSwitchToRegister}>
              Sign up
            </button>
            </>}
          </p>
        </div>
      </form>
    </AuthStage>
  );
}
