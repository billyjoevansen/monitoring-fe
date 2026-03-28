import { ScrollText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LogsHeaderProps {
  onRefresh: () => void;
}

export function LogsHeader({ onRefresh }: LogsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
          <ScrollText className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Log Aktivitas</h1>
          <p className="text-muted-foreground mt-1">
            Pantau seluruh aktivitas pengguna dalam sistem
          </p>
        </div>
      </div>
      <Button onClick={onRefresh} variant="outline" size="sm">
        <RefreshCw className="w-4 h-4" />
        Refresh
      </Button>
    </div>
  );
}
