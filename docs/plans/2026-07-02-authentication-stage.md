# Cinematic Authentication Stage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current Sign In and Register cards with a shared, responsive, cinematic authentication stage that is equally clear for advertisers and publishers and meets WCAG AA.

**Architecture:** Create a shared `AuthStage` component responsible for dialog structure, responsive composition, scroll locking, focus trapping, Escape handling, focus restoration, and common brand narrative. Keep authentication state and submit logic inside `SignIn` and `Register`, but normalize their fields, feedback, role choices, and secondary actions.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, CSS custom properties, Lucide icons, Testing Library, Vitest.

---

### Task 1: Authentication dialog regression tests

**Files:**
- Create: `src/__tests__/AuthModals.test.tsx`
- Test: `src/components/SignIn.tsx`
- Test: `src/components/Register.tsx`

**Step 1: Write failing Sign In semantics test**

Render `SignIn` and assert:

```tsx
expect(screen.getByRole('dialog', { name: 'Sign in to Vantage Point' })).toBeInTheDocument();
expect(screen.getByLabelText('Work email')).toHaveFocus();
expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument();
expect(screen.queryByRole('button', { name: 'Advertiser demo' })).not.toBeInTheDocument();
```

**Step 2: Write failing demo disclosure test**

Click `Explore demo accounts`, then assert Advertiser and Publisher demo buttons are visible with equal semantic treatment.

**Step 3: Write failing Register role test**

Render `Register` and assert it exposes a labelled dialog plus a `radiogroup` named `Account type`, with Advertiser checked initially and Publisher available.

**Step 4: Run tests to verify RED**

Run: `npm test -- src/__tests__/AuthModals.test.tsx`

Expected: failures for missing dialog names, autofocus, disclosure, and radio semantics.

**Step 5: Commit**

```bash
git add src/__tests__/AuthModals.test.tsx
git commit -m "test: define authentication stage behavior"
```

### Task 2: Shared `AuthStage` dialog shell

**Files:**
- Create: `src/components/AuthStage.tsx`
- Modify: `src/index.css`
- Test: `src/__tests__/AuthModals.test.tsx`

**Step 1: Implement dialog lifecycle**

`AuthStage` should:

- Store the previously focused element.
- Lock `document.body.style.overflow`.
- Focus `[data-auth-autofocus]` on mount.
- Close on Escape.
- Trap Tab and Shift+Tab within focusable descendants.
- Restore focus and body overflow on unmount.

**Step 2: Implement semantic structure**

Use:

```tsx
<div className="auth-backdrop" onMouseDown={onCancel}>
  <section
    ref={dialogRef}
    role="dialog"
    aria-modal="true"
    aria-labelledby={titleId}
    aria-describedby={descriptionId}
    className="auth-stage"
    onMouseDown={(event) => event.stopPropagation()}
  >
    <aside className="auth-narrative">...</aside>
    <div className="auth-form-panel">{children}</div>
  </section>
</div>
```

**Step 3: Add responsive cinematic styling**

Add `auth-*` classes using semantic theme tokens:

- Deep blue-black narrative surface.
- Tinted off-white/dark form surface.
- Fraunces display heading and Archivo form copy.
- Full-screen mobile layout.
- Entrance using opacity and translate only.
- Reduced-motion override.

**Step 4: Run focused tests**

Run: `npm test -- src/__tests__/AuthModals.test.tsx`

Expected: dialog lifecycle tests pass; form-specific tests remain red.

**Step 5: Commit**

```bash
git add src/components/AuthStage.tsx src/index.css
git commit -m "feat: add cinematic authentication stage"
```

### Task 3: Refactor Sign In

**Files:**
- Modify: `src/components/SignIn.tsx`
- Test: `src/__tests__/AuthModals.test.tsx`

**Step 1: Replace duplicated modal shell**

Wrap the form in `AuthStage` with:

- Title: `Sign in to Vantage Point`
- Eyebrow: `Secure exchange access`
- Narrative focused equally on campaign and inventory operations.

**Step 2: Normalize form controls**

- Add `id`/`htmlFor`.
- Rename Email to `Work email`.
- Add `autoComplete="email"` and `autoComplete="current-password"`.
- Add `data-auth-autofocus` to email.
- Give password toggle `aria-label` and `aria-pressed`.
- Increase controls to 48px minimum.

**Step 3: Improve feedback**

Use `role="alert"` and `aria-live="polite"` for errors. Preserve submit loading behavior and demo authentication callbacks.

**Step 4: Add progressive demo disclosure**

Keep demo access collapsed until `Explore demo accounts` is activated. Present Advertiser and Publisher as equal primary demo choices and Admin as a quieter full-width option.

**Step 5: Remove dead affordances**

Remove the nonfunctional Forgot Password control. Keep the Sign In/Register switch as the only secondary action below the form.

**Step 6: Run tests to verify GREEN**

Run: `npm test -- src/__tests__/AuthModals.test.tsx`

Expected: Sign In tests pass.

**Step 7: Commit**

```bash
git add src/components/SignIn.tsx src/__tests__/AuthModals.test.tsx
git commit -m "feat: redesign sign in experience"
```

### Task 4: Refactor Register

**Files:**
- Modify: `src/components/Register.tsx`
- Test: `src/__tests__/AuthModals.test.tsx`

**Step 1: Replace duplicated modal shell**

Use `AuthStage` with registration-specific narrative and the title `Create a Vantage Point account`.

**Step 2: Normalize fields**

Add accessible labels, autocomplete attributes, 48px controls, password visibility, and inline error announcements.

**Step 3: Implement equal role selection**

Use a labelled `radiogroup` with two radio buttons:

- Advertiser — plan and book campaigns.
- Publisher — list inventory and approve bookings.

Do not use color as the only selected-state signal.

**Step 4: Improve consent and submit state**

Associate consent with a label, expose terms copy clearly, and disable submission while loading.

**Step 5: Run tests to verify GREEN**

Run: `npm test -- src/__tests__/AuthModals.test.tsx`

Expected: all authentication tests pass.

**Step 6: Commit**

```bash
git add src/components/Register.tsx src/__tests__/AuthModals.test.tsx
git commit -m "feat: redesign account registration"
```

### Task 5: Full verification

**Files:**
- Verify: `src/components/AuthStage.tsx`
- Verify: `src/components/SignIn.tsx`
- Verify: `src/components/Register.tsx`

**Step 1: Run all automated checks**

```bash
npm test
npm run lint
npm run build
```

Expected: all commands exit successfully.

**Step 2: Browser-check desktop**

At 1280×720 verify:

- Sign In and Register both fit without page clipping.
- Demo disclosure opens without layout jumps.
- Error, loading, password visibility, and modal switching work.

**Step 3: Browser-check mobile**

At 390×844 verify:

- Full-screen stage has no horizontal overflow.
- Header and close control remain visible.
- Form content scrolls independently.
- Role choices and primary actions are reachable.

**Step 4: Browser-check both themes**

Verify WCAG AA contrast, visible focus, and reduced-motion behavior in light and cinematic themes.

**Step 5: Commit**

```bash
git add src/components src/__tests__ src/index.css
git commit -m "fix: complete authentication stage redesign"
```
