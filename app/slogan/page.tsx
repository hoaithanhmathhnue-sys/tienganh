import { Suspense } from 'react';
import type { Metadata } from 'next';
import SloganApp from '@/components/slogan-app';

export const metadata: Metadata = {
  title: 'Slogan & câu lệnh lớp học | Teacher English Hub',
  description: 'Thư viện slogan trang trí lớp học và câu lệnh Classroom English kèm IPA, nghĩa tiếng Việt, poster A4 và trình chiếu.',
};

// SloganApp đọc `?view=` bằng useSearchParams nên cần ranh giới Suspense khi prerender.
export default function SloganPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
      <SloganApp />
    </Suspense>
  );
}
