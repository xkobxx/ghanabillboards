import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface AuthStageProps {
  children: React.ReactNode;
  mode: 'sign-in' | 'register';
  onCancel: () => void;
}

export default function AuthStage({ children, mode, onCancel }: AuthStageProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cardRef.current?.querySelector<HTMLElement>('input')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onCancelRef.current(); } };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, []);

  return (
    <div className="vp-auth-backdrop" onMouseDown={onCancel}>
      <div ref={cardRef} className="vp-auth-card" onMouseDown={e => e.stopPropagation()}>
        <button
          type="button"
          className="vp-auth-close"
          aria-label={mode === 'sign-in' ? 'Close sign in' : 'Close registration'}
          onClick={onCancel}
        >
          <X />
        </button>
        {children}
      </div>
    </div>
  );
}
