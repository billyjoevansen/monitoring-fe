'use client';

import { useCallback, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import type { ColumnGroup } from '@/components/ui/DocumentDataTable';

interface DocumentRowEditorModalProps {
  open: boolean;
  groups: ColumnGroup[];
  rowData: Record<string, string | number> | null;
  onSave: (updatedRow: Record<string, string | number>) => void;
  onCancel: () => void;
  saving?: boolean;
}

export default function DocumentRowEditorModal({
  open,
  groups,
  rowData,
  onSave,
  onCancel,
  saving = false,
}: DocumentRowEditorModalProps) {
  const initialDraft = useMemo(() => rowData ?? {}, [rowData]);
  const initialTab = useMemo(() => groups[0]?.label ?? '', [groups]);

  const [draft, setDraft] = useState<Record<string, string | number>>(initialDraft);
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleChange = useCallback((key: string, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(() => {
    onSave(draft);
  }, [draft, onSave]);

  if (!rowData) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">Edit Data Baris</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Ubah data pada kolom yang tersedia, lalu klik Simpan.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0">
          <TabsList variant="line" className="w-full justify-start border-b border-gray-200 dark:border-gray-700">
            {groups.map((group) => (
              <TabsTrigger
                key={group.label}
                value={group.label}
                className="text-gray-500 dark:text-gray-400 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 data-[state=active]:border-b-2 data-[state=active]:border-green-600 dark:data-[state=active]:border-green-400 data-[state=active]:bg-transparent rounded-none"
              >
                {group.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="overflow-auto max-h-[50vh] mt-4">
            {groups.map((group) => (
              <TabsContent key={group.label} value={group.label}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {group.columns.map((col) => (
                    <div key={col.key} className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {col.label}
                      </label>
                      <input
                        type="text"
                        value={String(draft[col.key] ?? '')}
                        onChange={(e) => handleChange(col.key, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={saving} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800">
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
