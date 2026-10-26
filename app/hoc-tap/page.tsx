import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LearningApp } from '@/components/learning/learning-app';

export const metadata: Metadata = {
  title: 'Học tập | Teacher English Hub',
  description: 'Tự học mẫu câu theo 10 môn học, luyện phát âm, theo dõi tiến trình và Daily School English.',
};

// LearningApp đọc `?tab=` bằng useSearchParams nên cần ranh giới Suspense khi prerender.
export default function LearningPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
      <LearningApp />
    </Suspense>
  );
}
