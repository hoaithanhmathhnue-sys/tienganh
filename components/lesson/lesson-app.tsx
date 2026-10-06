'use client';

import { useRef, useState } from 'react';
import { BookOpen, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { LessonForm, type LessonFormError } from '@/components/lesson/lesson-form';
import { LessonHistory } from '@/components/lesson/lesson-history';
import { LessonProgress } from '@/components/lesson/lesson-progress';
import { LessonResult } from '@/components/lesson/lesson-result';
import { FALLBACK_NOTICE, getFriendlyErrorMessage, parseApiError } from '@/lib/ai/errors';
import { generateLessonPlan, type LessonStage } from '@/lib/ai/lesson-plan';
import { getActiveApiKey, getActiveModel } from '@/lib/ai/settings';
import { isAiReady, useAiSettings } from '@/lib/ai/settings-store';
import { appUiStore } from '@/lib/app-ui-store';
import { DEFAULT_LESSON_SETTINGS, type LessonSettings } from '@/lib/lesson-options';
import { createSavedLesson, saveLessonPlan, type SavedLessonPlan } from '@/lib/lesson-store';

const INITIAL_STAGE: LessonStage = 'analyzing';

export function LessonApp() {
  const aiSettings = useAiSettings();
  const [settings, setSettings] = useState<LessonSettings>(DEFAULT_LESSON_SETTINGS);
  const [source, setSource] = useState('');
  const [formError, setFormError] = useState<LessonFormError | null>(null);
  const [generating, setGenerating] = useState(false);
  const [stage, setStage] = useState<LessonStage>(INITIAL_STAGE);
  const [receivedChars, setReceivedChars] = useState(0);
  const [savedLesson, setSavedLesson] = useState<SavedLessonPlan | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const resetProgress = () => {
    setStage(INITIAL_STAGE);
    setReceivedChars(0);
  };

  const createLesson = async () => {
    setFormError(null);
    if (!isAiReady(aiSettings)) {
      setFormError({ message: 'Thầy/Cô cần hoàn tất Cài đặt AI trước khi soạn giáo án song ngữ.', canOpenSettings: true });
      return;
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setGenerating(true);
    resetProgress();
    try {
      const result = await generateLessonPlan(settings, source, {
        provider: aiSettings.provider,
        apiKey: getActiveApiKey(aiSettings),
        selectedModel: getActiveModel(aiSettings),
        signal: controller.signal,
        onProgress: (nextStage, chars) => { setStage(nextStage); setReceivedChars(chars); },
        onFallback: () => toast.info(FALLBACK_NOTICE),
      });
      if (result.status === 'aborted') {
        toast.info('Đã huỷ soạn giáo án. Nội dung giáo án gốc vẫn được giữ lại.');
        return;
      }
      const nextSavedLesson = createSavedLesson(result.plan, settings, result.model);
      saveLessonPlan(nextSavedLesson);
      setSavedLesson(nextSavedLesson);
      toast.success('Đã soạn xong giáo án song ngữ', { description: 'Model: ' + result.model });
    } catch (error) {
      setFormError({ message: getFriendlyErrorMessage(parseApiError(error), aiSettings.provider), canOpenSettings: true });
    } finally {
      if (abortControllerRef.current === controller) abortControllerRef.current = null;
      setGenerating(false);
    }
  };

  const cancelGeneration = () => abortControllerRef.current?.abort();
  const restart = () => { setSavedLesson(null); setFormError(null); resetProgress(); };
  const openSavedLesson = (item: SavedLessonPlan) => { setSettings(item.settings); setSavedLesson(item); setFormError(null); resetProgress(); };

  return (
    <main className="mx-auto w-full max-w-[1200px] px-3 py-6 sm:px-4 sm:py-8">
      <header className="mb-6 rounded-3xl bg-gradient-to-br from-[#0B1736] via-[#1E3A8A] to-[#4338CA] px-5 py-7 text-white shadow-lg sm:px-8 sm:py-10">
        <div className="flex max-w-3xl items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 sm:h-14 sm:w-14"><BookOpen className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" /></span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-100">Trợ lý giáo án</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-4xl">Soạn giáo án song ngữ Anh – Việt</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-indigo-100 sm:text-base">Tải hoặc dán Kế hoạch bài dạy, chọn mức tiếng Anh phù hợp và để AI tạo giáo án có thể xem, in hoặc xuất Word.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-white/90">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> AI theo cấu hình riêng</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"><FileText className="h-3.5 w-3.5" aria-hidden="true" /> Xuất Word và in/PDF</span>
        </div>
      </header>

      {savedLesson ? <LessonResult saved={savedLesson} onRestart={restart} /> : generating ? <LessonProgress stage={stage} receivedChars={receivedChars} onCancel={cancelGeneration} /> : (
        <div className="space-y-5">
          <LessonForm settings={settings} onSettingsChange={setSettings} source={source} onSourceChange={setSource} error={formError} onDismissError={() => setFormError(null)} onOpenSettings={appUiStore.openSettings} onSubmit={() => void createLesson()} />
          <LessonHistory onOpen={openSavedLesson} />
        </div>
      )}
    </main>
  );
}
