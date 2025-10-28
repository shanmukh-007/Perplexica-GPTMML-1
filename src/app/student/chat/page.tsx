'use client';

import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import StudentChatWindow from '@/components/StudentChatWindow';
import Loader from '@/components/ui/Loader';

function StudentChatContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'documents'; // documents, mcq, mindmap, websearch

  return <StudentChatWindow mode={mode} />;
}

const StudentChatPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-row items-center justify-center min-h-screen">
          <Loader />
        </div>
      }
    >
      <StudentChatContent />
    </Suspense>
  );
};

export default StudentChatPage;

