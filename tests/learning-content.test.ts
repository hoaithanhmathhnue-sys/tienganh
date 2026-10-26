import { describe, expect, it } from 'vitest';
import { DAILY_SCHOOL_GROUPS } from '@/lib/daily-school-english';
import { getDailySchoolSet, LEARNING_SUBJECTS, SELF_STUDY_PHRASES } from '@/lib/learning-content';
import { EXTRA_LEARNING_PHRASES } from '@/lib/learning-phrases-extra';

describe('self-study categories', () => {
  it('has the ten learning categories shown in the self-study screen', () => {
    expect(LEARNING_SUBJECTS.map((subject) => subject.id)).toEqual([
      'greetings',
      'classroom',
      'games',
      'math',
      'vietnamese',
      'art',
      'music',
      'pe',
      'history-geography',
      'science',
    ]);
  });

  it('provides practice phrases for every category', () => {
    expect(LEARNING_SUBJECTS.every((subject) => SELF_STUDY_PHRASES.some((phrase) => phrase.subjectId === subject.id))).toBe(true);
  });


  it('provides at least twenty phrases for every category', () => {
    for (const subject of LEARNING_SUBJECTS) {
      const phrases = SELF_STUDY_PHRASES.filter((phrase) => phrase.subjectId === subject.id);

      expect(phrases.length).toBeGreaterThanOrEqual(20);
      expect(phrases.every((phrase) => phrase.subject === subject.label && phrase.context && phrase.en && phrase.ipa && phrase.vi)).toBe(true);
    }
  });

  it('uses unique persistent identifiers for practice phrases', () => {
    const phraseIds = SELF_STUDY_PHRASES.map((phrase) => phrase.id);

    expect(new Set(phraseIds)).toHaveLength(phraseIds.length);
  });
});

describe('bổ sung nội dung tự học', () => {
  it('có ít nhất 620 mẫu câu, mỗi câu có IPA bọc trong /…/', () => {
    expect(SELF_STUDY_PHRASES.length).toBeGreaterThanOrEqual(620);
    for (const phrase of SELF_STUDY_PHRASES) expect(phrase.ipa).toMatch(/^\/.+\/$/);
  });

  it('không trùng câu tiếng Anh trong cùng một môn', () => {
    for (const subject of LEARNING_SUBJECTS) {
      const keys = SELF_STUDY_PHRASES.filter((p) => p.subjectId === subject.id).map((p) => p.en.toLowerCase().replace(/[^a-z]/g, ''));
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('IPA sinh tự động không còn từ chưa phiên âm (chữ cái Latin thường liền nhau ngoài bảng IPA)', () => {
    for (const phrase of EXTRA_LEARNING_PHRASES) expect(phrase[3]).not.toMatch(/\b(?:qr|maths|colours)\b/);
  });
});

describe('Daily School English', () => {
  it('có 10 nhóm tình huống, mỗi nhóm 5 câu đủ en / ipa / vi / tình huống', () => {
    expect(DAILY_SCHOOL_GROUPS).toHaveLength(10);
    for (const group of DAILY_SCHOOL_GROUPS) {
      expect(group.phrases).toHaveLength(5);
      for (const phrase of group.phrases) {
        expect(phrase.en && phrase.vi && phrase.situation).toBeTruthy();
        expect(phrase.ipa).toMatch(/^\/[^/]+\/$/);
      }
    }
  });

  it('bộ câu của ngày cố định trong ngày và lấy từ các nhóm Daily School English', () => {
    const day = new Date(2026, 9, 26, 8);
    const set = getDailySchoolSet(day);
    expect(set).toEqual(getDailySchoolSet(new Date(2026, 9, 26, 20)));
    expect(set.phrases).toHaveLength(3);
    expect(DAILY_SCHOOL_GROUPS.some((group) => group.id === set.id)).toBe(true);
    expect(new Set(set.phrases.map((p) => p.id)).size).toBe(3);
  });
});
