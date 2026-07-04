import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { User } from '../types';
import AuthStage from './AuthStage';

interface SignInProps {
  onSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
  onCancel: () => void;
}

type DemoRole = 'advertiser' | 'vendor' | 'admin' | 'investor';

export default function SignIn({
  onSuccess,
  onSwitchToRegister,
  onCancel,
}: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<DemoRole>('advertiser');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPendingAuth = useCallback(() => {
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }
    if (demoTimeoutRef.current) {
      clearTimeout(demoTimeoutRef.current);
      demoTimeoutRef.current = null;
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

  const handleDemoLogin = (demoRole: DemoRole) => {
    setIsLoading(true);
    if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
    demoTimeoutRef.current = setTimeout(() => {
      demoTimeoutRef.current = null;
      setIsLoading(false);
      if (demoRole === 'advertiser') {
        onSuccess({
          id: 'usr_demo_adv',
          email: 'advertiser@vantagepoint.com',
          name: 'Vanguard Brands Corp',
          role: 'advertiser',
          company: 'Vanguard Media Group',
        });
      } else if (demoRole === 'vendor') {
        onSuccess({
          id: 'usr_demo_pub',
          email: 'publisher@vantagepoint.com',
          name: 'Apex OOH Screens',
          role: 'vendor',
          company: 'Apex Publishers Intern.',
        });
      } else if (demoRole === 'admin') {
        onSuccess({
          id: 'usr_demo_adm',
          email: 'admin@vantagepoint.com',
          name: 'Regional Admin Director',
          role: 'admin',
          company: 'Vantage Point Global Admin',
        });
      } else {
        onSuccess({
          id: 'usr_demo_inv',
          email: 'investor@vantagepoint.com',
          name: 'Kalu Capital Partners',
          role: 'investor',
          company: 'Kalu Capital LLP',
        });
      }
    }, 500);
  };

  const handleSignInSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    submitTimeoutRef.current = setTimeout(() => {
      submitTimeoutRef.current = null;
      setIsLoading(false);

      const normalizedEmail = email.toLowerCase();

      // Demo shortcut: use selected role to pick demo account
      if (normalizedEmail === 'demo@vantage.africa' && password === 'password') {
        handleDemoLogin(role);
        return;
      }

      const isDemoAdvertiser =
        normalizedEmail === 'advertiser@vantagepoint.com' && password === 'password';
      const isDemoPublisher =
        normalizedEmail === 'publisher@vantagepoint.com' && password === 'password';
      const isDemoAdmin =
        normalizedEmail === 'admin@vantagepoint.com' && password === 'password';

      if (isDemoAdvertiser) {
        onSuccess({
          id: 'usr_demo_adv',
          email: 'advertiser@vantagepoint.com',
          name: 'Vanguard Brands Corp',
          role: 'advertiser',
          company: 'Vanguard Media Group',
        });
        return;
      }
      if (isDemoPublisher) {
        onSuccess({
          id: 'usr_demo_pub',
          email: 'publisher@vantagepoint.com',
          name: 'Apex OOH Screens',
          role: 'vendor',
          company: 'Apex Media Group',
        });
        return;
      }
      if (isDemoAdmin) {
        onSuccess({
          id: 'usr_demo_adm',
          email: 'admin@vantagepoint.com',
          name: 'Regional Admin Director',
          role: 'admin',
          company: 'Vantage Point Escrow Ltd',
        });
        return;
      }

      const isDemoInvestor =
        normalizedEmail === 'investor@vantagepoint.com' && password === 'password';
      if (isDemoInvestor) {
        onSuccess({
          id: 'usr_demo_inv',
          email: 'investor@vantagepoint.com',
          name: 'Kalu Capital Partners',
          role: 'investor',
          company: 'Kalu Capital LLP',
        });
        return;
      }

      const users = getRegisteredUsers();
      const userMatch = users.find(
        (user: any) =>
          user.email.toLowerCase() === normalizedEmail && user.password === password,
      );

      if (userMatch) {
        onSuccess({
          id: userMatch.id,
          email: userMatch.email,
          name: userMatch.name,
          role: userMatch.role,
          company: userMatch.company,
        });
      } else {
        setError('Invalid email or password. Try demo@vantage.africa / password with a role.');
      }
    }, 900);
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
        Use the demo role selector to enter the correct workspace.
      </p>

      {error ? (
        <div className="vp-auth-error" role="alert" aria-live="polite">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSignInSubmit}>
        <div className="vp-stack">
          <div className="vp-field">
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
          </div>

          <div className="vp-field">
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
          </div>

          <div className="vp-field">
            <label htmlFor="sign-in-role">Login role</label>
            <select
              id="sign-in-role"
              value={role}
              onChange={(e) => setRole(e.target.value as DemoRole)}
            >
              <option value="advertiser">Advertiser</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
              <option value="investor">Investor</option>
            </select>
          </div>
        </div>

        <div className="vp-auth-actions">
          <button type="submit" className="vp-btn sm primary" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Login to workspace'} <ArrowUpRight className="w-3 h-3" />
          </button>
          <p className="vp-auth-alt">
            No account?{' '}
            <button type="button" onClick={handleSwitchToRegister}>
              Sign up
            </button>
          </p>
        </div>
      </form>
    </AuthStage>
  );
}
