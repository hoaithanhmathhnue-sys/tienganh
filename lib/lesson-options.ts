/** Lựa chọn cấu hình cho Trợ lý Soạn Giáo án Song ngữ. */

export const GRADES = ['1', '2', '3', '4', '5'] as const;
export type Grade = (typeof GRADES)[number];

export interface SubjectOption {
  id: string;
  vi: string;
  en: string;
}

export const SUBJECTS: SubjectOption[] = [
  { id: 'math', vi: 'Toán học', en: 'Mathematics' },
  { id: 'vietnamese', vi: 'Tiếng Việt', en: 'Vietnamese' },
  { id: 'nature-society', vi: 'Tự nhiên và Xã hội', en: 'Nature and Society' },
  { id: 'science', vi: 'Khoa học', en: 'Science' },
  { id: 'history-geography', vi: 'Lịch sử và Địa lí', en: 'History and Geography' },
  { id: 'ethics', vi: 'Đạo đức', en: 'Ethics' },
  { id: 'music', vi: 'Âm nhạc', en: 'Music' },
  { id: 'art', vi: 'Mĩ thuật', en: 'Fine Arts' },
  { id: 'pe', vi: 'Giáo dục thể chất', en: 'Physical Education' },
  { id: 'it-tech', vi: 'Tin học và Công nghệ', en: 'Informatics and Technology' },
  { id: 'experiential', vi: 'Hoạt động trải nghiệm', en: 'Experiential Activities' },
  { id: 'english', vi: 'Tiếng Anh', en: 'English' },
];

export type EnglishLevel = 1 | 2 | 3;

export interface LevelOption {
  id: EnglishLevel;
  label: string;
  description: string;
}

export const ENGLISH_LEVELS: LevelOption[] = [
  { id: 1, label: 'Level 1 – Basic', description: 'Câu ngắn, đơn giản, dễ thuộc, dễ dùng ngay.' },
  { id: 2, label: 'Level 2 – Developing', description: 'Câu tự nhiên hơn, có tương tác và câu hỏi ngắn.' },
  { id: 3, label: 'Level 3 – Confident', description: 'Câu linh hoạt, giải thích, mở rộng phản biện.' },
];

export type OutputMode = 'A' | 'B' | 'C';

export interface ModeOption {
  id: OutputMode;
  label: string;
  description: string;
}

export const OUTPUT_MODES: ModeOption[] = [
  { id: 'A', label: 'Mode A – Teacher Talk', description: 'Giữ giáo án tiếng Việt, chèn câu lệnh tiếng Anh vào từng hoạt động' },
  { id: 'B', label: 'Mode B – Bilingual', description: 'Song ngữ Anh – Việt song song' },
  { id: 'C', label: 'Mode C – English-led', description: 'Tiếng Anh là chính, chú thích tiếng Việt' },
];

export interface LessonSettings {
  grade: Grade;
  subjectId: string;
  duration: string;
  level: EnglishLevel;
  mode: OutputMode;
}

export const DEFAULT_LESSON_SETTINGS: LessonSettings = {
  grade: '3',
  subjectId: 'math',
  duration: '35 phút',
  level: 1,
  mode: 'B',
};

export const MAX_DURATION_LENGTH = 40;

export const getSubject = (id: string): SubjectOption => SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[0];

export const isLessonSettings = (value: unknown): value is LessonSettings => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    (GRADES as readonly unknown[]).includes(v.grade) &&
    typeof v.subjectId === 'string' &&
    typeof v.duration === 'string' &&
    (v.level === 1 || v.level === 2 || v.level === 3) &&
    (v.mode === 'A' || v.mode === 'B' || v.mode === 'C')
  );
};
