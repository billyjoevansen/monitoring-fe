interface MiniCardProps {
  label: string;
  value: number | string;
}

export default function MiniCard({ label, value }: MiniCardProps) {
  return (
    <div className="bg-background border border-gray-200 rounded-lg p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{String(value)}</p>
    </div>
  );
}
