import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { User } from '../types';
import AuthStage from './AuthStage';
import { authApi } from '../lib/authApi';

interface RegisterProps {
  onSuccess: (user: User) => void;
  onSwitchToSignIn: () => void;
  onCancel: () => void;
}

type RegisterRole = 'buyer' | 'publisher' | 'investor';

interface StoredUser extends User {
  password: string;
}

const ROLE_OPTIONS: { value: RegisterRole; label: string }[] = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'publisher', label: 'Publisher' },
  { value: 'investor', label: 'Investor' },
];

export default function Register({
  onSuccess,
  onSwitchToSignIn,
  onCancel,
}: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RegisterRole>('buyer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const registrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPendingRegistration = useCallback(() => {
    if (registrationTimeoutRef.current) {
      clearTimeout(registrationTimeoutRef.current);
      registrationTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => cancelPendingRegistration, [cancelPendingRegistration]);

  const getRegisteredUsers = (): StoredUser[] => {
    const raw = localStorage.getItem('vantage_users');
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
    } catch {
      return [];
    }
  };

  const saveRegisteredUser = (newUser: StoredUser) => {
    localStorage.setItem(
      'vantage_users',
      JSON.stringify([...getRegisteredUsers(), newUser]),
    );
  };

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }

    setIsLoading(true);
    cancelPendingRegistration();
    try {
      const session = await authApi.register({
        name,
        email: email.toLowerCase(),
        password,
        role,
        company: 'Autonomous Agent Co.',
      });
      onSuccess(session.user);
    } catch (reason) {
      const users = getRegisteredUsers();
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        setError('Email already registered. Try signing in instead.');
        setIsLoading(false);
        return;
      }
      const id = `${role}_${crypto.randomUUID()}`;
      const registeredUser: StoredUser = {
        id,
        name,
        company: 'Autonomous Agent Co.',
        email,
        password,
        role,
      };
      saveRegisteredUser(registeredUser);
      onSuccess(registeredUser);
      if (reason instanceof Error && !navigator.onLine) setError('Saved locally while the gateway is offline.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    cancelPendingRegistration();
    setIsLoading(false);
    onCancel();
  };

  const handleSwitchToSignIn = () => {
    cancelPendingRegistration();
    setIsLoading(false);
    onSwitchToSignIn();
  };

  return (
    <AuthStage mode="register" onCancel={handleCancel}>
      <p className="vp-eyebrow">Create account</p>
      <h1 className="text-3xl" style={{ margin: '0 0 12px', letterSpacing: '-.04em', color: 'var(--vp-ink)', textWrap: 'balance' }}>Sign up</h1>
      <p className="text-lg" style={{ color: 'var(--vp-muted)', lineHeight: 1.62, margin: 0 }}>
        Create your account and select your role.
      </p>

      {error ? (
        <div className="vp-auth-error" role="alert" aria-live="polite">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleRegisterSubmit} aria-busy={isLoading}>
        <div className="vp-stack">
          <div className="vp-field">
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              type="text"
              name="name"
              autoComplete="name"
              required
              disabled={isLoading}
              placeholder="Ama Mensah"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="vp-field">
            <label htmlFor="register-email">Work email</label>
            <input
              id="register-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              disabled={isLoading}
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="vp-field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              name="password"
              autoComplete="new-password"
              required
              disabled={isLoading}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="vp-role-choice">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`vp-role-option${role === opt.value ? ' selected' : ''}`}
              disabled={isLoading}
              onClick={() => setRole(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="vp-auth-actions">
          <button type="submit" className="vp-btn sm primary" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create preview account'} <ArrowUpRight className="w-3 h-3" />
          </button>
          <p className="vp-auth-alt">
            Already registered?{' '}
            <button type="button" onClick={handleSwitchToSignIn}>
              Login
            </button>
          </p>
        </div>
      </form>
    </AuthStage>
  );
}
