import type { Metadata } from 'next';
import { LearningApp } from '@/components/learning/learning-app';

export const metadata: Metadata = {
  title: 'Học tập | English Classroom Decoration',
  description: 'Tự học mẫu câu, luyện phát âm, theo dõi tiến trình và Daily School English.',
};

export default function LearningPage() {
  return <LearningApp />;
}
