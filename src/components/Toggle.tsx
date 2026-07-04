interface ToggleProps { checked: boolean; onChange: () => void; }

export default function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button type="button" role="switch" aria-checked={checked}
      onClick={onChange} className={`vp-switch${checked ? ' on' : ''}`}>
      <span />
    </button>
  );
}
