import type { Metadata } from 'next';
import { LessonApp } from '@/components/lesson/lesson-app';

export const metadata: Metadata = {
  title: 'Soạn giáo án song ngữ | English Classroom Decoration',
  description: 'Soạn giáo án song ngữ Anh – Việt, xem trước, in và xuất Word.',
};

export default function LessonPage() {
  return <LessonApp />;
}
