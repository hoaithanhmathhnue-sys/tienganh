import Image from 'next/image';
import Link from 'next/link';
import { VisitCounter } from '@/components/visit-counter';
import { AUTHOR, formatPhone } from '@/lib/author';

/** Chân trang chung: thông tin nhà trường, tác giả và bộ đếm lượt truy cập. */
export function SiteFooter() {
  return (
    <footer className="bg-[#004D40] text-white print:hidden">
      <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-8 md:pb-8">
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white">
            <Image src="/logo.jpg" alt="Logo Trường TH Bế Văn Đàn" fill sizes="56px" className="object-cover" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-lg font-semibold">Trường Tiểu học Bế Văn Đàn</p>
            <p className="text-sm text-white/85">Be Van Dan Primary School — 390 Hà Huy Tập, Phường An Khê, TP. Đà Nẵng</p>
            <p className="mt-1 text-xs text-white/75">Teacher English Hub — trợ lý tiếng Anh và giáo án song ngữ cho giáo viên tiểu học</p>
          </div>
        </div>
        <div className="mt-6 border-t border-white/20 pt-4 text-center text-sm md:text-left">
          <p className="font-semibold">
            Tác giả:{' '}
            <Link href="/tac-gia" className="underline-offset-2 hover:underline">
              {AUTHOR.role} {AUTHOR.name}
            </Link>
          </p>
          <p className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-white/85 md:justify-start">
            <a href={`mailto:${AUTHOR.email}`} className="hover:underline">
              Email: {AUTHOR.email}
            </a>
            <a href={`tel:${AUTHOR.phone}`} className="hover:underline">
              Điện thoại/Zalo: {formatPhone(AUTHOR.phone)}
            </a>
          </p>
          <p className="mt-1 text-white/75">
            Đơn vị: {AUTHOR.school}, {AUTHOR.address}
          </p>
        </div>
        <div className="mt-6 border-t border-white/20 pt-4">
          <VisitCounter />
          <p className="mt-3 text-center text-xs text-white/70">© 2024 – 2026 Trường TH Bế Văn Đàn. Thiết kế phục vụ giáo dục.</p>
        </div>
      </div>
    </footer>
  );
}
