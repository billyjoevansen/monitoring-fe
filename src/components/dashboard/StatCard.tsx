interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
  iconBg: string;
}

export default function StatCard({ icon, label, value, sub, gradient, iconBg }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 ${gradient}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {sub && <p className="text-xs opacity-70">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      {/* Decorative circle */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 bg-current" />
    </div>
  );
}
