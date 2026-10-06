'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Megaphone, Settings2 } from 'lucide-react';
import { AiAssistant } from '@/components/ai/ai-assistant';
import { ApiSettingsDialog } from '@/components/ai/api-settings-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { useChatUi } from '@/lib/ai/chat-store';
import { isAiReady, useAiSettings } from '@/lib/ai/settings-store';
import { appUiStore, useAppUi } from '@/lib/app-ui-store';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Slogan & câu lệnh', short: 'Slogan', icon: Megaphone },
  { href: '/giao-an', label: 'Trợ lý giáo án', short: 'Giáo án', icon: FileText },
] as const;

/** Khung chung cho mọi trang: thanh điều hướng, cài đặt AI và trợ lý AI nổi. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ui = useAppUi();
  const chatUi = useChatUi();
  const aiReady = isAiReady(useAiSettings());
  const sidebarOpen = chatUi.open && chatUi.expanded && !ui.presenting;

  return (
    <div className={cn('min-h-screen bg-background transition-[padding] duration-300', sidebarOpen && 'lg:pr-[440px]')}>
      <nav aria-label="Điều hướng chính" className="bg-[#0B1736] text-white print:hidden">
        <div className="mx-auto flex max-w-[1200px] items-center gap-2 px-3 py-2 sm:px-4">
          <Link href="/" className="mr-1 flex shrink-0 items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
            <span className="relative h-9 w-9 overflow-hidden rounded-full bg-white ring-2 ring-white/30">
              <Image src="/logo.jpg" alt="Trang chủ – Trường TH Bế Văn Đàn" fill sizes="36px" className="object-cover" />
            </span>
            <span className="hidden font-display text-sm font-bold leading-tight lg:block">
              English Classroom
              <span className="block text-[11px] font-medium text-white/70">TH Bế Văn Đàn</span>
            </span>
          </Link>

          <ul className="flex min-w-0 flex-1 items-center gap-1">
            {NAV_ITEMS.map(({ href, label, short, icon: Icon }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300',
                      active ? 'bg-white text-[#0B1736] shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="sm:hidden">{short}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={appUiStore.openSettings}
            className="relative inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-medium text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            aria-label={aiReady ? 'Cài đặt AI (đã cấu hình)' : 'Cài đặt AI (chưa có API key)'}
          >
            <Settings2 className="h-5 w-5" aria-hidden="true" />
            <span className="hidden md:inline">Cài đặt AI</span>
            <span
              className={cn('absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#0B1736]', aiReady ? 'bg-emerald-400' : 'bg-amber-400')}
              aria-hidden="true"
            />
          </button>
          <ThemeToggle className="shrink-0 bg-white/10 hover:bg-white/20" />
        </div>
      </nav>

      {children}

      <ApiSettingsDialog open={ui.settingsOpen} onClose={appUiStore.closeSettings} />
      <div className="print:hidden">
        <AiAssistant onOpenSettings={appUiStore.openSettings} hidden={ui.presenting} />
      </div>
    </div>
  );
}
