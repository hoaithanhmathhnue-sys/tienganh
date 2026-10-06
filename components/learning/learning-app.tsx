'use client';

import { useMemo, useRef, useState } from 'react';
import { Award, BookOpenCheck, Check, ChevronRight, Flame, GraduationCap, LayoutDashboard, Mic, RotateCcw, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { SpeakButton } from '@/components/slogan/speak-button';
import { SpeechRateControl } from '@/components/slogan/speech-rate-control';
import { buttonClass } from '@/components/ui/button-class';
import { DAILY_SCHOOL_TOPICS, getDailySchoolSet, LEARNING_SUBJECTS, SELF_STUDY_PHRASES, type LearningPhrase } from '@/lib/learning-content';
import { getBadges, learningProgressStore, useLearningProgress } from '@/lib/learning-progress';
import { getPronunciationFeedback, scoreBestAlternative, type PronunciationResult } from '@/lib/pronunciation';
import { speechManager } from '@/lib/speech';
import { getRecognitionErrorMessage, recognizeOnce, SpeechRecognitionFailure, useSpeechRecognitionSupported, type RecognitionErrorCode } from '@/lib/speech-recognition';
import { cn } from '@/lib/utils';

type LearningTab = 'progress' | 'study' | 'pronunciation' | 'daily';
type PracticeState = { status: 'idle' } | { status: 'listening' } | { status: 'result'; result: PronunciationResult } | { status: 'error'; code: RecognitionErrorCode };

const TAB_ITEMS: { id: LearningTab; label: string; short: string; icon: typeof LayoutDashboard }[] = [
  { id: 'progress', label: 'Tiến trình', short: 'Tiến trình', icon: LayoutDashboard },
  { id: 'study', label: 'Tự học', short: 'Tự học', icon: BookOpenCheck },
  { id: 'pronunciation', label: 'Luyện phát âm', short: 'Phát âm', icon: Mic },
  { id: 'daily', label: 'Daily School English', short: 'Daily', icon: GraduationCap },
];

const cardClass = 'rounded-2xl border border-border bg-card shadow-sm';

export function LearningApp() {
  const [tab, setTab] = useState<LearningTab>('progress');
  const progress = useLearningProgress();
  const badges = getBadges(progress);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-3 py-6 sm:px-4 sm:py-8">
      <header className="rounded-3xl bg-gradient-to-br from-[#10205a] via-[#243d95] to-[#172465] px-5 py-7 text-white shadow-lg sm:px-8 sm:py-9">
        <p className="inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">Learning hub</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Học tập tiếng Anh cùng lớp học</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100 sm:text-base">Tự học mẫu câu theo môn, luyện phát âm, hoàn thành thử thách mỗi ngày và theo dõi tiến trình của thầy/cô.</p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-white/10 px-3 py-1.5"><Flame className="mr-1 inline h-4 w-4 text-amber-300" /> {progress.currentStreak} ngày liên tiếp</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5"><Sparkles className="mr-1 inline h-4 w-4 text-amber-300" /> {progress.xp} XP</span>
        </div>
      </header>

      <nav aria-label="Các tính năng học tập" className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm sm:grid-cols-4">
        {TAB_ITEMS.map(({ id, label, short, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined} className={cn('flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors', tab === id ? 'bg-[#1d3d92] text-white shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
            <Icon className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">{label}</span><span className="sm:hidden">{short}</span>
          </button>
        ))}
      </nav>

      <section className="mt-5">
        {tab === 'progress' && <ProgressPanel badges={badges} />}
        {tab === 'study' && <SelfStudyPanel />}
        {tab === 'pronunciation' && <PronunciationPanel />}
        {tab === 'daily' && <DailySchoolPanel />}
      </section>
    </main>
  );
}

function ProgressPanel({ badges }: { badges: ReturnType<typeof getBadges> }) {
  const progress = useLearningProgress();
  const stats = [
    { label: 'Chuỗi tự học', value: progress.currentStreak + ' ngày', note: 'Học đều để giữ nhịp', icon: Flame, color: 'text-orange-600' },
    { label: 'Mẫu câu đã học', value: progress.learnedPhraseIds.length + ' câu', note: 'Tự học theo môn', icon: BookOpenCheck, color: 'text-emerald-600' },
    { label: 'Bài phát âm tốt', value: Object.values(progress.pronunciationScores).filter((score) => score >= 85).length + ' bài', note: 'Từ 85 điểm trở lên', icon: Mic, color: 'text-violet-600' },
    { label: 'Điểm kinh nghiệm', value: progress.xp + ' XP', note: 'Mỗi hoạt động đều có điểm', icon: Sparkles, color: 'text-amber-600' },
  ];
  return <div className="space-y-5">
    <div className="rounded-3xl bg-gradient-to-r from-[#a43b00] to-[#8f3100] p-5 text-white shadow-lg sm:p-6"><p className="text-xs font-bold uppercase tracking-wide text-amber-100">Learning progress & badges</p><h2 className="mt-1 font-display text-2xl font-extrabold">Tiến trình & huy hiệu tự học</h2><p className="mt-1 text-sm text-amber-50">Theo dõi chuỗi ngày tự học, mẫu câu đã học, kết quả phát âm và huy hiệu đã mở khóa.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{stats.map(({ label, value, note, icon: Icon, color }) => <article key={label} className={cardClass + ' p-4'}><div className="flex items-center justify-between text-xs text-muted-foreground"><span>{label}</span><Icon className={cn('h-4 w-4', color)} /></div><p className="mt-2 font-display text-2xl font-extrabold text-foreground">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></article>)}</div>
    <section className={cardClass + ' p-4 sm:p-6'}><div className="flex items-center gap-2"><Award className="h-5 w-5 text-amber-500" /><div><h2 className="font-display text-lg font-bold">Bộ sưu tập huy hiệu</h2><p className="text-xs text-muted-foreground">Các mốc được mở khóa dựa trên hoạt động thực tế.</p></div></div><div className="mt-4 grid gap-3 md:grid-cols-2">{badges.map((badge) => <article key={badge.id} className={cn('rounded-2xl border p-4', badge.unlocked ? 'border-amber-300 bg-amber-50/70 dark:bg-amber-500/10' : 'border-border bg-muted/30')}><div className="flex gap-3"><span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl', badge.unlocked ? 'bg-amber-400' : 'bg-slate-200 opacity-60 dark:bg-slate-700')}>{badge.unlocked ? badge.icon : '🔒'}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="text-sm font-bold">{badge.title}</h3><span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{badge.unlocked ? 'Đã đạt' : 'Đang thực hiện'}</span></div><p className="mt-1 text-xs text-muted-foreground">{badge.description}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className={cn('h-full rounded-full', badge.unlocked ? 'bg-amber-500' : 'bg-slate-400')} style={{ width: (badge.progress / badge.target) * 100 + '%' }} /></div><p className="mt-1 text-right text-[10px] font-semibold text-muted-foreground">{badge.progress}/{badge.target}</p></div></div></article>)}</div></section>
  </div>;
}

function SelfStudyPanel() {
  const progress = useLearningProgress();
  const [subject, setSubject] = useState('all');
  const [query, setQuery] = useState('');
  const phrases = useMemo(() => SELF_STUDY_PHRASES.filter((phrase) => (subject === 'all' || phrase.subjectId === subject) && [phrase.en, phrase.vi, phrase.context].join(' ').toLowerCase().includes(query.trim().toLowerCase())), [query, subject]);
  return <div className="space-y-5"><header className="rounded-3xl bg-gradient-to-r from-[#173683] to-[#284ba5] p-5 text-white sm:p-6"><p className="text-xs font-bold uppercase tracking-wide text-indigo-100">My English for school</p><h2 className="mt-1 font-display text-2xl font-extrabold">Tự học mẫu câu theo môn học</h2><p className="mt-1 text-sm text-indigo-100">Chọn môn, nghe mẫu câu và đánh dấu sau khi đã học.</p></header><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{[{ id: 'all', label: 'Tất cả môn học', icon: '✨' }, ...LEARNING_SUBJECTS].map((item) => <button key={item.id} type="button" onClick={() => setSubject(item.id)} className={cn('rounded-xl border p-3 text-left transition-colors', subject === item.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-muted')}><span className="text-lg">{item.icon}</span><span className="ml-2 text-sm font-semibold">{item.label}</span></button>)}</div><label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tiếng Anh, tiếng Việt hoặc tình huống…" className="min-h-11 w-full rounded-xl border border-input bg-card py-2 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label><p className="text-sm text-muted-foreground">Hiển thị <strong className="text-foreground">{phrases.length}</strong> mẫu câu.</p><div className="grid gap-3 md:grid-cols-2">{phrases.map((phrase) => <PhraseCard key={phrase.id} phrase={phrase} completed={progress.learnedPhraseIds.includes(phrase.id)} onComplete={() => { learningProgressStore.markPhraseLearned(phrase.id); toast.success('Đã thêm 10 XP', { description: 'Mẫu câu đã được lưu vào tiến trình tự học.' }); }} />)}</div></div>;
}

function PhraseCard({ phrase, completed, onComplete }: { phrase: LearningPhrase; completed: boolean; onComplete: () => void }) {
  return <article className={cardClass + ' p-4'}><div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">{phrase.subject}</span><p lang="en" className="mt-3 font-display text-lg font-bold text-foreground">“{phrase.en}”</p><p className="mt-1 text-sm text-muted-foreground">{phrase.vi}</p><p className="mt-2 font-mono text-xs text-primary">{phrase.ipa}</p></div><span className="rounded-lg bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">{phrase.context}</span></div><div className="mt-4 flex flex-wrap gap-2"><SpeakButton text={phrase.en} /><button type="button" onClick={onComplete} disabled={completed} className={buttonClass(completed ? 'secondary' : 'primary', 'text-sm')}>{completed ? <><Check className="h-4 w-4" /> Đã học</> : <><BookOpenCheck className="h-4 w-4" /> Đánh dấu đã học</>}</button></div></article>;
}

function PronunciationPanel() {
  const supported = useSpeechRecognitionSupported();
  const progress = useLearningProgress();
  const [selectedId, setSelectedId] = useState(SELF_STUDY_PHRASES[0].id);
  const [state, setState] = useState<PracticeState>({ status: 'idle' });
  const controllerRef = useRef<AbortController | null>(null);
  const phrase = SELF_STUDY_PHRASES.find((item) => item.id === selectedId) ?? SELF_STUDY_PHRASES[0];
  const start = async () => {
    speechManager.stop();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ status: 'listening' });
    try {
      const alternatives = await recognizeOnce({ lang: 'en-US', maxAlternatives: 3, signal: controller.signal });
      const result = scoreBestAlternative(phrase.en, alternatives);
      learningProgressStore.recordPronunciation(phrase.id, result.score);
      setState({ status: 'result', result });
      toast.success('Đã chấm phát âm', { description: getPronunciationFeedback(result.score).message });
    } catch (error) {
      const code = error instanceof SpeechRecognitionFailure ? error.code : 'unknown';
      setState(code === 'aborted' ? { status: 'idle' } : { status: 'error', code });
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  };
  const listening = state.status === 'listening';

  return (
    <div className="space-y-5">
      <header className="rounded-3xl bg-gradient-to-r from-[#6d13af] to-[#30318b] p-5 text-white shadow-lg sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-violet-100">Teacher speaking lab</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold">Phòng luyện phát âm & phản xạ</h2>
        <p className="mt-1 text-sm text-violet-100">Nghe mẫu, đọc vào micro và nhận điểm dựa trên câu mà trình duyệt nhận diện được.</p>
      </header>
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <section className={cardClass + ' p-4'}>
          <h3 className="font-bold">Chọn câu tiếng Anh luyện tập</h3>
          <div className="mt-3 max-h-[430px] space-y-2 overflow-y-auto pr-1">
            {SELF_STUDY_PHRASES.map((item) => (
              <button key={item.id} type="button" onClick={() => { setSelectedId(item.id); setState({ status: 'idle' }); }} className={cn('w-full rounded-xl border p-3 text-left', item.id === phrase.id ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/15' : 'border-border hover:bg-muted')}>
                <p lang="en" className="text-sm font-bold">“{item.en}”</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.vi}</p>
              </button>
            ))}
          </div>
        </section>
        <section className={cardClass + ' flex min-h-[430px] flex-col items-center justify-center p-5 text-center sm:p-8'}>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">{phrase.subject} · basic</span>
          <p lang="en" className="mt-4 max-w-2xl font-display text-3xl font-extrabold leading-tight sm:text-4xl">“{phrase.en}”</p>
          <p className="mt-2 text-sm text-muted-foreground">Nghĩa: {phrase.vi}</p>
          <p className="mt-2 font-mono text-sm text-primary">{phrase.ipa}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2"><SpeakButton text={phrase.en} /><SpeechRateControl /></div>
          <div className="my-6 h-px w-full bg-border" />
          {!supported ? (
            <p role="alert" className="max-w-md rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">{getRecognitionErrorMessage('unsupported')}</p>
          ) : (
            <>
              <button type="button" onClick={listening ? () => controllerRef.current?.abort() : () => void start()} className={cn('flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105', listening ? 'bg-rose-500' : 'bg-violet-600')} aria-label={listening ? 'Dừng ghi âm' : 'Bắt đầu luyện phát âm'}>
                {listening ? <RotateCcw className="h-8 w-8 animate-spin" /> : <Mic className="h-9 w-9" />}
              </button>
              <p className="mt-3 text-sm text-muted-foreground">{listening ? 'Đang nghe… bấm lại để dừng.' : 'Bấm micro rồi đọc câu tiếng Anh.'}</p>
            </>
          )}
          {state.status === 'result' && <PronunciationFeedback result={state.result} best={progress.pronunciationScores[phrase.id] ?? 0} />}
          {state.status === 'error' && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-200">{getRecognitionErrorMessage(state.code)}</p>}
        </section>
      </div>
    </div>
  );
}

function PronunciationFeedback({ result, best }: { result: PronunciationResult; best: number }) { const feedback = getPronunciationFeedback(result.score); return <div className="mt-5 max-w-lg rounded-2xl bg-muted/60 p-4"><p className="font-display text-2xl font-extrabold">{feedback.emoji} {result.score}/100</p><p className="mt-1 text-sm font-semibold">{feedback.title}</p><p className="mt-1 text-sm text-muted-foreground">{feedback.message}</p><p className="mt-3 text-xs text-muted-foreground">Câu nhận diện: “{result.transcript || 'Chưa nhận diện được'}” · Điểm cao nhất: {best}/100</p></div>; }

function DailySchoolPanel() {
  const progress = useLearningProgress();
  const daily = getDailySchoolSet();
  return <div className="space-y-5"><header className="rounded-3xl bg-gradient-to-r from-[#091b51] to-[#1d428e] p-5 text-white shadow-lg sm:p-6"><p className="text-xs font-bold uppercase tracking-wide text-amber-200">Daily school English</p><h2 className="mt-1 font-display text-2xl font-extrabold">Giao tiếp học đường mỗi ngày</h2><p className="mt-1 max-w-2xl text-sm text-indigo-100">Mỗi ngày có ba mẫu câu mới theo một tình huống lớp học. Hoàn thành để tích lũy XP và huy hiệu.</p></header><section className="rounded-3xl border border-emerald-700/30 bg-emerald-950 p-4 text-white shadow-sm sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-emerald-200">Today’s English</p><h3 className="mt-1 font-display text-xl font-bold">{daily.icon} {daily.title}</h3><p className="mt-1 text-sm text-emerald-100">{daily.description}</p></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{progress.completedDailyPhraseIds.filter((id) => daily.phrases.some((phrase) => phrase.id === id)).length}/{daily.phrases.length} hoàn thành</span></div><div className="mt-4 grid gap-3 md:grid-cols-3">{daily.phrases.map((phrase) => <article key={phrase.id} className="rounded-2xl border border-emerald-400/30 bg-white/10 p-4"><p lang="en" className="font-display text-base font-bold">“{phrase.en}”</p><p className="mt-1 text-sm text-emerald-100">{phrase.vi}</p><div className="mt-4 flex gap-2"><SpeakButton text={phrase.en} variant="onDark" showLabel={false} /><button type="button" onClick={() => { learningProgressStore.markDailyCompleted(phrase.id); toast.success('Đã hoàn thành mẫu câu hằng ngày', { description: '+15 XP' }); }} disabled={progress.completedDailyPhraseIds.includes(phrase.id)} className={cn('min-h-11 flex-1 rounded-xl px-3 text-sm font-semibold transition-colors', progress.completedDailyPhraseIds.includes(phrase.id) ? 'bg-white/15 text-white/70' : 'bg-amber-400 text-amber-950 hover:bg-amber-300')}>{progress.completedDailyPhraseIds.includes(phrase.id) ? 'Đã học' : 'Hoàn thành'}</button></div></article>)}</div></section><section className={cardClass + ' p-4 sm:p-6'}><div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /><div><h3 className="font-display text-lg font-bold">Chủ đề giao tiếp học đường</h3><p className="text-xs text-muted-foreground">Kho câu lệnh có sẵn trong ứng dụng, sắp theo tình huống thực tế.</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{DAILY_SCHOOL_TOPICS.map((topic) => <article key={topic.id} className="rounded-2xl border border-border bg-background p-4"><div className="flex items-start gap-3"><span className="text-2xl">{topic.icon}</span><div><h4 className="font-bold">{topic.name}</h4><p className="mt-1 text-xs text-muted-foreground">{topic.description}</p><p className="mt-3 text-xs font-semibold text-primary">{topic.count} mẫu câu <ChevronRight className="inline h-3.5 w-3.5" /></p></div></div></article>)}</div></section></div>;
}
