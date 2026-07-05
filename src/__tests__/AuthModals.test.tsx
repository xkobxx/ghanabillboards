import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AuthStage from '../components/AuthStage';
import Register from '../components/Register';
import SignIn from '../components/SignIn';

function renderSignIn() {
  return render(
    <SignIn
      onSuccess={vi.fn()}
      onSwitchToRegister={vi.fn()}
      onCancel={vi.fn()}
    />,
  );
}

function renderRegister() {
  return render(
    <Register
      onSuccess={vi.fn()}
      onSwitchToSignIn={vi.fn()}
      onCancel={vi.fn()}
    />,
  );
}

function renderAuthStage(onCancel = vi.fn()) {
  return render(
    <AuthStage
      mode="sign-in"
      title="Sign in to Vantage Point"
      eyebrow="Secure exchange access"
      narrative="Manage campaigns and premium media inventory from one trusted workspace."
      onCancel={onCancel}
    >
      <label htmlFor="auth-email">Work email</label>
      <input id="auth-email" data-auth-autofocus />
      <button type="button">Continue</button>
      <button type="button" tabIndex={-1}>
        Programmatic action
      </button>
      <button type="button" disabled tabIndex={0}>
        Disabled tab stop
      </button>
      <button type="button" hidden>
        Hidden action
      </button>
      <div style={{ display: 'none' }}>
        <button type="button">Non-rendered action</button>
      </div>
      <input type="hidden" tabIndex={0} />
    </AuthStage>,
  );
}

function renderFocusCandidate(candidate: React.ReactNode) {
  return render(
    <AuthStage
      mode="register"
      title="Create a Vantage Point account"
      eyebrow="Exchange membership"
      narrative="Join the exchange."
      onCancel={vi.fn()}
    >
      {candidate}
    </AuthStage>,
  );
}

