// ─── InputField ────────────────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  desc: string;
  type: string;
  value: string | number;
  step?: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}

export function InputField({ label, desc, type, value, step, disabled, onChange }: InputFieldProps) {
  return (
    <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      <p className="text-xs text-muted-foreground mb-1">{desc}</p>
      <input
        type={type}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
      />
    </div>
  );
}

// ─── SelectField ───────────────────────────────────────────────────────────────

interface SelectFieldProps {
  label: string;
  desc: string;
  value: string;
  options: string[];
  disabled?: boolean;
  onChange: (v: string) => void;
}

export function SelectField({ label, desc, value, options, disabled, onChange }: SelectFieldProps) {
  return (
    <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      <p className="text-xs text-muted-foreground mb-1">{desc}</p>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── CheckboxField ─────────────────────────────────────────────────────────────

interface CheckboxFieldProps {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function CheckboxField({ label, desc, checked, onChange }: CheckboxFieldProps) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500"
      />
      <div>
        <label className="text-sm font-semibold text-foreground">{label}</label>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
