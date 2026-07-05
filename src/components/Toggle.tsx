interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  descriptionId?: string;
  disabled?: boolean;
}

export default function Toggle({ checked, onChange, label, descriptionId, disabled }: ToggleProps) {
  return (
    <button type="button" role="switch" aria-checked={checked}
      aria-label={label} aria-describedby={descriptionId} disabled={disabled}
      onClick={onChange} className={`vp-switch${checked ? ' on' : ''}`}>
      <span />
    </button>
  );
}
