const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
};

interface SummaryCardProps {
  label: string;
  value: number;
  color: string;
  sub?: string;
}

export default function SummaryCard({ label, value, color, sub }: SummaryCardProps) {
  return (
    <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
      <p className="text-[10px] font-medium opacity-75 uppercase">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
      {sub && <p className="text-xs opacity-75 mt-0.5">{sub}</p>}
    </div>
  );
}
