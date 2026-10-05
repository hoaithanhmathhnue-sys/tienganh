'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bot, BookOpen, FileText, GraduationCap, Heart, MessageSquareText, MonitorPlay, Search, Sparkles, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { AiGeneratorPanel } from '@/components/ai/ai-generator-panel';
import { DailySlogan } from '@/components/slogan/daily-slogan';
import { PosterDialog } from '@/components/slogan/poster-dialog';
import { PracticeDialog } from '@/components/slogan/practice-dialog';
import { enterFullscreen, PresentationMode } from '@/components/slogan/presentation-mode';
import { SloganCard } from '@/components/slogan/slogan-card';
import { SpeechRateControl } from '@/components/slogan/speech-rate-control';
import { VisitCounter } from '@/components/visit-counter';
import { buttonClass } from '@/components/ui/button-class';
import { chatUiStore } from '@/lib/ai/chat-store';
import { appUiStore } from '@/lib/app-ui-store';
import { CLASSROOM_PHRASE_COUNT, classroomCategories, type ClassroomCategory } from '@/lib/classroom-english';
import { categories, sloganId, type Slogan, type SloganCategory } from '@/lib/slogans';
import { collectionStore, favoritesStore, useListStore, type CollectionItem } from '@/lib/stores';
import { cn } from '@/lib/utils';

type View = 'all' | 'favorites' | 'ai' | 'classroom' | (string & {});

type DisplayCategory = SloganCategory & { description?: string };

const TOTAL_SLOGANS = categories.reduce((sum, c) => sum + c.slogans.length, 0);
const ALL_SLOGANS: Slogan[] = categories.flatMap((c) => c.slogans);

const matches = (s: Slogan, query: string) =>
  !query || s.en.toLowerCase().includes(query) || s.vi.toLowerCase().includes(query) || s.ipa.toLowerCase().includes(query);

const removeFromCollection = (slogan: Slogan) => {
  collectionStore.remove(sloganId(slogan));
  toast.success('Đã xoá khỏi Bộ sưu tập AI');
};

interface PresentationState {
  slogans: Slogan[];
  start: number;
}

