'use client';

import { useState } from 'react';
import { FileUp } from 'lucide-react';
import DocumentUploadModal from './DocumentUploadModal';

interface FloatingDocButtonProps {
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
}

export default function FloatingDocButton({ userId, userEmail, userName, userRole }: FloatingDocButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center p-3.5 rounded-xl bg-emerald-600 text-white shadow-2xl hover:bg-emerald-700 transition-all duration-200 hover:scale-105"
          title="Dokumen Pendukung"
        >
          <FileUp className="w-5 h-5" />
        </button>
      </div>

      {open && <DocumentUploadModal userId={userId} userEmail={userEmail} userName={userName} userRole={userRole} onClose={() => setOpen(false)} />}
    </>
  );
}
