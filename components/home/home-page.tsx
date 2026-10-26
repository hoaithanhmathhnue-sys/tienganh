'use client';

import { useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Bot,
  CircleCheck,
  FileText,
  LayoutDashboard,
  Megaphone,
  MessageSquareText,
  Mic,
  Sparkles,
  Volume2,
  type LucideIcon,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SpeakButton } from '@/components/slogan/speak-button';
import { chatUiStore } from '@/lib/ai/chat-store';
import { CLASSROOM_PHRASE_COUNT } from '@/lib/classroom-english';
import { DAILY_SCHOOL_GROUPS } from '@/lib/daily-school-english';
import { getDailySchoolSet, LEARNING_SUBJECTS, SELF_STUDY_PHRASES, type DailySchoolSet } from '@/lib/learning-content';
import { cn } from '@/lib/utils';

const PHRASE_TOTAL =
  SELF_STUDY_PHRASES.length + CLASSROOM_PHRASE_COUNT + DAILY_SCHOOL_GROUPS.reduce((sum, group) => sum + group.phrases.length, 0);
/** Làm tròn xuống hàng chục: 974 → "970+". */
const roundedPlus = (n: number) => `${Math.floor(n / 10) * 10}+`;

const HIGHLIGHTS = [
  'Không ép học quá nhiều (5–10 phút/ngày)',
  'Đúng – Ngắn – Tự nhiên – Phù hợp môn học',
  'Bảo toàn 100% mục tiêu bài học gốc',
];

const STATS: { eyebrow: string; title: string; note: string; icon: LucideIcon; href: string; tone: string }[] = [
  {
    eyebrow: 'Chủ đề tự học',
    title: `${LEARNING_SUBJECTS.length} Môn học`,
    note: 'Toán, Tiếng Việt, Mỹ thuật…',
    icon: BookOpen,
    href: '/hoc-tap?tab=study',
    tone: 'bg-blue-50 text-[#1e3a8a] dark:bg-sky-500/15 dark:text-sky-300',
  },
  {
    eyebrow: 'Ngân hàng câu lệnh',
    title: `${roundedPlus(PHRASE_TOTAL)} Câu mẫu`,
    note: 'Đúng ngữ cảnh lớp học',
    icon: Volume2,
    href: '/slogan?view=classroom',
    tone: 'bg-blue-50 text-[#1e3a8a] dark:bg-sky-500/15 dark:text-sky-300',
  },
  {
    eyebrow: 'Trợ lý soạn thảo',
    title: 'AI Bilingual',
    note: 'Chuyển đổi giáo án tự động',
    icon: FileText,
    href: '/giao-an',
    tone: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300',
  },
  {
    eyebrow: 'Phòng luyện nói',
    title: 'AI Speaking Lab',
    note: 'Chấm điểm & nhận xét phát âm',
    icon: Mic,
    href: '/hoc-tap?tab=pronunciation',
    tone: 'bg-blue-50 text-[#1e3a8a] dark:bg-sky-500/15 dark:text-sky-300',
  },
];

const STEPS = [
  { step: '01', title: 'Nghe & nói theo mẫu', text: 'Chọn môn đang dạy, nghe câu mẫu kèm IPA và nghĩa tiếng Việt.', href: '/hoc-tap?tab=study', cta: 'Tự học theo môn' },
  { step: '02', title: 'Luyện phát âm', text: 'Đọc vào micro, nhận điểm từng từ và luyện lại câu chưa tốt.', href: '/hoc-tap?tab=pronunciation', cta: 'Vào phòng luyện nói' },
  { step: '03', title: 'Dùng ngay trong lớp', text: 'Ba câu giao tiếp học đường mỗi ngày — dùng ngay trong tiết học.', href: '/hoc-tap?tab=daily', cta: 'Daily School English' },
];

const TOOLS: { title: string; text: string; icon: LucideIcon; href?: string; action?: () => void }[] = [
  { title: 'Slogan trang trí lớp', text: 'Thư viện slogan có IPA, in poster A4, trình chiếu.', icon: Megaphone, href: '/slogan' },
  { title: 'Câu lệnh lớp học', text: 'Classroom English theo tình huống, luyện nói chấm điểm.', icon: MessageSquareText, href: '/slogan?view=classroom' },
  { title: 'Trợ lý giáo án song ngữ', text: 'Chuyển giáo án sang song ngữ Anh – Việt, xuất Word.', icon: FileText, href: '/giao-an' },
  { title: 'Trợ lý AI sư phạm', text: 'Hỏi nhanh cách nói, gợi ý hoạt động, sửa câu.', icon: Bot, action: () => chatUiStore.open() },
  { title: 'Tạo slogan bằng AI', text: 'Nhập chủ đề, nhận slogan kèm phiên âm và nghĩa.', icon: Sparkles, href: '/slogan?view=ai' },
  { title: 'Tiến trình & huy hiệu', text: 'Chuỗi ngày học, XP và huy hiệu đã mở khóa.', icon: LayoutDashboard, href: '/hoc-tap?tab=progress' },
];

const noopSubscribe = () => () => undefined;
let dailyCache: DailySchoolSet | null = null;
/** Bộ câu của ngày chỉ tính trên trình duyệt (trang prerender tĩnh) để không lệch hydrate. */
const getClientDaily = () => {
  const next = getDailySchoolSet();
  if (!dailyCache || dailyCache.phrases[0]?.id !== next.phrases[0]?.id) dailyCache = next;
  return dailyCache;
};
const getServerDaily = () => null;

