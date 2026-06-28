// ─── InputField ────────────────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  desc: string;
  type: string;
  value: string | number;
  step?: string;
  onChange: (v: string) => void;
}

export function InputField({ label, desc, type, value, step, onChange }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      <p className="text-xs text-muted-foreground mb-1">{desc}</p>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
  onChange: (v: string) => void;
}

export function SelectField({ label, desc, value, options, onChange }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      <p className="text-xs text-muted-foreground mb-1">{desc}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
