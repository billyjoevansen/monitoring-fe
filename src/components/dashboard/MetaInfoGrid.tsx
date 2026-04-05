interface MetaItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export default function MetaInfoGrid({ items }: { items: MetaItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map(({ icon, label, value }) => (
        <div key={label} className="bg-background rounded-xl p-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {icon} {label}
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
        </div>
      ))}
    </div>
  );
}