describe('AuthStage', () => {
  it('names and describes the dialog from its content', () => {
    renderAuthStage();

    expect(
      screen.getByRole('dialog', { name: 'Sign in to Vantage Point' }),
    ).toHaveAccessibleDescription(
      'Manage campaigns and premium media inventory from one trusted workspace.',
    );
  });

  it('autofocuses the marked control and locks body scrolling', () => {
    document.body.style.overflow = 'scroll';

    renderAuthStage();

    expect(screen.getByLabelText('Work email')).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scrolling and prior focus when unmounted', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Open sign in';
    document.body.append(trigger);
    trigger.focus();
    document.body.style.overflow = 'clip';
    const { unmount } = renderAuthStage();

    expect(screen.getByLabelText('Work email')).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('clip');
    expect(trigger).toHaveFocus();
    trigger.remove();
    document.body.style.overflow = '';
  });

  it('closes on Escape', () => {
    const onCancel = vi.fn();
    renderAuthStage(onCancel);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('closes on backdrop mousedown but not dialog mousedown', () => {
    const onCancel = vi.fn();
    renderAuthStage(onCancel);
    const dialog = screen.getByRole('dialog');
    const backdrop = dialog.parentElement;

    fireEvent.mouseDown(dialog);
    expect(onCancel).not.toHaveBeenCalled();

    fireEvent.mouseDown(backdrop!);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('keeps the close control outside the scrolling form panel', () => {
    renderAuthStage();
    const dialog = screen.getByRole('dialog');
    const close = screen.getByRole('button', { name: 'Close sign in' });
    const formPanel = dialog.querySelector('.auth-form-panel');

    expect(close.parentElement).toBe(dialog);
    expect(formPanel).not.toContainElement(close);
  });

  it('wraps focus across visible, enabled, sequential dialog controls', () => {
    renderAuthStage();
    const dialog = screen.getByRole('dialog');
    const close = screen.getByRole('button', { name: 'Close sign in' });
    const continueButton = screen.getByRole('button', { name: 'Continue' });

    close.focus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(continueButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(close).toHaveFocus();
  });

  it.each([
    [
      'contenteditable regions',
      () => (
        <div
          contentEditable
          suppressContentEditableWarning
          data-testid="standard-focus-candidate"
        >
          Edit campaign
        </div>
      ),
    ],
    [
      'summary controls',
      () => (
        <details>
          <summary data-testid="standard-focus-candidate">Account details</summary>
        </details>
      ),
    ],
    [
      'audio controls',
      () => (
        <audio
          controls
          aria-label="Audio guidance"
          data-testid="standard-focus-candidate"
        />
      ),
    ],
    [
      'video controls',
      () => (
        <video
          controls
          aria-label="Video guidance"
          data-testid="standard-focus-candidate"
        />
      ),
    ],
  ])('includes %s in the focus trap', (_label, createCandidate) => {
    renderFocusCandidate(createCandidate());
    const dialog = screen.getByRole('dialog');
    const close = screen.getByRole('button', { name: 'Close registration' });
    const candidate = screen.getByTestId('standard-focus-candidate');
    const focus = vi.spyOn(candidate, 'focus');

    close.focus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });

    expect(focus).toHaveBeenCalledOnce();
  });
});

describe('authentication dialogs', () => {
  it('presents the sign-in form as an accessible dialog', () => {
    renderSignIn();

    expect(
      screen.getByRole('dialog', { name: 'Sign in to Vantage Point' }),
    ).toBeInTheDocument();
  });

  it('focuses the work email field when sign-in opens', () => {
    renderSignIn();

    expect(screen.getByLabelText('Work email')).toHaveFocus();
  });

  it('labels the sign-in password visibility control', () => {
    renderSignIn();

    expect(
      screen.getByRole('button', { name: 'Show password' }),
    ).toBeInTheDocument();
  });

  it('announces the sign-in password visibility state', () => {
    renderSignIn();

    const showPassword = screen.getByRole('button', {
      name: 'Show password',
    });
    expect(showPassword).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(showPassword);

    expect(
      screen.getByRole('button', { name: 'Hide password' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps demo account actions hidden until requested', () => {
    renderSignIn();

    expect(
      screen.queryByRole('button', { name: 'Buyer demo' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Publisher demo' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Quick demo access')).not.toBeInTheDocument();
  });

  it('reveals advertiser and publisher demo accounts on request', async () => {
    const user = userEvent.setup();

    renderSignIn();

    await user.click(
      screen.getByRole('button', { name: 'Explore demo accounts' }),
    );

    expect(
      screen.getByRole('button', { name: 'Buyer demo' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Publisher demo' }),
    ).toBeVisible();
  });

  it.each([
    [
      'Buyer demo',
      {
        id: 'usr_demo_adv',
        email: 'buyer@vantagepoint.com',
        name: 'Vanguard Brands Corp',
        role: 'buyer',
        company: 'Vanguard Media Group',
      },
    ],
    [
      'Publisher demo',
      {
        id: 'usr_demo_pub',
        email: 'publisher@vantagepoint.com',
        name: 'Apex OOH Screens',
        role: 'publisher',
        company: 'Apex Publishers Intern.',
      },
    ],
    [
      'Admin demo',
      {
        id: 'usr_demo_adm',
        email: 'admin@vantagepoint.com',
        name: 'Regional Admin Director',
        role: 'admin',
        company: 'Vantage Point Global Admin',
      },
    ],
  ])('preserves the %s sign-in payload', (demoName, expectedUser) => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();
    try {
      render(
        <SignIn
          onSuccess={onSuccess}
          onSwitchToRegister={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Explore demo accounts' }),
      );
      fireEvent.click(screen.getByRole('button', { name: demoName }));
      act(() => vi.advanceTimersByTime(500));

      expect(onSuccess).toHaveBeenCalledWith(expectedUser);
    } finally {
      vi.useRealTimers();
    }
  });

  it('reports invalid manual credentials as an accessible alert', () => {
    vi.useFakeTimers();
    try {
      renderSignIn();

      fireEvent.change(screen.getByLabelText('Work email'), {
        target: { value: 'someone@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'incorrect' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
      act(() => vi.advanceTimersByTime(900));

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(
        'Invalid email or password. Try a demo account.',
      );
      expect(alert).toHaveAttribute('aria-live', 'polite');
    } finally {
      vi.useRealTimers();
    }
  });

  it('cancels pending credential authentication when unmounted', () => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();
    try {
      const { unmount } = render(
        <SignIn
          onSuccess={onSuccess}
          onSwitchToRegister={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      fireEvent.change(screen.getByLabelText('Work email'), {
        target: { value: 'buyer@vantagepoint.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
      unmount();
      act(() => vi.advanceTimersByTime(900));

      expect(onSuccess).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('cancels pending demo authentication when the dialog is canceled', () => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();
    const onCancel = vi.fn();
    try {
      render(
        <SignIn
          onSuccess={onSuccess}
          onSwitchToRegister={vi.fn()}
          onCancel={onCancel}
        />,
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Explore demo accounts' }),
      );
      fireEvent.click(
        screen.getByRole('button', { name: 'Buyer demo' }),
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      act(() => vi.advanceTimersByTime(500));

      expect(onCancel).toHaveBeenCalledOnce();
      expect(onSuccess).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('cancels pending authentication and switches to registration', () => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();
    const onSwitchToRegister = vi.fn();
    try {
      render(
        <SignIn
          onSuccess={onSuccess}
          onSwitchToRegister={onSwitchToRegister}
          onCancel={vi.fn()}
        />,
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Explore demo accounts' }),
      );
      fireEvent.click(
        screen.getByRole('button', { name: 'Buyer demo' }),
      );
      fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
      act(() => vi.advanceTimersByTime(500));

      expect(onSwitchToRegister).toHaveBeenCalledOnce();
      expect(onSuccess).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('presents registration as an accessible dialog', () => {
    renderRegister();

    expect(
      screen.getByRole('dialog', {
        name: 'Create a Vantage Point account',
      }),
    ).toBeInTheDocument();
  });

  it('groups registration account types as radio options', () => {
    renderRegister();

    expect(
      screen.getByRole('radiogroup', { name: 'Account type' }),
    ).toBeInTheDocument();
  });

  it('selects Buyer as the initial account type', () => {
    renderRegister();

    expect(
      screen.getByRole('radio', { name: 'Buyer' }),
    ).toBeChecked();
  });

  it('offers Publisher as an account type', () => {
    renderRegister();

    expect(
      screen.getByRole('radio', { name: 'Publisher' }),
    ).toBeInTheDocument();
  });

  it('selects Publisher and clears Buyer when requested', async () => {
    const user = userEvent.setup();
    renderRegister();

    const advertiser = screen.getByRole('radio', { name: 'Buyer' });
    const publisher = screen.getByRole('radio', { name: 'Publisher' });

    await user.click(publisher);

    expect(publisher).toBeChecked();
    expect(advertiser).not.toBeChecked();
  });

  it('labels registration fields and exposes appropriate autocomplete hints', () => {
    renderRegister();

    expect(screen.getByLabelText('Full name')).toHaveAttribute(
      'autocomplete',
      'name',
    );
    expect(screen.getByLabelText('Organization')).toHaveAttribute(
      'autocomplete',
      'organization',
    );
    expect(screen.getByLabelText('Work email')).toHaveAttribute(
      'autocomplete',
      'email',
    );
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'autocomplete',
      'new-password',
    );
    expect(screen.getByLabelText('Work email')).toHaveFocus();
  });

  it('announces registration password visibility state', () => {
    renderRegister();

    const showPassword = screen.getByRole('button', {
      name: 'Show password',
    });
    expect(showPassword).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'type',
      'password',
    );

    fireEvent.click(showPassword);

    expect(
      screen.getByRole('button', { name: 'Hide password' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
  });

  it('announces registration validation errors', () => {
    renderRegister();

    fireEvent.submit(
      screen.getByRole('button', { name: 'Create account' }).closest('form')!,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('All fields are required.');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  it('requires agreement to the registration terms', () => {
    renderRegister();

    fireEvent.change(screen.getByLabelText('Full name'), {
      target: { value: 'Ama Mensah' },
    });
    fireEvent.change(screen.getByLabelText('Work email'), {
      target: { value: 'ama@landmark.example' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'premium-exchange' },
    });
    fireEvent.submit(
      screen.getByRole('button', { name: 'Create account' }).closest('form')!,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'You must agree to the terms of service.',
    );
  });

  it('rejects an email that is already registered', () => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();
    localStorage.setItem(
      'vantage_users',
      JSON.stringify([
        {
          id: 'usr_existing',
          name: 'Existing Member',
          email: 'ama@landmark.example',
          password: 'existing-password',
          role: 'buyer',
        },
      ]),
    );
    try {
      render(
        <Register
          onSuccess={onSuccess}
          onSwitchToSignIn={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      fireEvent.change(screen.getByLabelText('Full name'), {
        target: { value: 'Ama Mensah' },
      });
      fireEvent.change(screen.getByLabelText('Work email'), {
        target: { value: 'AMA@LANDMARK.EXAMPLE' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'premium-exchange' },
      });
      fireEvent.click(
        screen.getByRole('checkbox', {
          name: 'I agree to the terms of service and privacy policy',
        }),
      );
      fireEvent.click(
        screen.getByRole('button', { name: 'Create account' }),
      );
      act(() => vi.advanceTimersByTime(1000));

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Email already registered. Try signing in instead.',
      );
      expect(onSuccess).not.toHaveBeenCalled();
      expect(JSON.parse(localStorage.getItem('vantage_users')!)).toHaveLength(1);
    } finally {
      vi.useRealTimers();
      localStorage.clear();
    }
  });

  it('persists a publisher registration and returns its public user payload', () => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();
    localStorage.clear();
    try {
      render(
        <Register
          onSuccess={onSuccess}
          onSwitchToSignIn={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      fireEvent.change(screen.getByLabelText('Full name'), {
        target: { value: 'Ama Mensah' },
      });
      fireEvent.change(screen.getByLabelText('Organization'), {
        target: { value: 'Accra Landmark Media' },
      });
      fireEvent.change(screen.getByLabelText('Work email'), {
        target: { value: 'ama@landmark.example' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'premium-exchange' },
      });
      fireEvent.click(screen.getByRole('radio', { name: 'Publisher' }));
      fireEvent.click(
        screen.getByRole('checkbox', {
          name: 'I agree to the terms of service and privacy policy',
        }),
      );
      fireEvent.click(
        screen.getByRole('button', { name: 'Create account' }),
      );

      expect(
        screen.getByRole('button', { name: 'Creating account…' }),
      ).toBeDisabled();
      act(() => vi.advanceTimersByTime(1000));

      expect(onSuccess).toHaveBeenCalledWith({
        id: expect.stringMatching(/^usr_/),
        name: 'Ama Mensah',
        email: 'ama@landmark.example',
        role: 'publisher',
        company: 'Accra Landmark Media',
      });
      expect(JSON.parse(localStorage.getItem('vantage_users')!)).toEqual([
        expect.objectContaining({
          name: 'Ama Mensah',
          email: 'ama@landmark.example',
          password: 'premium-exchange',
          role: 'publisher',
          company: 'Accra Landmark Media',
        }),
      ]);
    } finally {
      vi.useRealTimers();
      localStorage.clear();
    }
  });

  it('keeps registration inputs immutable while submission is loading', () => {
    vi.useFakeTimers();
    try {
      renderRegister();

      const name = screen.getByLabelText('Full name');
      const organization = screen.getByLabelText('Organization');
      const email = screen.getByLabelText('Work email');
      const password = screen.getByLabelText('Password');
      const advertiser = screen.getByRole('radio', { name: 'Buyer' });
      const publisher = screen.getByRole('radio', { name: 'Publisher' });
      const consent = screen.getByRole('checkbox', {
        name: 'I agree to the terms of service and privacy policy',
      });

      fireEvent.change(name, { target: { value: 'Ama Mensah' } });
      fireEvent.change(organization, {
        target: { value: 'Accra Landmark Media' },
      });
      fireEvent.change(email, {
        target: { value: 'ama@landmark.example' },
      });
      fireEvent.change(password, {
        target: { value: 'premium-exchange' },
      });
      fireEvent.click(consent);
      fireEvent.click(
        screen.getByRole('button', { name: 'Create account' }),
      );

      expect(name).toBeDisabled();
      expect(organization).toBeDisabled();
      expect(email).toBeDisabled();
      expect(password).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'Show password' }),
      ).toBeDisabled();
      expect(advertiser).toBeDisabled();
      expect(publisher).toBeDisabled();
      expect(consent).toBeDisabled();
      expect(advertiser).toBeChecked();
      expect(consent).toBeChecked();

      fireEvent.keyDown(document, { key: 'Escape' });
    } finally {
      vi.useRealTimers();
    }
  });

  it('preserves the fallback organization for registrations without one', () => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();
    localStorage.clear();
    try {
      render(
        <Register
          onSuccess={onSuccess}
          onSwitchToSignIn={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      fireEvent.change(screen.getByLabelText('Full name'), {
        target: { value: 'Ama Mensah' },
      });
      fireEvent.change(screen.getByLabelText('Work email'), {
        target: { value: 'ama@landmark.example' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'premium-exchange' },
      });
      fireEvent.click(
        screen.getByRole('checkbox', {
          name: 'I agree to the terms of service and privacy policy',
        }),
      );
      fireEvent.click(
        screen.getByRole('button', { name: 'Create account' }),
      );
      act(() => vi.advanceTimersByTime(1000));

      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ company: 'Autonomous Agent Co.' }),
      );
      expect(JSON.parse(localStorage.getItem('vantage_users')!)).toEqual([
        expect.objectContaining({ company: 'Autonomous Agent Co.' }),
      ]);
    } finally {
      vi.useRealTimers();
      localStorage.clear();
    }
  });

  it('switches to sign in from the secondary registration action', () => {
    const onSwitchToSignIn = vi.fn();
    render(
      <Register
        onSuccess={vi.fn()}
        onSwitchToSignIn={onSwitchToSignIn}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(onSwitchToSignIn).toHaveBeenCalledOnce();
  });

  it('cancels pending registration when the dialog is canceled', () => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();
    const onCancel = vi.fn();
    localStorage.clear();
    try {
      render(
        <Register
          onSuccess={onSuccess}
          onSwitchToSignIn={vi.fn()}
          onCancel={onCancel}
        />,
      );
      fireEvent.change(screen.getByLabelText('Full name'), {
        target: { value: 'Ama Mensah' },
      });
      fireEvent.change(screen.getByLabelText('Work email'), {
        target: { value: 'ama@landmark.example' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'premium-exchange' },
      });
      fireEvent.click(
        screen.getByRole('checkbox', {
          name: 'I agree to the terms of service and privacy policy',
        }),
      );
      fireEvent.click(
        screen.getByRole('button', { name: 'Create account' }),
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      act(() => vi.advanceTimersByTime(1000));

      expect(onCancel).toHaveBeenCalledOnce();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(localStorage.getItem('vantage_users')).toBeNull();
    } finally {
      vi.useRealTimers();
      localStorage.clear();
    }
  });

  it('cancels pending registration and switches to sign in', () => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();
    const onSwitchToSignIn = vi.fn();
    localStorage.clear();
    try {
      render(
        <Register
          onSuccess={onSuccess}
          onSwitchToSignIn={onSwitchToSignIn}
          onCancel={vi.fn()}
        />,
      );
      fireEvent.change(screen.getByLabelText('Full name'), {
        target: { value: 'Ama Mensah' },
      });
      fireEvent.change(screen.getByLabelText('Work email'), {
        target: { value: 'ama@landmark.example' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'premium-exchange' },
      });
      fireEvent.click(
        screen.getByRole('checkbox', {
          name: 'I agree to the terms of service and privacy policy',
        }),
      );
      fireEvent.click(
        screen.getByRole('button', { name: 'Create account' }),
      );

      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
      act(() => vi.advanceTimersByTime(1000));

      expect(onSwitchToSignIn).toHaveBeenCalledOnce();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(localStorage.getItem('vantage_users')).toBeNull();
    } finally {
      vi.useRealTimers();
      localStorage.clear();
    }
  });

  it('cancels pending registration when unmounted', () => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();
    localStorage.clear();
    try {
      const { unmount } = render(
        <Register
          onSuccess={onSuccess}
          onSwitchToSignIn={vi.fn()}
          onCancel={vi.fn()}
        />,
      );
      fireEvent.change(screen.getByLabelText('Full name'), {
        target: { value: 'Ama Mensah' },
      });
      fireEvent.change(screen.getByLabelText('Work email'), {
        target: { value: 'ama@landmark.example' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'premium-exchange' },
      });
      fireEvent.click(
        screen.getByRole('checkbox', {
          name: 'I agree to the terms of service and privacy policy',
        }),
      );
      fireEvent.click(
        screen.getByRole('button', { name: 'Create account' }),
      );

      unmount();
      act(() => vi.advanceTimersByTime(1000));

      expect(onSuccess).not.toHaveBeenCalled();
      expect(localStorage.getItem('vantage_users')).toBeNull();
    } finally {
      vi.useRealTimers();
      localStorage.clear();
    }
  });
});