export default function SloganApp() {
  const [view, setView] = useState<View>('all');
  const [classroomTopic, setClassroomTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [posterSlogan, setPosterSlogan] = useState<Slogan | null>(null);
  const [practiceSlogan, setPracticeSlogan] = useState<Slogan | null>(null);
  const [presentation, setPresentation] = useState<PresentationState | null>(null);
  const contentRef = useRef<HTMLElement>(null);

  const favorites = useListStore(favoritesStore);
  const collection = useListStore(collectionStore);

  // Rời trang khi đang trình chiếu → trả lại Trợ lý AI cho các trang khác.
  useEffect(() => () => appUiStore.setPresenting(false), []);

  const deferredQuery = useDeferredValue(searchQuery);
  const query = deferredQuery.toLowerCase().trim();

  const groupedCategories = useMemo<DisplayCategory[]>(() => {
    if (view === 'favorites' || view === 'ai') return [];
    const source: DisplayCategory[] =
      view === 'classroom'
        ? classroomCategories.filter((c: ClassroomCategory) => classroomTopic === 'all' || c.id === classroomTopic)
        : categories.filter((c) => view === 'all' || c.id === view);
    return source
      .map((c) => ({ ...c, slogans: c.slogans.filter((s) => matches(s, query)) }))
      .filter((c) => c.slogans.length > 0);
  }, [view, query, classroomTopic]);

  const filteredFavorites = useMemo(() => favorites.filter((s) => matches(s, query)), [favorites, query]);
  const filteredCollection = useMemo(() => collection.filter((s) => matches(s, query)), [collection, query]);

  const visibleSlogans: Slogan[] = useMemo(() => {
    if (view === 'favorites') return filteredFavorites;
    if (view === 'ai') return filteredCollection;
    return groupedCategories.flatMap((c) => c.slogans);
  }, [view, filteredFavorites, filteredCollection, groupedCategories]);

  const present = (slogans: Slogan[], start = 0) => {
    if (slogans.length === 0) {
      toast.info('Chưa có slogan nào để trình chiếu.');
      return;
    }
    enterFullscreen();
    appUiStore.setPresenting(true);
    setPresentation({ slogans, start });
  };

  const closePresentation = () => {
    appUiStore.setPresenting(false);
    setPresentation(null);
  };

  const presentSingle = (slogan: Slogan) => {
    const idx = ALL_SLOGANS.findIndex((s) => sloganId(s) === sloganId(slogan));
    present(ALL_SLOGANS, Math.max(idx, 0));
  };

  const goTo = (next: View) => {
    setView(next);
    requestAnimationFrame(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const clearCollection = () => {
    if (collection.length === 0) return;
    if (window.confirm(`Xoá toàn bộ ${collection.length} slogan trong Bộ sưu tập AI? Thao tác này không thể hoàn tác.`)) {
      collectionStore.clear();
      toast.success('Đã xoá toàn bộ Bộ sưu tập AI');
    }
  };

  const tabs: { id: View; label: string }[] = [
    { id: 'all', label: '📋 Tất cả' },
    ...categories.map((c) => ({ id: c.id as View, label: `${c.icon} ${c.name}` })),
    { id: 'classroom', label: `🗣️ Câu lệnh lớp học (${CLASSROOM_PHRASE_COUNT})` },
    { id: 'favorites', label: `💛 Yêu thích (${favorites.length})` },
    { id: 'ai', label: `✨ AI & Bộ sưu tập (${collection.length})` },
  ];

  const resultCount = visibleSlogans.length;
  const unit = view === 'classroom' ? 'câu' : 'slogan';

  return (
    <div>
      {/* ─── HERO ─── */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/truong.jpg" alt="" fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-br from-[#00796B]/90 via-[#00695C]/85 to-[#004D40]/90" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1200px] px-4 pb-10 pt-6 md:pb-14 md:pt-8">

          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white/30 bg-white shadow-lg md:h-28 md:w-28">
              <Image src="/logo.jpg" alt="Logo Trường TH Bế Văn Đàn" fill sizes="112px" className="object-cover" priority />
            </div>
            <div className="text-center text-white md:text-left">
              <h1 className="font-display text-3xl font-extrabold tracking-tight drop-shadow-md md:text-5xl">
                English Classroom Decoration
              </h1>
              <p className="mt-1 text-lg font-semibold opacity-95 md:text-xl">Trường Tiểu học Bế Văn Đàn</p>
              <p className="mt-0.5 text-sm opacity-85 md:text-base">Be Van Dan Primary School — Phường An Khê, TP. Đà Nẵng</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur-sm">
                  <BookOpen className="h-4 w-4" aria-hidden="true" /> {categories.length} danh mục
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur-sm">
                  <GraduationCap className="h-4 w-4" aria-hidden="true" /> {TOTAL_SLOGANS} slogan
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur-sm">
                  <MessageSquareText className="h-4 w-4" aria-hidden="true" /> {CLASSROOM_PHRASE_COUNT} câu lệnh lớp học
                </span>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-5 max-w-2xl text-center text-base text-white/90 md:mx-0 md:text-left">
            Slogan và câu lệnh lớp học tiếng Anh dành cho giáo viên tiểu học — kèm phiên âm IPA, nghĩa tiếng Việt, luyện
            nói chấm điểm, xuất poster A4, trình chiếu lên bảng và Trợ lý AI Sư phạm.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap md:justify-start">
            <button type="button" onClick={() => goTo('ai')} className={buttonClass('accent', 'px-5 text-base')}>
              <Sparkles className="h-5 w-5" aria-hidden="true" /> Tạo slogan bằng AI
            </button>
            <button
              type="button"
              onClick={() => chatUiStore.open()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-base font-semibold text-[#1E3A8A] shadow-sm transition-all hover:bg-indigo-50 hover:shadow-md"
            >
              <Bot className="h-5 w-5" aria-hidden="true" /> Hỏi Trợ lý AI
            </button>
            <Link
              href="/giao-an"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-base font-semibold text-[#1E3A8A] shadow-sm transition-all hover:bg-indigo-50 hover:shadow-md"
            >
              <FileText className="h-5 w-5" aria-hidden="true" /> Soạn giáo án song ngữ
            </Link>
            <button
              type="button"
              onClick={() => present(ALL_SLOGANS)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 text-base font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <MonitorPlay className="h-5 w-5" aria-hidden="true" /> Trình chiếu
            </button>
          </div>
        </div>
      </header>

      {/* ─── SEARCH & TABS ─── */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-[1200px] px-4 py-3">
          <div className="mb-3 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="slogan-search" className="sr-only">
                Tìm kiếm slogan hoặc câu lệnh
              </label>
              <input
                id="slogan-search"
                type="search"
                placeholder="Tìm theo tiếng Anh, tiếng Việt hoặc IPA…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-muted/50 pl-10 pr-11 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40 [&::-webkit-search-cancel-button]:hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Xoá từ khoá"
                  className="absolute right-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <SpeechRateControl className="hidden shrink-0 md:flex" />
          </div>

          <nav aria-label="Danh mục slogan" className="-mx-4 overflow-x-auto px-4 scrollbar-none">
            <div className="flex gap-2 pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setView(tab.id)}
                  aria-current={view === tab.id ? 'page' : undefined}
                  className={cn(
                    'min-h-11 shrink-0 whitespace-nowrap rounded-xl px-4 text-sm font-medium transition-all duration-200',
                    view === tab.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
                    tab.id === 'ai' && view !== 'ai' && 'text-amber-800 dark:text-amber-300',
                    tab.id === 'classroom' && view !== 'classroom' && 'text-indigo-800 dark:text-indigo-300',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <main ref={contentRef} className="mx-auto max-w-[1200px] scroll-mt-32 px-4 py-8">
        {view === 'all' && !query && (
          <div className="mb-10">
            <DailySlogan onPoster={setPosterSlogan} onPresent={presentSingle} />
          </div>
        )}

        {view === 'ai' && (
          <div className="mb-10">
            <AiGeneratorPanel onOpenSettings={appUiStore.openSettings} />
          </div>
        )}

        {view === 'classroom' && (
          <div className="mb-8 rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-card to-sky-50 p-5 dark:border-indigo-500/30 dark:from-indigo-950/40 dark:to-sky-950/20 md:p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold md:text-2xl">
              <MessageSquareText className="h-6 w-6 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />
              Ngân hàng câu lệnh lớp học
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {CLASSROOM_PHRASE_COUNT} câu Classroom English thông dụng cho giáo viên và học sinh tiểu học — nghe mẫu, luyện nói chấm
              điểm, in poster hoặc trình chiếu lên bảng.
            </p>
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Lọc theo tình huống">
              {[{ id: 'all', icon: '✨', name: 'Tất cả' }, ...classroomCategories].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setClassroomTopic(c.id)}
                  aria-pressed={classroomTopic === c.id}
                  className={cn(
                    'min-h-11 rounded-full border px-4 text-sm font-medium transition-colors',
                    classroomTopic === c.id
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                      : 'border-border bg-card hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10',
                  )}
                >
                  <span aria-hidden="true">{c.icon}</span> {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {view === 'ai' ? 'Bộ sưu tập AI: ' : 'Hiển thị '}
            <span className="font-semibold text-primary">{resultCount}</span> {unit}
            {query ? ` cho “${deferredQuery.trim()}”` : ''}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <SpeechRateControl className="md:hidden" />
            {view === 'ai' && collection.length > 0 && (
              <button type="button" onClick={clearCollection} className={buttonClass('danger', 'text-sm')}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Xoá tất cả
              </button>
            )}
            {resultCount > 0 && (
              <button type="button" onClick={() => present(visibleSlogans)} className={buttonClass('secondary', 'text-sm')}>
                <MonitorPlay className="h-4 w-4" aria-hidden="true" /> Trình chiếu danh sách này
              </button>
            )}
          </div>
        </div>

        {view === 'favorites' || view === 'ai' ? (
          resultCount === 0 ? (
            <EmptyState
              icon={view === 'favorites' ? Heart : Sparkles}
              title={
                query
                  ? 'Không tìm thấy slogan phù hợp.'
                  : view === 'favorites'
                    ? 'Chưa có slogan yêu thích.'
                    : 'Bộ sưu tập AI đang trống.'
              }
              hint={
                query
                  ? 'Thử từ khoá khác nhé!'
                  : view === 'favorites'
                    ? 'Bấm biểu tượng trái tim trên mỗi slogan để lưu lại dùng sau.'
                    : 'Nhập chủ đề ở trên và bấm “Tạo slogan” — kết quả sẽ được lưu tại đây.'
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {visibleSlogans.map((s, idx) => (
                <SloganCard
                  key={sloganId(s)}
                  slogan={s}
                  index={idx}
                  topic={view === 'ai' ? (s as CollectionItem).topic : undefined}
                  onPoster={setPosterSlogan}
                  onPractice={setPracticeSlogan}
                  onRemove={view === 'ai' ? removeFromCollection : undefined}
                />
              ))}
            </div>
          )
        ) : groupedCategories.length === 0 ? (
          <EmptyState icon={Search} title={`Không tìm thấy ${unit} nào.`} hint="Thử từ khoá khác nhé!" />
        ) : (
          <div className="space-y-12">
            {groupedCategories.map((cat) => (
              <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
                <h2 id={`cat-${cat.id}`} className="flex flex-wrap items-center gap-2 font-display text-xl font-bold md:text-2xl">
                  <span className="text-2xl" aria-hidden="true">
                    {cat.icon}
                  </span>
                  {cat.name}
                  <span className="text-sm font-normal text-muted-foreground">({cat.slogans.length} câu)</span>
                </h2>
                {cat.description && <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>}
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {cat.slogans.map((s, idx) => (
                    <SloganCard key={sloganId(s)} slogan={s} index={idx} onPoster={setPosterSlogan} onPractice={setPracticeSlogan} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#00695C] text-white">
        <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-8 md:pb-8">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white">
              <Image src="/logo.jpg" alt="Logo Trường TH Bế Văn Đàn" fill sizes="56px" className="object-cover" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-lg font-semibold">Trường Tiểu học Bế Văn Đàn</p>
              <p className="text-sm text-white/85">Be Van Dan Primary School — Phường An Khê, TP. Đà Nẵng</p>
              <p className="mt-1 text-xs text-white/75">Ứng dụng hỗ trợ giáo viên tiếng Anh trang trí lớp học</p>
            </div>
          </div>
          <div className="mt-6 border-t border-white/20 pt-4">
            <VisitCounter />
            <p className="mt-3 text-center text-xs text-white/70">© 2024 – 2026 Trường TH Bế Văn Đàn. Thiết kế phục vụ giáo dục.</p>
          </div>
        </div>
      </footer>

      <PosterDialog slogan={posterSlogan} onClose={() => setPosterSlogan(null)} />
      <PracticeDialog slogan={practiceSlogan} onClose={() => setPracticeSlogan(null)} />
      {presentation && (
        <PresentationMode
          slogans={presentation.slogans}
          startIndex={presentation.start}
          onClose={closePresentation}
        />
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, hint }: { icon: typeof Search; title: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border px-6 py-16 text-center">
      <Icon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
      <p className="text-lg font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}