export function HomePage() {
  const daily = useSyncExternalStore(noopSubscribe, getClientDaily, getServerDaily);

  return (
    <>
      <main className="mx-auto w-full max-w-[1200px] px-3 pb-12 pt-4 sm:px-4 sm:pt-6">
        {/* ─── HERO ─── */}
        <section aria-labelledby="home-title" className="relative isolate overflow-hidden rounded-[28px] bg-[#1b3a94] shadow-xl">
          <div className="absolute inset-x-0 top-0 -z-10 h-60 md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-[60%]">
            <Image
              src="/truong.jpg"
              alt="Cổng Trường Tiểu học Bế Văn Đàn"
              fill
              priority
              sizes="(min-width: 768px) 60vw, 100vw"
              className="object-cover object-[30%_40%]"
            />
          </div>
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent from-[0px] via-[#1b3a94]/70 via-[150px] to-[#1b3a94] to-[240px] md:bg-gradient-to-r md:from-[#1b3a94] md:from-[38%] md:via-[#1b3a94]/70 md:via-[50%] md:to-transparent md:to-[66%]"
            aria-hidden="true"
          />
          <div className="px-5 pb-10 pt-48 sm:px-10 sm:pb-14 md:pt-14 lg:px-14 lg:py-16">
            <h1 id="home-title" className="max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl">
              English for Primary Teachers
            </h1>
            <p className="mt-5 font-display text-lg font-extrabold uppercase tracking-wide text-amber-300 sm:text-2xl lg:text-3xl">
              Learn – Teach – Use English every day
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              Trợ lý AI hỗ trợ giáo viên văn hóa tiểu học từng bước tự học Tiếng Anh thực hành và chuyển đổi giáo án song ngữ chuẩn sư phạm.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/hoc-tap?tab=study"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-6 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-blue-900/30 transition-colors hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <BookOpen className="h-5 w-5" aria-hidden="true" /> Bắt đầu tự học <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/giao-an"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 text-sm font-extrabold uppercase tracking-wide text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <Sparkles className="h-5 w-5 text-amber-300" aria-hidden="true" /> Tạo giáo án song ngữ
              </Link>
            </div>
            <ul className="mt-8 flex max-w-3xl flex-wrap gap-x-8 gap-y-3 text-sm text-white/90">
              {HIGHLIGHTS.map((text) => (
                <li key={text} className="inline-flex items-center gap-2">
                  <CircleCheck className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" /> {text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── THẺ TÍNH NĂNG ─── */}
        <section aria-label="Tính năng chính" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ eyebrow, title, note, icon: Icon, href, tone }) => (
            <Link
              key={eyebrow}
              href={href}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4ed8]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="pt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{eyebrow}</p>
                <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tone)}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-extrabold text-foreground sm:text-[28px]">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{note}</p>
            </Link>
          ))}
        </section>

        {/* ─── LỘ TRÌNH & CÂU CỦA NGÀY ─── */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <section aria-labelledby="steps-title" className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[#1d4ed8] dark:text-sky-300">5–10 phút mỗi ngày</p>
            <h2 id="steps-title" className="mt-1 font-display text-2xl font-extrabold">Lộ trình tự học cho giáo viên</h2>
            <ol className="mt-5 space-y-3">
              {STEPS.map((item) => (
                <li key={item.step} className="flex gap-4 rounded-2xl bg-muted/50 p-4">
                  <span className="font-display text-2xl font-extrabold text-[#1d4ed8] dark:text-sky-300">{item.step}</span>
                  <div className="min-w-0">
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.text}</p>
                    <Link href={item.href} className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[#1d4ed8] hover:underline dark:text-sky-300">
                      {item.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="today-title" className="rounded-3xl bg-gradient-to-br from-[#0B1736] to-[#1e3a8a] p-5 text-white shadow-lg sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-300">Today’s English</p>
            <h2 id="today-title" className="mt-1 font-display text-2xl font-extrabold">
              {daily ? `${daily.icon} ${daily.title}` : 'Giao tiếp học đường hôm nay'}
            </h2>
            {daily && <p className="mt-1 text-sm text-indigo-100">{daily.description}</p>}
            <ul className="mt-4 space-y-3">
              {daily
                ? daily.phrases.map((phrase) => (
                    <li key={phrase.id} className="flex items-start gap-3 rounded-2xl bg-white/10 p-3">
                      <SpeakButton text={phrase.en} variant="onDark" showLabel={false} />
                      <div className="min-w-0">
                        <p lang="en" className="font-bold">“{phrase.en}”</p>
                        <p className="text-sm text-indigo-100">{phrase.vi}</p>
                        <p className="mt-0.5 text-xs text-indigo-200/90">🏫 {phrase.context}</p>
                      </div>
                    </li>
                  ))
                : Array.from({ length: 3 }, (_, index) => <li key={index} className="h-20 animate-pulse rounded-2xl bg-white/10" />)}
            </ul>
            <Link
              href="/hoc-tap?tab=daily"
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-amber-950 transition-colors hover:bg-amber-300"
            >
              Học Daily School English <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </div>

        {/* ─── CÔNG CỤ ─── */}
        <section aria-labelledby="tools-title" className="mt-10">
          <h2 id="tools-title" className="font-display text-2xl font-extrabold">Công cụ cho lớp học</h2>
          <p className="mt-1 text-sm text-muted-foreground">Mọi tính năng đều chạy ngay trên trình duyệt — dữ liệu học tập lưu trên máy của thầy/cô.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map(({ title, text, icon: Icon, href, action }) => {
              const body = (
                <>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1e3a8a] dark:bg-sky-500/15 dark:text-sky-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-foreground">{title}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{text}</span>
                  </span>
                </>
              );
              const className =
                'flex h-full w-full items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4ed8]';
              return href ? (
                <Link key={title} href={href} className={className}>
                  {body}
                </Link>
              ) : (
                <button key={title} type="button" onClick={action} className={className}>
                  {body}
                </button>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
