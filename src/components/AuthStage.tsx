import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface AuthStageProps {
  children: React.ReactNode;
  mode: 'sign-in' | 'register';
  title?: string;
  eyebrow?: string;
  narrative?: string;
  onCancel: () => void;
}

export default function AuthStage({ children, mode, title, eyebrow, narrative, onCancel }: AuthStageProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = cardRef.current;
    dialog?.querySelector<HTMLElement>('[data-auth-autofocus], input:not([type="hidden"])')?.focus();
    const focusableSelector = [
      'a[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])', 'textarea:not([disabled])', '[contenteditable="true"]',
      'summary', 'audio[controls]', 'video[controls]', '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancelRef.current();
        return;
      }
      if (e.currentTarget === document) return;
      if (e.key !== 'Tab' || !dialog) return;
      const candidates = (Array.from(dialog.querySelectorAll(focusableSelector)) as HTMLElement[])
        .filter((element) => {
          const style = window.getComputedStyle(element);
          const hiddenParent = element.closest<HTMLElement>('[hidden], [style*="display: none"]');
          return !element.hidden && !hiddenParent && style.display !== 'none' && style.visibility !== 'hidden' && element.tabIndex >= 0;
        });
      if (candidates.length === 0) return;
      const first = candidates[0];
      const last = candidates[candidates.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    dialog?.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      dialog?.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, []);

  const accessibleTitle = title || (mode === 'sign-in' ? 'Sign in to Vantage Point' : 'Create a Vantage Point account');

  return (
    <div className="vp-auth-backdrop" onMouseDown={onCancel}>
      <div
        ref={cardRef}
        className="vp-auth-card"
        role="dialog"
        aria-modal="true"
        aria-label={accessibleTitle}
        aria-description={narrative}
        onMouseDown={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="vp-auth-close"
          aria-label={mode === 'sign-in' ? 'Close sign in' : 'Close registration'}
          onClick={onCancel}
        >
          <X />
        </button>
        {(title || eyebrow || narrative) && (
          <header className="auth-stage-copy">
            {eyebrow && <p className="vp-eyebrow">{eyebrow}</p>}
            {title && <h1>{title}</h1>}
            {narrative && <p>{narrative}</p>}
          </header>
        )}
        <div className="auth-form-panel">{children}</div>
      </div>
    </div>
  );
}
