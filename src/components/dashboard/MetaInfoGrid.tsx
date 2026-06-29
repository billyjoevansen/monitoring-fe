interface MetaItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export default function MetaInfoGrid({ items }: { items: MetaItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map(({ icon, label, value }) => (
        <div
          key={label}
          className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-transparent transition-all duration-200 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
        >
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {icon} {label}
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
        </div>
      ))}
    </div>
  );
}
