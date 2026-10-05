'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, User, Users } from 'lucide-react';
import { recordVisit, type VisitData } from '@/lib/visit-counter';

// Chỉ ghi nhận một lần mỗi lần tải trang (tránh đếm đôi do React Strict Mode).
let visitPromise: Promise<VisitData> | null = null;

export function VisitCounter() {
  const [data, setData] = useState<VisitData | null>(null);

  useEffect(() => {
    let alive = true;
    visitPromise ??= recordVisit();
    visitPromise.then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!data) return <div className="h-9" aria-hidden="true" />;

  const fmt = (n: number) => n.toLocaleString('vi-VN');

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-xs" aria-label="Thống kê lượt truy cập">
      {data.total !== null && (
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
          </span>
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          <span><strong className="text-sm">{fmt(data.total)}</strong> lượt truy cập</span>
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5">
        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
        Hôm nay: <strong>{fmt(data.today)}</strong>
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5">
        <User className="h-3.5 w-3.5" aria-hidden="true" />
        Bạn: <strong>{fmt(data.mine)}</strong> lần
      </span>
    </div>
  );
}
