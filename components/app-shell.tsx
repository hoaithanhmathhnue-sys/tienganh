'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpenCheck,
  Bot,
  ChevronDown,
  FileText,
  Flame,
  GraduationCap,
  House,
  LayoutDashboard,
  Megaphone,
  Menu,
  MessageSquareText,
  Mic,
  Settings2,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import { AiAssistant } from '@/components/ai/ai-assistant';
import { ApiSettingsDialog } from '@/components/ai/api-settings-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { chatUiStore, useChatUi } from '@/lib/ai/chat-store';
import { isAiReady, useAiSettings } from '@/lib/ai/settings-store';
import { appUiStore, useAppUi } from '@/lib/app-ui-store';
import { useLearningProgress } from '@/lib/learning-progress';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  description: string;
  icon: LucideIcon;
  /** Đường dẫn; bỏ trống khi mục là một hành động (ví dụ mở Trợ lý AI). */
  href?: string;
  onSelect?: () => void;
}

interface MenuGroup {
  id: 'learning' | 'assistant';
  label: string;
  icon: LucideIcon;
  /** Trang thuộc nhóm — dùng để tô sáng mục đang mở. */
  paths: string[];
  items: MenuItem[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    id: 'learning',
    label: 'Học tập',
    icon: GraduationCap,
    paths: ['/hoc-tap', '/slogan'],
    items: [
      { label: 'Tự học theo môn', description: '10 môn học, nghe mẫu và đánh dấu đã học', icon: BookOpenCheck, href: '/hoc-tap?tab=study' },
      { label: 'Phòng luyện nói', description: 'Đọc vào micro và nhận điểm phát âm', icon: Mic, href: '/hoc-tap?tab=pronunciation' },
      { label: 'Daily School English', description: 'Giao tiếp học đường mỗi ngày', icon: MessageSquareText, href: '/hoc-tap?tab=daily' },
      { label: 'Tiến trình & huy hiệu', description: 'Chuỗi ngày học, XP và huy hiệu', icon: LayoutDashboard, href: '/hoc-tap?tab=progress' },
      { label: 'Slogan & câu lệnh lớp học', description: 'Trang trí lớp, in poster, trình chiếu', icon: Megaphone, href: '/slogan' },
    ],
  },
  {
    id: 'assistant',
    label: 'Trợ lý',
    icon: Sparkles,
    paths: ['/giao-an'],
    items: [
      { label: 'Trợ lý giáo án song ngữ', description: 'Chuyển giáo án sang song ngữ, xuất Word', icon: FileText, href: '/giao-an' },
      { label: 'Trợ lý AI sư phạm', description: 'Hỏi đáp, gợi ý hoạt động, câu lệnh', icon: Bot, onSelect: () => chatUiStore.open() },
      { label: 'Tạo slogan bằng AI', description: 'Slogan theo chủ đề kèm IPA và nghĩa', icon: Sparkles, href: '/slogan?view=ai' },
    ],
  },
];

const isGroupActive = (group: MenuGroup, pathname: string) => group.paths.some((path) => pathname.startsWith(path));

