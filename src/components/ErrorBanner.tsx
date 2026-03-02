import { XCircle } from 'lucide-react';

interface ErrorBannerProps {
  message?: string | null;
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
      <XCircle className="w-5 h-5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
