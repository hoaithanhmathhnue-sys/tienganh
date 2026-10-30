import type { Metadata } from 'next';
import { AuthorPage } from '@/components/author/author-page';

export const metadata: Metadata = {
  title: 'Tác giả | Teacher English Hub',
  description: 'Thông tin tác giả và liên hệ: Giáo viên Nguyễn Thị Thoa, Trường Tiểu học Bế Văn Đàn, Đà Nẵng.',
};

export default function Page() {
  return <AuthorPage />;
}