/** Khung chung cho mọi trang: thanh điều hướng, cài đặt AI và trợ lý AI nổi. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ui = useAppUi();
  const chatUi = useChatUi();
  const aiReady = isAiReady(useAiSettings());
  const progress = useLearningProgress();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarOpen = chatUi.open && chatUi.expanded && !ui.presenting;
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className={cn('min-h-screen bg-background transition-[padding] duration-300', sidebarOpen && 'lg:pr-[440px]')}>
      <div className="print:hidden">
        <div className="bg-[#0B1736] text-white">
          <p className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-[11px] sm:text-xs">
            <span className="rounded bg-[#1d4ed8] px-2 py-0.5 font-bold uppercase tracking-wide">Teacher English Hub</span>
            <span className="font-semibold uppercase tracking-wide">Learn – Teach – Use English every day</span>
            <span className="hidden text-white/75 md:inline">· Học để sử dụng – AI đồng hành cùng giáo viên tiểu học</span>
          </p>
        </div>

        <header className="relative z-40 border-b border-border bg-card">
          <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-3 py-3 sm:px-4">
            <Link
              href="/"
              onClick={closeMobile}
              className="flex min-w-0 shrink-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4ed8]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1e3a8a] text-white shadow-sm">
                <GraduationCap className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="flex items-center gap-2">
                  <span className="truncate font-display text-base font-extrabold tracking-tight text-[#0B1736] dark:text-white sm:text-xl">
                    TEACHER ENGLISH <span className="text-[#1d4ed8] dark:text-sky-300">HUB</span>
                  </span>
                  <span className="hidden rounded-md border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300 sm:inline">
                    Tiểu học
                  </span>
                </span>
                <span className="hidden text-xs text-muted-foreground sm:block">Trợ lý Tiếng Anh &amp; Giáo án Song ngữ</span>
              </span>
            </Link>

            <nav aria-label="Điều hướng chính" className="hidden flex-1 justify-center lg:flex">
              <ul className="flex items-center gap-1">
                <li>
                  <Link
                    href="/"
                    aria-current={pathname === '/' ? 'page' : undefined}
                    className={cn(navItemClass, pathname === '/' ? navActiveClass : navIdleClass)}
                  >
                    <House className="h-4 w-4" aria-hidden="true" /> Trang chủ
                  </Link>
                </li>
                {MENU_GROUPS.map((group) => (
                  <NavDropdown key={group.id} group={group} active={isGroupActive(group, pathname)} />
                ))}
              </ul>
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <Link
                href="/hoc-tap?tab=progress"
                className="hidden min-h-11 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 text-sm font-bold text-orange-600 transition-colors hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300 md:inline-flex"
                aria-label={`Chuỗi tự học ${progress.currentStreak} ngày, ${progress.xp} XP`}
              >
                <Flame className="h-4 w-4" aria-hidden="true" />
                {progress.currentStreak} ngày
                <span className="h-4 w-px bg-orange-300 dark:bg-orange-500/40" aria-hidden="true" />
                {progress.xp} XP
              </Link>
              <button
                type="button"
                onClick={appUiStore.openSettings}
                className="relative inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1e3a8a] px-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1d4ed8] sm:px-4"
                aria-label={aiReady ? 'Cài đặt AI (đã cấu hình)' : 'Cài đặt AI (chưa có API key)'}
              >
                <Settings2 className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Cài đặt AI</span>
                <span
                  className={cn('absolute -right-1 -top-1 h-3 w-3 rounded-full ring-2 ring-card', aiReady ? 'bg-emerald-400' : 'bg-amber-400')}
                  aria-hidden="true"
                />
              </button>
              <ThemeToggle tone="onLight" className="hidden sm:inline-flex" />
              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted lg:hidden"
              >
                {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <nav id="mobile-menu" aria-label="Điều hướng chính" className="border-t border-border bg-card px-3 pb-4 pt-2 shadow-lg lg:hidden">
              <Link
                href="/"
                onClick={closeMobile}
                aria-current={pathname === '/' ? 'page' : undefined}
                className={cn(navItemClass, 'w-full', pathname === '/' ? navActiveClass : navIdleClass)}
              >
                <House className="h-4 w-4" aria-hidden="true" /> Trang chủ
              </Link>
              {MENU_GROUPS.map((group) => (
                <div key={group.id} className="mt-3">
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{group.label}</p>
                  <ul className="mt-1 grid gap-1 sm:grid-cols-2">
                    {group.items.map((item) => (
                      <li key={item.label}>
                        <MenuEntry item={item} onDone={closeMobile} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 sm:hidden">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 dark:text-orange-300">
                  <Flame className="h-4 w-4" aria-hidden="true" /> {progress.currentStreak} ngày · {progress.xp} XP
                </span>
                <ThemeToggle tone="onLight" />
              </div>
            </nav>
          )}
        </header>
      </div>

      {children}

      <ApiSettingsDialog open={ui.settingsOpen} onClose={appUiStore.closeSettings} />
      <div className="print:hidden">
        <AiAssistant onOpenSettings={appUiStore.openSettings} hidden={ui.presenting} />
      </div>
    </div>
  );
}

const navItemClass =
  'inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4ed8]';
const navActiveClass = 'bg-[#1e3a8a] text-white shadow-sm';
const navIdleClass = 'text-slate-600 hover:bg-muted hover:text-foreground dark:text-slate-300';

function NavDropdown({ group, active }: { group: MenuGroup; active: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);
  const Icon = group.icon;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <li ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(navItemClass, active ? navActiveClass : navIdleClass)}
      >
        <Icon className="h-4 w-4" aria-hidden="true" /> {group.label}
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && (
        <ul className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-xl">
          {group.items.map((item) => (
            <li key={item.label}>
              <MenuEntry item={item} onDone={() => setOpen(false)} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function MenuEntry({ item, onDone }: { item: MenuItem; onDone: () => void }) {
  const Icon = item.icon;
  const className =
    'flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4ed8]';
  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1e3a8a] dark:bg-sky-500/15 dark:text-sky-300">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-foreground">{item.label}</span>
        <span className="block text-xs text-muted-foreground">{item.description}</span>
      </span>
    </>
  );
  if (item.href) {
    return (
      <Link href={item.href} onClick={onDone} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        item.onSelect?.();
        onDone();
      }}
      className={className}
    >
      {content}
    </button>
  );
}
