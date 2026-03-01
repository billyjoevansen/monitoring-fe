interface MiniCardProps {
  label: string;
  value: number | string;
}

export default function MiniCard({ label, value }: MiniCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-800">{String(value)}</p>
    </div>
  );
}
