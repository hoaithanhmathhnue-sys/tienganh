import { describe, expect, it } from 'vitest';
import { LEARNING_SUBJECTS, SELF_STUDY_PHRASES } from '@/lib/learning-content';

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
